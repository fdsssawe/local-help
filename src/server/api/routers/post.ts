import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { posts } from "~/server/db/schema";
import { sql } from "@vercel/postgres"; // Import the sql tagged template

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

  // Fetch posts within 0.3 km radius
  getNearbyPosts: publicProcedure
    .input(
      z.object({
        latitude: z.string(),
        longitude: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const lat = parseFloat(input.latitude);
      const lon = parseFloat(input.longitude);
      const radiusInKm = 1; // 300 meters

      const nearbyPosts = await sql`
  SELECT * FROM (
    SELECT *, (
      ${EARTH_RADIUS_KM} * acos(
        cos(radians(${lat})) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(${lon})) + 
        sin(radians(${lat})) * sin(radians(latitude))
      )
    ) AS distance
    FROM local_help_posts
  ) AS posts_with_distance
  WHERE distance < ${radiusInKm}
  ORDER BY distance ASC;
`;


      return nearbyPosts ?? [];
    }),
});
