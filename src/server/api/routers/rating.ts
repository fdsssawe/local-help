import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { userRatings } from "~/server/db/schema";
import { eq, and, avg, sql, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";

export const ratingRouter = createTRPCRouter({
  // Get a user's average rating
  getUserRating: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // Get average score
        const result = await ctx.db
          .select({
            averageScore: avg(userRatings.score).mapWith(Number),
            totalRatings: count().mapWith(Number)
          })
          .from(userRatings)
          .where(eq(userRatings.userId, input.userId));

        // Get the user's information from Clerk
        let user = null;
        try {
          user = await clerkClient.users.getUser(input.userId);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
        
        return {
          userId: input.userId,
          averageScore: result[0]?.averageScore ?? 0,
          totalRatings: result[0]?.totalRatings ?? 0,
          userName: user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : "Unknown User"
        };
      } catch (error) {
        console.error("Error fetching user rating:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user rating",
        });
      }
    }),

  // Submit a rating for a user
  rateUser: protectedProcedure
    .input(z.object({
      userId: z.string(),
      score: z.number().min(1).max(5),
      comment: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const raterId = ctx.auth.userId;
      
      if (raterId === input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST", 
          message: "You cannot rate yourself"
        });
      }
      
      try {
        // Check if this user has already rated this person
        const existingRating = await ctx.db.query.userRatings.findFirst({
          where: and(
            eq(userRatings.userId, input.userId),
            eq(userRatings.raterId, raterId)
          )
        });
        
        if (existingRating) {
          // Update the existing rating
          await ctx.db
            .update(userRatings)
            .set({
              score: input.score,
              comment: input.comment,
              createdAt: new Date()
            })
            .where(and(
              eq(userRatings.userId, input.userId),
              eq(userRatings.raterId, raterId)
            ));
            
          return { success: true, updated: true };
        } else {
          // Create a new rating
          await ctx.db.insert(userRatings).values({
            userId: input.userId,
            raterId: raterId,
            score: input.score,
            comment: input.comment,
            createdAt: new Date()
          });
          
          return { success: true, updated: false };
        }
      } catch (error) {
        console.error("Error submitting rating:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit rating",
        });
      }
    }),

  // Get all ratings for a user with details
  getUserRatingsDetails: publicProcedure
    .input(z.object({
      userId: z.string(),
      limit: z.number().min(1).max(100).optional(),
      cursor: z.number().nullish()
    }))
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;
      const cursor = input.cursor;
      
      try {
        const ratings = await ctx.db.query.userRatings.findMany({
          where: eq(userRatings.userId, input.userId),
          orderBy: (userRatings, { desc }) => [desc(userRatings.createdAt)],
          limit: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
        });
        
        let nextCursor: typeof cursor = undefined;
        if (ratings.length > limit) {
          const nextItem = ratings.pop();
          nextCursor = nextItem!.id;
        }
        
        // Fetch rater information for each rating
        const ratingsWithRaters = await Promise.all(
          ratings.map(async (rating) => {
            let rater = null;
            try {
              rater = await clerkClient.users.getUser(rating.raterId);
            } catch (error) {
              console.error(`Error fetching rater (${rating.raterId}):`, error);
            }
            
            return {
              ...rating,
              raterName: rater ? `${rater.firstName ?? ''} ${rater.lastName ?? ''}`.trim() : "Anonymous User",
              raterImage: rater?.imageUrl ?? null
            };
          })
        );
        
        return {
          ratings: ratingsWithRaters,
          nextCursor
        };
      } catch (error) {
        console.error("Error fetching user ratings:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user ratings",
        });
      }
    }),
    
  // Check if the current user has rated a specific user
  hasRated: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const raterId = ctx.auth.userId;
      
      try {
        const rating = await ctx.db.query.userRatings.findFirst({
          where: and(
            eq(userRatings.userId, input.userId),
            eq(userRatings.raterId, raterId)
          )
        });
        
        return { 
          hasRated: !!rating, 
          currentRating: rating ? rating.score : null
        };
      } catch (error) {
        console.error("Error checking user rating status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check rating status",
        });
      }
    })
});