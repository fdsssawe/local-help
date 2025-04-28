"use client"

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { api } from '~/trpc/react';
import { format } from 'date-fns';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
} from 'lucide-react';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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
import { Textarea } from "~/components/ui/textarea";
import { toast } from "~/components/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import Spinner from '~/components/ui/spinner';
import { Separator } from "~/components/ui/separator";
import { UserRating } from "~/components/ui/user-rating";

export default function ItemPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [isContactLoading, setIsContactLoading] = useState(false);

  // Get the item ID from the URL params
  const itemId = typeof params.id === 'string' ? params.id : '';

  // Fetch the item details
  const { data: item, isLoading, error } = api.lostFound.getById.useQuery(
    { itemId },
    { enabled: !!itemId }
  );

  // Update item status mutation
  const updateStatus = api.lostFound.updateStatus.useMutation({
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "The item status has been updated successfully.",
      });
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Add chat/conversation hooks
  const checkConversation = api.chat.checkConversationExists.useQuery(
    { post_id: itemId },
    { enabled: !!itemId && !!user }
  );
  const { mutate: startConversation } = api.chat.startChat.useMutation({
    onSuccess: (data) => {
      setIsContactLoading(false);
      if (data?.id) router.push(`/chats?id=${data.id}`);
    },
    onError: () => setIsContactLoading(false),
  });

  // Format date function
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };

  // Format time function
  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };

  // Format distance function
  const formatDistance = (distance: number | undefined) => {
    if (typeof distance !== "number") return "Unknown distance";
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`; // Show as meters
    } else {
      return `${distance.toFixed(1)}km`; // Show as kilometers with one decimal
    }
  };

  // Get the type details (color, label)
  const getTypeDetails = (type: string) => {
    if (type === "lost") {
      return { 
        label: "Lost", 
        badgeVariant: "destructive" as const,
        icon: AlertCircle,
      };
    } else {
      return { 
        label: "Found", 
        badgeVariant: "success" as const,
        icon: CheckCircle,
      };
    }
  };

  // Handle contact button click
  const handleContactClick = async () => {
    if (!isLoaded || !user) {
      setShowLoginAlert(true);
      return;
    }

    if (item?.userId === user.id) {
      toast({
        title: "This is your listing",
        description: "You cannot contact yourself on your own listing.",
      });
      return;
    }

    // If custom contact method, open dialog as before
    if (item.contactMethod === "custom" && item.contactInfo) {
      setContactDialogOpen(true);
      return;
    }

    // Otherwise, handle chat
    setIsContactLoading(true);

    // Check for existing conversation
    if (checkConversation.data?.exists && checkConversation.data?.conversation_id) {
      router.push(`/chats?id=${checkConversation.data.conversation_id}`);
      setIsContactLoading(false);
    } else {
      // Start a new conversation
      startConversation({
        post_id: itemId,
        receiver_id: item.userId || "",
      });
    }
  };

  // Handle message submission
  const handleSendMessage = () => {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    // Here you would typically implement the logic to send the message
    // This could be an API call to a messaging system, email service, etc.
    
    // For now, we'll simulate a successful message send
    setTimeout(() => {
      toast({
        title: "Message sent",
        description: "Your message has been sent to the poster.",
      });
      setIsSending(false);
      setContactDialogOpen(false);
      setMessage('');
    }, 1000);
  };

  // Handle status update
  const handleUpdateStatus = (status: "active" | "resolved" | "expired") => {
    if (!item) return;
    
    updateStatus.mutate({
      itemId: item.id,
      status,
    });
    
    setStatusDialogOpen(false);
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
  if (error || !item) {
    return (
      <div className="container mx-auto py-16">
        <div className="bg-red-50 rounded-md p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Item Not Found</h1>
          <p className="text-gray-700 mb-4">This item could not be found or is no longer available.</p>
          <Button onClick={() => router.push("/lost-found")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lost & Found
          </Button>
        </div>
      </div>
    );
  }

  // Check if this is the user's own item
  const isOwnItem = user?.id === item.userId;

  // Get type details
  const typeDetails = getTypeDetails(item.type);
  const TypeIcon = typeDetails.icon;

  return (
    <div className="min-h-screen bg-background lg:pt-[56px] pt-4 pb-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/lost-found')} 
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Lost & Found
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={typeDetails.badgeVariant} className="text-sm">
                    <TypeIcon size={14} className="mr-1" />
                    {typeDetails.label}
                  </Badge>
                  {item.category && (
                    <Badge variant="outline" className="text-sm">
                      {item.category}
                    </Badge>
                  )}
                  {item.status !== "active" && (
                    <Badge variant={item.status === "resolved" ? "success" : "secondary"} className="text-sm">
                      {item.status === "resolved" ? "Resolved" : "Expired"}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{item.title}</CardTitle>
                {item.distance !== undefined && (
                  <CardDescription className="mt-1 flex items-center gap-1">
                    <MapPin size={14} className="text-primary/70" />
                    <span>{formatDistance(item.distance)} from your location</span>
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-medium">Description</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {item.description}
              </p>
            </div>

            <Separator />
            
            {/* Location and Time Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-primary mt-0.5" />
                  <div className='flex flex-row gap-2'>
                    <h4 className="font-medium">Location</h4>
                    <p className="text-muted-foreground">{item.location}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary mt-0.5" />
                  <div className='flex flex-row gap-2'>
                    <h4 className="font-medium">Date</h4>
                    <p className="text-muted-foreground">
                      {formatDate(item.date || item.createdAt)}
                      <span className="mx-1">•</span>
                      <span className="text-muted-foreground/70">{formatTime(item.date || item.createdAt)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />
            
            {/* Posted by */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={item.creatorImage || undefined} />
                    <AvatarFallback>
                      <User size={18} />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Posted by</p>
                    <p className="text-sm text-muted-foreground">{item.creatorName}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <Clock size={14} className="inline mr-1" />
                  <span>Posted {formatDate(item.createdAt)}</span>
                </div>
              </div>
              
              {/* User Rating */}
              {item.userId && (
                <div className="ml-12">
                  <UserRating userId={item.userId} size="sm" />
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 pt-3 border-t">
            {isOwnItem ? (
              <Button 
                variant={item.status === "active" ? "default" : "outline"} 
                onClick={() => setStatusDialogOpen(true)}
              >
                {item.status === "active" ? "Mark as Resolved" : "Update Status"}
              </Button>
            ) : (
              <Button 
                className="flex items-center gap-2"
                onClick={handleContactClick}
                disabled={item.status !== "active" || isContactLoading}
              >
                {isContactLoading ? <Spinner size="4" className="mr-2" /> : <MessageCircle size={16} />}
                Contact Poster
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact about {item.title}</DialogTitle>
            <DialogDescription>
              {item.type === "lost" ? 
                "Send a message to the person who lost this item." :
                "Send a message to the person who found this item."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {item.contactMethod === "custom" && item.contactInfo ? (
              <div className="bg-secondary/20 p-3 rounded">
                <p className="font-medium mb-1">Contact Info:</p>
                <p className="text-muted-foreground break-all">
                  {item.contactInfo.includes('@') ? (
                    <Mail className="inline mr-1 h-4 w-4" />
                  ) : (
                    <Phone className="inline mr-1 h-4 w-4" />
                  )}
                  {item.contactInfo}
                </p>
              </div>
            ) : null}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setContactDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Alert Dialog */}
      <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be logged in to contact the item poster.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLoginAlert(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/sign-in')}>
              Sign In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Update Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Item Status</AlertDialogTitle>
            <AlertDialogDescription>
              Change the status of your {item.type === 'lost' ? 'lost' : 'found'} item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Button 
                variant={item.status === "active" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleUpdateStatus("active")}
              >
                Mark as Active
              </Button>
              <Button 
                variant="success"
                className="w-full justify-start"
                onClick={() => handleUpdateStatus("resolved")}
              >
                Mark as Resolved/Found
              </Button>
              <Button 
                variant="secondary"
                className="w-full justify-start"
                onClick={() => handleUpdateStatus("expired")}
              >
                Mark as Expired
              </Button>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}