import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { posts, userAddresses } from "~/server/db/schema";
import { sql } from "@vercel/postgres";
import { eq } from "drizzle-orm";

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
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(posts).values({
        latitude: input.latitude,
        longitude: input.longitude,
        skill: input.skill,
        description: input.description,
        userId: input.userId,
        createdAt: new Date(),
      });
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
      const radiusInKm = input.maxDistance || 1; // Default to 1 kilometer radius if not specified
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
        if (isNaN(lat) || isNaN(lon)) {
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
});
