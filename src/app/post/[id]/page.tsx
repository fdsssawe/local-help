"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useState } from "react";
import Spinner from "~/components/ui/spinner";
import { Button } from "~/components/ui/button";
import { MessageCircle, MapPin, Clock, ArrowLeft, User } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "~/components/ui/card";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { UserRating } from "~/components/ui/user-rating";

export default function PostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const postId = Array.isArray(id) ? id[0] : id;
  const [isContactLoading, setIsContactLoading] = useState(false);

  // Fetch post data
  const { data: post, isLoading, error } = api.post.getById.useQuery(
    { postId },
    { enabled: !!postId }
  );

  // Check if there's an existing conversation for this post
  const checkConversation = api.chat.checkConversationExists.useQuery(
    { post_id: postId },
    { enabled: !!postId && !!user }
  );

  // Start conversation mutation
  const { mutate: startConversation } = api.chat.startChat.useMutation({
    onSuccess: (data) => {
      setIsContactLoading(false);
      if (data?.id) router.push(`/chats?id=${data.id}`);
    },
    onError: () => {
      setIsContactLoading(false);
    }
  });

  // Handle contacting the provider
  const handleContactProvider = () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    if (!post) return;
    
    setIsContactLoading(true);
    
    if (checkConversation.data?.exists && checkConversation.data?.conversation_id) {
      // Navigate to existing conversation
      router.push(`/chats?id=${checkConversation.data.conversation_id}`);
    } else {
      // Start a new conversation
      startConversation({
        post_id: postId,
        receiver_id: post.userId || "",
      });
    }
  };

  // Format the date
  const formatDate = (dateStr: string | Date | undefined) => {
    if (!dateStr) return "Unknown date";
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric", 
        month: "long", 
        day: "numeric"
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Format distance
  const formatDistance = (distance: number | undefined) => {
    if (typeof distance !== "number") return "Unknown distance";
    
    return distance < 1
      ? `${Math.round(distance * 1000)}m`
      : `${distance.toFixed(1)} km`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-16 flex justify-center">
        <Spinner size="12" className="text-primary" />
      </div>
    );
  }

  // Show error state
  if (error || !post) {
    return (
      <div className="container mx-auto py-16">
        <div className="bg-red-50 rounded-md p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
          <p className="text-gray-700 mb-4">This post could not be found or is no longer available.</p>
          <Button onClick={() => router.push("/local")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Local Posts
          </Button>
        </div>
      </div>
    );
  }

  // Check if this is the user's own post
  const isOwnPost = user?.id === post.userId;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/local" className="inline-flex items-center text-gray-600 hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Local Posts
        </Link>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-2xl md:text-3xl">{post.skill}</CardTitle>
            {post.distance !== undefined && (
              <Badge variant="outline" className="bg-primary/5 text-primary">
                {formatDistance(post.distance)}
              </Badge>
            )}
          </div>
          <CardDescription className="text-base">{post.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 pb-4 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Post Meta Information */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Posted on {formatDate(post.createdAt || post.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {post.distance ? `${formatDistance(post.distance)} from your location` : "Location unavailable"}
                </span>
              </div>
            </div>

            {/* Provider Information */}
            <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.creatorImage || undefined} alt={post.creatorName} />
                  <AvatarFallback><User size={16} /></AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{post.creatorName}</p>
                  <p className="text-xs text-muted-foreground">Service Provider</p>
                </div>
              </div>
              
              {/* User Rating Component */}
              {post.userId && (
                <UserRating userId={post.userId} size="sm" />
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex justify-end">
          {isOwnPost ? (
            <Badge variant="secondary" className="text-sm px-3 py-1">This is your post</Badge>
          ) : checkConversation.data?.exists ? (
            <Button 
              onClick={handleContactProvider} 
              variant="outline"
              disabled={isContactLoading}
              className="gap-2"
            >
              {isContactLoading ? <Spinner size="4" className="mr-2" /> : <MessageCircle className="h-4 w-4" />}
              View Conversation
            </Button>
          ) : (
            <Button 
              onClick={handleContactProvider}
              disabled={isContactLoading} 
              className="gap-2"
            >
              {isContactLoading ? <Spinner size="4" className="mr-2" /> : <MessageCircle className="h-4 w-4" />}
              Contact Provider
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
