import { and, or, eq } from "drizzle-orm"; // Import Drizzle operators
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { chats } from "~/server/db/schema";
import { db } from "~/server/db";
import { supabase } from "~/lib/supabase";

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
      const { data, error } = await supabase.from('chats').insert({ senderid: senderId, receiverid: input.receiverId, message: input.message })
      console.log(data, error)
      return { success: true };
    }),

    getMessages: protectedProcedure
    .input(
      z.object({
        receiverid: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;
      if (!userId) {
        throw new Error("User not authenticated");
      }
  
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .or(
          `and(senderid.eq.${userId},receiverid.eq.${input.receiverid}),and(senderid.eq.${input.receiverid},receiverid.eq.${userId})`
        )
        .order("createdat", { ascending: true });
  
      if (error) {
        throw new Error(error.message);
      }
  
      return data;
    }),
});
