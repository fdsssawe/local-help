import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { db } from "~/server/db";
import { conversations } from "~/server/db/schema";
import { eq, or, and } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { supabase } from "~/lib/supabase";

const getUserDetails = async (userId: string) => {
  const user = await clerkClient.users.getUser(userId);
  return { name: user?.firstName, avatar: user?.imageUrl };
};

export const chatRouter = createTRPCRouter({

  startChat: protectedProcedure
  .input(z.object({ post_id: z.string(), receiver_id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const sender_id = ctx.userId;
    if (!sender_id) throw new Error("Unauthorized");

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
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (existingChat) return existingChat;

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

  getUserChats: protectedProcedure
  .input(
    z.object({
      cursor: z.number().nullable().optional(),
      limit: z.number().min(1).max(20).default(10),
    })
  )
  .query(async ({ ctx, input }) => {
    const userId = ctx.userId;
    const start = input.cursor ?? 0;
    const end = start + input.limit - 1;

    // Step 1: Fetch conversations from Supabase
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .range(start, end);

    if (error) throw new Error(error.message);

    // Step 2: Extract unique post_ids from conversations
    const postIds = [...new Set(conversations.map((conv) => conv.post_id))];

    // Step 3: Fetch post titles from Postgres (Drizzle)
    let postsMap = new Array<[string, string]>();
    if (postIds.length > 0) {
      const posts = await ctx.db.query.posts.findMany({
        where: (posts, { inArray }) => inArray(posts.id, postIds),
        columns: { id: true, skill: true },
      });

      postsMap = posts.map((post) => [post.id.toString(), post.skill] as [string, string]);
    }
    return {
      chats: conversations.map((conv) => ({
        id: conv.id,
        post_id: conv.post_id,
        post_title: postsMap.find(([id]) => id === conv.post_id)?.[1] ?? "Unknown Post",
        sender_id: conv.sender_id,
        receiver_id: conv.receiver_id,
        status: conv.status,
        created_at: conv.created_at,
      })),
      nextCursor: conversations.length < input.limit ? null : start + input.limit,
    };
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

