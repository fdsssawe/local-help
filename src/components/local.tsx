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
import { Clock, MapPin, MessageCircle } from "lucide-react";
import { Badge } from "./ui/badge";

interface GetLocalProps {
  searchQuery?: string;
  distanceFilter?: number;
  sortOption?: string;
}

export function GetLocal({ searchQuery = '', distanceFilter, sortOption = 'recent' }: GetLocalProps = {}) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [useRegisteredAddress, setUseRegisteredAddress] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [conversationStatus, setConversationStatus] = useState<Record<number, {exists: boolean, id: number | null}>>({});

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

  // Update effect to properly handle distanceFilter changes
  useEffect(() => {
    console.log("Distance filter changed:", distanceFilter);
  }, [distanceFilter]);

  // Determine which coordinates to use
  const queryParams = {
    latitude: location?.latitude.toString() ?? "0",
    longitude: location?.longitude.toString() ?? "0",
    useRegisteredAddress: useRegisteredAddress && !!userAddress,
    maxDistance: distanceFilter, // Always pass the distance filter value directly (undefined will be ignored)
  };

  const { data: nearbyPosts, isLoading } = api.post.getNearbyPosts.useQuery(
    queryParams,
    {
      enabled: !!location || (!!userAddress && useRegisteredAddress),
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  // Move this to the top of the component for better initialization
  const checkConversation = api.chat.checkConversationExists.useQuery(
    { post_id: "0" }, // Default empty value
    { enabled: false } // Don't run on component mount
  );

  // Update filtered posts when nearby posts change or when search/filters change
  useEffect(() => {
    if (!nearbyPosts?.rows) return;
    
    let posts = [...nearbyPosts.rows] as Post[];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(post => 
        post.skill?.toLowerCase().includes(query) || 
        post.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply distance filter directly in the API query (handled through queryParams)
    
    // Apply sorting
    if (sortOption) {
      switch (sortOption) {
        case 'recent':
          posts.sort((a, b) => {
            return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
          });
          break;
        case 'distance':
          posts.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
          break;
        case 'popularity':
          // This would require popularity data, using a placeholder sort for now
          // In a real app, you'd have view counts, ratings, or other metrics
          posts.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
          break;
      }
    }
    
    setFilteredPosts(posts);

    // Check for existing conversations for each post if user is logged in
    if (user && posts.length > 0) {
      void checkExistingConversations(posts.filter(p => p.id !== undefined).map(p => p.id as number));
    }
  }, [nearbyPosts, searchQuery, sortOption, user]);

  // Function to check existing conversations
  const checkExistingConversations = async (postIds: number[]) => {
    if (!user) return;
    
    const newStatus: Record<number, {exists: boolean, id: string | null}> = {};
    
    for (const postId of postIds) {
      if (!postId) continue;
      
      try {
        console.log(`Checking conversation for post ${postId}`);
        const result = await checkConversation.refetch({ 
          post_id: String(postId)
        });
        
        console.log(`Result for post ${postId}:`, result.data);
        
        if (result.data) {
          newStatus[postId] = {
            exists: result.data.exists,
            id: result.data.conversation_id,
          };
        }
      } catch (error) {
        console.error("Error checking conversation for post", postId, error);
      }
    }
    
    setConversationStatus(newStatus);
  };

  const { mutate: startConversation } = api.chat.startChat.useMutation({
    onSuccess: (data) => {
      if (data?.id) router.push(`/chats?id=${data.id}`);
    },
  });

  const handleRespond = (post: Post) => {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    
    // Check if conversation already exists for this post
    const postId = post.id;
    const hasConversation = postId !== undefined && conversationStatus[postId]?.exists;
    
    if (hasConversation && postId !== undefined && conversationStatus[postId]?.id) {
      // Use the parameter name that the chat component expects - just 'id'
      console.log(`Navigating to existing chat: ${conversationStatus[postId]?.id}`);
      router.push(`/chats?id=${conversationStatus[postId]?.id}`);
    } else {
      console.log(`Starting new chat for post: ${post.id}`);
      startConversation({
        post_id: post.id?.toString() ?? "",
        receiver_id: post.userId ?? "",
      });
    }
  };

  // Format distance in a more readable way - updating to handle smaller distances better
  const formatDistance = (distance: number | undefined) => {
    if (typeof distance !== "number") return "Unknown distance";
    
    if (distance < 1) {
      // For very small distances (less than 100m), show with one decimal
      return distance < 0.1 
        ? `${Math.round(distance * 1000)}m`  // Round to nearest meter
        : `${Math.round(distance * 1000)}m`; // Show as meters
    } else {
      return `${distance.toFixed(1)}km`;     // Show as kilometers with one decimal
    }
  };

  // Function to format dates properly from different field formats
  const formatPostDate = (post: Post) => {
    // Check for both camelCase and snake_case field names
    const dateValue = post.createdAt || post.created_at || new Date().toISOString();
    
    try {
      // Prevent invalid date errors by safely parsing the date
      const dateObj = new Date(dateValue);
      if (isNaN(dateObj.getTime())) {
        return "Unknown date"; // Fallback for invalid dates
      }
      return dateObj.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown date";
    }
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
    <div className="w-full flex flex-col gap-4">
      {user && (
        <div className="flex items-center justify-between px-4 py-4 bg-secondary/10 rounded-lg mb-2">
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
        <Card className="bg-secondary/10 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Set your home address</CardTitle>
            <CardDescription>
              Register your address to see posts in your neighborhood even when you&apos;re away
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-2 justify-end">
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
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post: Post) => {
            // Check if conversation exists for this post
            const postId = post.id;
            const hasConversation = postId && conversationStatus[postId]?.exists;
            
            return (
              <Card key={post.id} className="h-full flex flex-col group hover:shadow-md transition-shadow">
                <div className="cursor-pointer" onClick={() => router.push(`/post/${post.id}`)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{post.skill}</CardTitle>
                      <Badge variant="outline" className="bg-primary/5 text-primary">
                        {formatDistance(post.distance)}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{post.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock size={14} />
                      <span>
                        {formatPostDate(post)}
                      </span>
                    </div>
                  </CardContent>
                </div>
                <CardFooter className="justify-end border-t pt-4 flex gap-2">
                  <Button 
                    variant="secondary"
                    onClick={() => router.push(`/post/${post.id}`)}
                    className="w-full sm:w-auto"
                  >
                    View Details
                  </Button>
                  
                  {/* Keep contact button for convenience but make it secondary */}
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent navigation to post details
                      handleRespond(post);
                    }} 
                    className="w-full sm:w-auto"
                    variant={hasConversation ? "outline" : "default"}
                  >
                    {hasConversation ? (
                      <>
                        <MessageCircle size={16} className="mr-2" />
                        View Chat
                      </>
                    ) : (
                      "Contact"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-secondary/10 rounded-lg">
          <MapPin size={48} className="text-primary/80 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No posts found</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            {searchQuery 
              ? `No results found for "${searchQuery}"` 
              : "There are no posts in your area."}
            {distanceFilter ? ` within ${distanceFilter}km.` : ""}
          </p>
          <Button variant="default" onClick={() => router.push("/post")}>
            Create a Post
          </Button>
        </div>
      )}
    </div>
  );
}