import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { posts } from "~/server/db/schema";

export const postRouter = createTRPCRouter({

  create: publicProcedure
    .input(z.object({ skill: z.string(), description: z.string(), latitude: z.string(), longitude: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(posts).values({
        latitude : input.latitude,
        longitude : input.longitude,
        skill : input.skill,
        description : input.description,
        userId : input.userId,
        createdAt: new Date(),
      });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.posts.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return post ?? null;
  }),
});
