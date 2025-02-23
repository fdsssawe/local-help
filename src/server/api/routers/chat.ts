import { and, or, eq } from "drizzle-orm"; // Import Drizzle operators
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { chats } from "~/server/db/schema";
import { db } from "~/server/db";

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(
      z.object({
        receiverId: z.string(),
        message: z.string().min(1, "Message cannot be empty"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const senderId = ctx.userId;
      if (!senderId) {
        throw new Error("User not authenticated");
      }
      await db.insert(chats).values({
        senderId,
        receiverId: input.receiverId,
        message: input.message,
      });
      return { success: true };
    }),

  getMessages: protectedProcedure
  .input(
    z.object({
      otherUserId: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const userId = ctx.userId;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    return await db.query.chats.findMany({
      where: or(
        and(eq(chats.senderId, userId), eq(chats.receiverId, input.otherUserId)),
        and(eq(chats.senderId, input.otherUserId), eq(chats.receiverId, userId))
      ),
      orderBy: (table, { asc }) => [asc(table.createdAt)],
    });
  }),
});
