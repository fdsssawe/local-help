import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { db } from "~/server/db";
import { conversations } from "~/server/db/schema";
import { eq, or, and } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { supabase } from "~/lib/supabase";

// Fetch user info from Clerk
const getUserDetails = async (userId: string) => {
  const user = await clerkClient.users.getUser(userId);
  return { name: user?.firstName, avatar: user?.imageUrl };
};

export const chatRouter = createTRPCRouter({
  // ✅ Start a conversation

  startChat: protectedProcedure
  .input(z.object({ post_id: z.string(), receiver_id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const sender_id = ctx.userId;
    if (!sender_id) throw new Error("Unauthorized");

    // Fixing the `.or()` condition with proper string interpolation

    // Check if conversation already exists in Supabase
    const { data: existingChat, error: fetchError } = await supabase
      .from("conversations")
      .select("*")
      .match({
        post_id: input.post_id,
        sender_id: sender_id,
        receiver_id: input.receiver_id,
      })
      .or(
        `post_id.eq.${input.post_id},sender_id.eq.${input.receiver_id},receiver_id.eq.${sender_id}`
      )
      .maybeSingle(); // ✅ Returns `null` if no match (instead of throwing)

    if (fetchError) throw new Error(fetchError.message);
    if (existingChat) return existingChat; // ✅ Return existing chat if found

    // Create new conversation in Supabase
    const { data: newChat, error: insertError } = await supabase
      .from("conversations")
      .insert([
        {
          post_id: input.post_id,
          sender_id,
          receiver_id: input.receiver_id,
          status: "pending",
        },
      ])
      .select("*")
      .single();

    if (insertError) throw new Error(insertError.message);

    return newChat;
  }),

  // ✅ Fetch user conversations
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;
    if (!userId) throw new Error("Unauthorized");

    const chats = await db
      .select()
      .from(conversations)
      .where(or(eq(conversations.sender_id, userId), eq(conversations.receiver_id, userId)));

    // Fetch sender & receiver details from Clerk
    const enrichedChats = await Promise.all(
      chats.map(async (chat) => ({
        ...chat,
        sender: await getUserDetails(chat.sender_id),
        receiver: await getUserDetails(chat.receiver_id),
      }))
    );

    return enrichedChats;
  }),
  
  sendMessage: protectedProcedure
    .input(z.object({ conversation_id: z.string(), message: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const sender_id = ctx.userId;
      if (!sender_id) throw new Error("Unauthorized");

      const { error } = await supabase
        .from("messages")
        .insert({ sender_id, conversation_id: input.conversation_id, message: input.message });

      if (error) throw new Error(error.message);

      return { success: true };
    }),

  // ✅ Fetch messages for a conversation
  getMessages: protectedProcedure
    .input(z.object({ conversation_id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", input.conversation_id)
        .order("created_at", { ascending: true });

      if (error) throw new Error(error.message);

      return data;
    }),
});

