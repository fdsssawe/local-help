"use client";

import { useState, useEffect } from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog";
import { toast } from "~/components/hooks/use-toast";

interface UserRatingProps {
  userId: string;
  showRatingDialog?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  displayName?: boolean;
  onRatingSubmitted?: () => void;
}

export function UserRating({
  userId,
  showRatingDialog = true,
  className,
  size = "md",
  displayName = false,
  onRatingSubmitted,
}: UserRatingProps) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // Get user rating data
  const { data: ratingData, refetch: refetchRating } = api.rating.getUserRating.useQuery(
    { userId }, 
    { enabled: !!userId }
  );

  // Check if current user has rated this user
  const { data: hasRatedData } = api.rating.hasRated.useQuery(
    { userId },
    { enabled: !!userId && !!user && isUserLoaded && user.id !== userId }
  );

  // Submit rating mutation
  const { mutate: submitRating, isLoading: isSubmitting } = api.rating.rateUser.useMutation({
    onSuccess: () => {
      setIsRatingDialogOpen(false);
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this user!",
      });
      refetchRating();
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating",
        variant: "destructive",
      });
    },
  });

  // Set initial rating value based on user's previous rating
  useEffect(() => {
    if (hasRatedData?.currentRating) {
      setRatingValue(hasRatedData.currentRating);
    }
  }, [hasRatedData]);

  // Handle rating submission
  const handleRateUser = () => {
    if (!user || !userId || ratingValue === 0) return;
    
    submitRating({
      userId,
      score: ratingValue,
    });
  };

  // Size classes for stars
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // Format rating to 1 decimal place if it has decimals
  const formattedRating = ratingData?.averageScore 
    ? ratingData.averageScore % 1 === 0 
      ? ratingData.averageScore.toFixed(0) 
      : ratingData.averageScore.toFixed(1)
    : "0";

  // Generate star display based on rating
  const renderStars = () => {
    const rating = ratingData?.averageScore ?? 0;
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        // Full star
        stars.push(
          <Star key={i} className={cn("fill-yellow-400 text-yellow-400", sizeClasses[size])} />
        );
      } else if (i - 0.5 <= rating) {
        // Half star
        stars.push(
          <StarHalf key={i} className={cn("fill-yellow-400 text-yellow-400", sizeClasses[size])} />
        );
      } else {
        // Empty star
        stars.push(
          <Star key={i} className={cn("text-gray-300", sizeClasses[size])} />
        );
      }
    }
    
    return stars;
  };

  // Generate interactive stars for rating dialog
  const renderInteractiveStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      return (
        <button
          key={i}
          type="button"
          onClick={() => setRatingValue(starValue)}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          className="p-1"
          aria-label={`Rate ${starValue} out of 5 stars`}
        >
          <Star
            className={cn(
              "w-8 h-8 transition-colors",
              (hoverRating !== 0 ? starValue <= hoverRating : starValue <= ratingValue)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            )}
          />
        </button>
      );
    });
  };

  // Show button only if:
  // 1. User is logged in
  // 2. The user is not the current user
  // 3. showRatingDialog is true
  const showRateButton = 
    isUserLoaded && 
    user && 
    user.id !== userId && 
    showRatingDialog;

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center space-x-1">
        {renderStars()}
        <span className={cn("text-gray-600 ml-1 font-medium", textClasses[size])}>
          {formattedRating}
        </span>
        <span className={cn("text-gray-500", textClasses[size])}>
          ({ratingData?.totalRatings ?? 0})
        </span>
      </div>

      {displayName && ratingData?.userName && (
        <span className={cn("ml-2 text-gray-700", textClasses[size])}>
          {ratingData.userName}
        </span>
      )}
      
      {showRateButton && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-2"
          onClick={() => setIsRatingDialogOpen(true)}
        >
          {hasRatedData?.hasRated ? "Update Rating" : "Rate User"}
        </Button>
      )}

      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate this user</DialogTitle>
            <DialogDescription>
              How would you rate your experience with this user?
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-4">
            <div className="flex items-center justify-center space-x-1 mb-6">
              {renderInteractiveStars()}
            </div>
            
            <Button 
              onClick={handleRateUser} 
              disabled={ratingValue === 0 || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}