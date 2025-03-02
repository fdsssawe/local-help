"use client";

import { useEffect, useState } from "react";
import type { Post } from "~/types";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Spinner from "./ui/spinner";
import { Button } from "./ui/button";
import ChatWindow from "./chat";
import { useUser } from "@clerk/nextjs";

export function GetLocal() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const { user } = useUser();
  const [activeChat, setActiveChat] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        setLocation({ latitude, longitude });
      });
    }
  }, []);

  const { data: latestPost, isLoading } = api.post.getNearbyPosts.useQuery(
    {
      latitude: location?.latitude.toString() ?? "0",
      longitude: location?.longitude.toString() ?? "0",
    },
    {
      enabled: !!location, // Only run the query if location is available
    }
  );

  const { mutate: startConversation, status } = api.chat.startChat.useMutation({
    onSuccess: (data) => {
      if (data?.id) setActiveChat(data.id.toString());
    },
  });

  const handleRespond = (post: Post) => {
    if (!user) return;
    startConversation({
      post_id: post.id?.toString() ?? "",
      receiver_id: post.userId ?? "",
    });
  };

  return (
    <div className="w-full lg:max-w-[600px] flex flex-col gap-4 text-center">
      {isLoading || !location ? (
        <div className="w-full h-40 flex justify-center items-center">
          <Spinner size="10" className="text-primary" />
        </div>
      ) : latestPost && latestPost.rows.length > 0 ? (
        (latestPost.rows as Post[]).map((post: Post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>{post.skill}</CardTitle>
              <CardDescription>{post.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {typeof post.distance === "number"
                ? post.distance >= 1
                  ? `${post.distance.toFixed(1)} km` // Show 1.5 km format
                  : `${Math.round(post.distance * 1000)} m` // Show 600m format
                : "Unknown distance"}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleRespond(post)} 
                disabled={status === 'pending'}
              >
                {status === 'pending' ? "Starting chat..." : "Respond"}
              </Button>
            </CardFooter>
          </Card>
        ))
      ) : (
        <p>There are no posts in your area.</p>
      )}

      {/* 🔥 Render Chat Window if a conversation is active */}
      {activeChat && <ChatWindow conversation_id={activeChat} />}
    </div>
  );
}
