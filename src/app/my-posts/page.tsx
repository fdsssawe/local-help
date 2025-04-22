"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { api } from '~/trpc/react';
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, Plus, AlertTriangle, Clock, MapPin, PenLine, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Spinner from '~/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { toast } from "~/components/hooks/use-toast";

export default function MyPostsPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  // Redirect if not logged in
  if (isLoaded && !user) {
    router.push('/sign-in');
    return null;
  }

  // Fetch user's posts
  const { data: posts, isLoading, refetch } = api.post.getUserPosts.useQuery(
    { sortBy: sortOrder },
    {
      enabled: !!user,
    }
  );

  // Delete post mutation
  const deletePost = api.post.deletePost.useMutation({
    onSuccess: () => {
      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      });
      void refetch();
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Format date function
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format distance for display
  const formatDistance = (distance: number | undefined) => {
    if (typeof distance !== "number") return null;
    
    return distance < 1
      ? `${Math.round(distance * 1000)}m`
      : `${distance.toFixed(1)} km`;
  };

  // Handle post deletion
  const handleDeletePost = () => {
    if (postToDelete !== null) {
      deletePost.mutate({ postId: postToDelete });
    }
  };

  // Confirm delete dialog
  const confirmDelete = (postId: number) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pt-16 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/local')} 
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Local Posts
          </Button>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Posts</h1>
            <p className="text-muted-foreground">
              Manage all your posts
            </p>
          </div>

          <Link href="/post">
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Create New Post
            </Button>
          </Link>
        </div>

        {/* Filters/Sort */}
        <div className="mb-8">
          <Card>
            <CardHeader className="py-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Sort Posts</CardTitle>
                <Select 
                  value={sortOrder} 
                  onValueChange={(value) => setSortOrder(value as "recent" | "oldest")}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most recent first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Posts list */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="12" className="text-primary" />
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="text-center py-16 bg-secondary/10 rounded-lg">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No posts found</h2>
            <p className="text-muted-foreground mb-6">
              You haven't created any posts yet
            </p>
            <Link href="/post">
              <Button>Create Your First Post</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <Card 
                key={post.id} 
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{post.skill}</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2 mb-4">
                    {post.description}
                  </p>
                  
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock size={14} className="flex-shrink-0" />
                      <span>Posted on {formatDate(post.createdAt)}</span>
                    </div>
                    
                    {post.distance !== undefined && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin size={14} className="flex-shrink-0" />
                        <span>{formatDistance(post.distance)} from your location</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-end gap-2 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => router.push(`/post/${post.id}`)}
                  >
                    <PenLine size={14} />
                    View
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => confirmDelete(post.id)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePost}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
