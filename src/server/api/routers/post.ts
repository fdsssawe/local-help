import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { posts, userAddresses } from "~/server/db/schema";
import { sql } from "@vercel/postgres";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

// Define the Earth's radius in kilometers
const EARTH_RADIUS_KM = 6371;

export const postRouter = createTRPCRouter({
  // Create a post mutation
  create: publicProcedure
    .input(
      z.object({
        skill: z.string(),
        description: z.string(),
        latitude: z.string(),
        longitude: z.string(),
        userId: z.string(),
        useRegisteredAddress: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let latitude = input.latitude;
      let longitude = input.longitude;
      
      // Use registered address if specified
      if (input.useRegisteredAddress && ctx.auth?.userId) {
        const registeredAddress = await ctx.db.query.userAddresses.findFirst({
          where: eq(userAddresses.userId, ctx.auth.userId),
        });

        if (registeredAddress) {
          latitude = registeredAddress.latitude;
          longitude = registeredAddress.longitude;
        }
      }
      
      const result = await ctx.db.insert(posts).values({
        latitude,
        longitude,
        skill: input.skill,
        description: input.description,
        userId: input.userId,
        createdAt: new Date(),
      }).returning({ id: posts.id });
      
      return result[0]; // Return the created post data including its ID
    }),

  // Fetch the latest post
  getLatest: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.posts.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return post ?? null;
  }),

  // Fetch posts within radius - modified to consider registered address and exclude user's own posts
  getNearbyPosts: publicProcedure
    .input(
      z.object({
        latitude: z.string(),
        longitude: z.string(),
        maxDistance: z.number().optional(), // Make sure this is properly handled
        useRegisteredAddress: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get registered address if useRegisteredAddress is true and user is logged in
      let lat = parseFloat(input.latitude);
      let lon = parseFloat(input.longitude);
      const radiusInKm = input.maxDistance ?? 1; // Default to 1 kilometer radius if not specified
      const currentUserId = ctx.auth?.userId ?? null;

      try {
        if (input.useRegisteredAddress && currentUserId) {
          const registeredAddress = await ctx.db.query.userAddresses.findFirst({
            where: eq(userAddresses.userId, currentUserId),
          });

          if (registeredAddress) {
            lat = parseFloat(registeredAddress.latitude);
            lon = parseFloat(registeredAddress.longitude);
          }
        }

        // Handle case where coordinates might not be valid numbers
        if (isNaN(lat) ?? isNaN(lon)) {
          throw new Error("Invalid coordinates");
        }

        // Create appropriate query based on whether to exclude user's posts
        let nearbyPosts;
        if (currentUserId) {
          nearbyPosts = await sql`
            SELECT * FROM (
              SELECT *, (
                ${EARTH_RADIUS_KM} * acos(
                  LEAST(1.0, cos(radians(${lat})) * cos(radians(latitude)) * 
                  cos(radians(longitude) - radians(${lon})) + 
                  sin(radians(${lat})) * sin(radians(latitude)))
                )
              ) AS distance
              FROM local_help_posts
              WHERE "userId" != ${currentUserId}
            ) AS posts_with_distance
            WHERE distance < ${radiusInKm}
            ORDER BY distance ASC;
          `;
        } else {
          nearbyPosts = await sql`
            SELECT * FROM (
              SELECT *, (
                ${EARTH_RADIUS_KM} * acos(
                  LEAST(1.0, cos(radians(${lat})) * cos(radians(latitude)) * 
                  cos(radians(longitude) - radians(${lon})) + 
                  sin(radians(${lat})) * sin(radians(latitude)))
                )
              ) AS distance
              FROM local_help_posts
            ) AS posts_with_distance
            WHERE distance < ${radiusInKm}
            ORDER BY distance ASC;
          `;
        }

        return nearbyPosts ?? [];
      } catch (error) {
        console.error("Error fetching nearby posts:", error);
        return { rows: [] };
      }
    }),

  // New endpoint to get a single post by ID
  getById: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const post = await ctx.db.query.posts.findFirst({
          where: eq(posts.id, parseInt(input.postId)),
        });
        
        if (!post) {
          throw new Error("Post not found");
        }

        // Get user info for the post creator
        let creator = null;
        if (post.userId) {
          try {
            creator = await clerkClient.users.getUser(post.userId);
          } catch (error) {
            console.error("Error fetching user:", error);
          }
        }
        
        // Calculate distance if current user's location is available
        let distance = undefined;
        const currentUserId = ctx.auth?.userId ?? null;
        
        if (currentUserId && post.latitude && post.longitude) {
          // If user is logged in, try to calculate distance
          const userAddress = await ctx.db.query.userAddresses.findFirst({
            where: eq(userAddresses.userId, currentUserId),
          });
          
          if (userAddress?.latitude && userAddress?.longitude) {
            // Use Haversine formula to calculate distance
            const userLat = parseFloat(userAddress.latitude);
            const userLon = parseFloat(userAddress.longitude);
            const postLat = parseFloat(post.latitude);
            const postLon = parseFloat(post.longitude);
            
            // Calculate distance using same formula as getNearbyPosts
            const result = await sql`
              SELECT (
                ${6371} * acos(
                  LEAST(1.0, cos(radians(${userLat})) * cos(radians(${postLat})) * 
                  cos(radians(${postLon}) - radians(${userLon})) + 
                  sin(radians(${userLat})) * sin(radians(${postLat})))
                )
              ) AS distance;
            `;
            
            if (result.rows.length > 0) {
              distance = parseFloat(result.rows[0].distance);
            }
          }
        }
        
        return {
          ...post,
          distance,
          creatorName: creator ? `${creator.firstName ?? ''} ${creator.lastName ?? ''}`.trim() : "Anonymous User",
          creatorImage: creator?.imageUrl ?? null,
        };
      } catch (error) {
        console.error("Error fetching post:", error);
        throw new Error("Failed to fetch post");
      }
    }),

  // Get user's posts
  getUserPosts: protectedProcedure
    .input(
      z.object({
        sortBy: z.enum(["recent", "oldest"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;
      if (!userId) {
        throw new Error("You must be logged in to view your posts");
      }

      const userPosts = await ctx.db.query.posts.findMany({
        where: eq(posts.userId, userId),
        orderBy: input.sortBy === "oldest" 
          ? (posts, { asc }) => [asc(posts.createdAt)]
          : (posts, { desc }) => [desc(posts.createdAt)],
      });

      return userPosts;
    }),

  // Delete a post
  deletePost: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;
      if (!userId) {
        throw new Error("You must be logged in to delete posts");
      }

      // Check if the post belongs to the user
      const post = await ctx.db.query.posts.findFirst({
        where: (posts, { and, eq }) => 
          and(eq(posts.id, input.postId), eq(posts.userId, userId)),
      });

      if (!post) {
        throw new Error("Post not found or you don't have permission to delete it");
      }

      // Delete the post
      await ctx.db
        .delete(posts)
        .where(eq(posts.id, input.postId));

      return { success: true };
    }),
});
