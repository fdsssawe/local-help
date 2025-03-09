/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Switch } from "./ui/switch";

export function GetLocal() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [useRegisteredAddress, setUseRegisteredAddress] = useState(false);
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Get user's registered address
  const { data: userAddress } = api.address.getUserAddress.useQuery(undefined, {
    enabled: !!user,
  });

  // Set to use registered address only if one exists
  useEffect(() => {
    if (userAddress) {
      setUseRegisteredAddress(true);
    }
  }, [userAddress]);

  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords;
          setLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocation(null);
        }
      );
    }
  }, []);

  // Determine which coordinates to use
  const queryParams = {
    latitude: location?.latitude.toString() ?? "0",
    longitude: location?.longitude.toString() ?? "0",
    useRegisteredAddress: useRegisteredAddress && !!userAddress,
  };

  const { data: nearbyPosts, isLoading } = api.post.getNearbyPosts.useQuery(
    queryParams,
    {
      enabled: !!location || (!!userAddress && useRegisteredAddress),
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  const { mutate: startConversation } = api.chat.startChat.useMutation({
    onSuccess: (data) => {
      if (data?.id) router.push(`/chat/${data.id}`);
    },
  });

  const handleRespond = (post: Post) => {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    startConversation({
      post_id: post.id?.toString() ?? "",
      receiver_id: post.userId ?? "",
    });
  };

  // Show loading state while fetching user data
  if (!isLoaded) {
    return (
      <div className="w-full h-40 flex justify-center items-center">
        <Spinner size="10" className="text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full lg:max-w-[600px] flex flex-col gap-4 text-center">
      {user && (
        <div className="flex items-center justify-between px-2 py-4 bg-secondary/20 rounded-lg">
          <div className="text-left">
            <h3 className="font-semibold">Location Mode</h3>
            <p className="text-sm text-muted-foreground">
              {useRegisteredAddress && userAddress
                ? "Using your registered address"
                : "Using your current location"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">Current</span>
            <Switch 
              checked={useRegisteredAddress} 
              onCheckedChange={setUseRegisteredAddress} 
              disabled={!userAddress}
            />
            <span className="text-xs">Registered</span>
          </div>
        </div>
      )}

      {user && !userAddress && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Set your home address</CardTitle>
            <CardDescription>
              Register your home address to see posts in your neighborhood even when you&apos;re away
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-end">
            <Button onClick={() => router.push("/account/address")}>
              Set Address
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {isLoading || (!location && !userAddress) ? (
        <div className="w-full h-40 flex justify-center items-center">
          <Spinner size="10" className="text-primary" />
        </div>
      ) : nearbyPosts?.rows && nearbyPosts.rows.length > 0 ? (
        (nearbyPosts.rows as Post[]).map((post: Post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>{post.skill}</CardTitle>
              <CardDescription>{post.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-start">
              {typeof post.distance === "number"
                ? post.distance >= 1
                  ? `${post.distance.toFixed(1)} km` // Show 1.5 km format
                  : `${Math.round(post.distance * 1000)} m` // Show 600m format
                : "Unknown distance"}
            </CardContent>
            <CardFooter className="justify-end">
              <Button 
                onClick={() => handleRespond(post)} 
              >
                Respond
              </Button>
            </CardFooter>
          </Card>
        ))
      ) : (
        <p>There are no posts in your area.</p>
      )}
    </div>
  );
}