import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
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

    // Step 1: Fetch conversations from Supabase with proper OR syntax
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .range(start, end);

    if (error) throw new Error(error.message);

    // Add debug logging to see what's being fetched
    console.log(`Found ${conversations?.length ?? 0} conversations for user ${userId}`);

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
    
    // Step 4: Get user details for all conversation partners
    const chatPromises = conversations.map(async (conv) => {
      // Determine who the other user in the conversation is
      const otherUserId = conv.sender_id === userId ? conv.receiver_id : conv.sender_id;
      
      // Get the other user's details
      const userDetails = await getUserDetails(otherUserId as string);
      
      return {
        id: conv.id,
        post_id: conv.post_id,
        post_title: postsMap.find(([id]) => id === conv.post_id)?.[1] ?? "Unknown Post",
        sender_id: conv.sender_id,
        receiver_id: conv.receiver_id,
        status: conv.status,
        created_at: conv.created_at,
        partner_name: userDetails.name ?? "Unknown User",
        partner_avatar: userDetails.avatar ?? "",
        partner_id: otherUserId,
      };
    });
    
    const chats = await Promise.all(chatPromises);
    
    return {
      chats,
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

  // Fix the checkConversationExists procedure to use Supabase consistently
  checkConversationExists: protectedProcedure
    .input(z.object({
      post_id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;
      if (!userId) throw new Error("Unauthorized");
      
      try {
        // Use Supabase consistently with the rest of the chat functions
        const { data: conversation, error } = await supabase
          .from("conversations")
          .select("id")
          .eq("post_id", input.post_id)
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .maybeSingle();
        
        if (error) {
          console.error("Error checking conversation:", error);
          throw new Error(error.message);
        }
        
        return {
          exists: !!conversation,
          conversation_id: conversation?.id || null
        };
      } catch (error) {
        console.error("Error checking for existing conversation:", error);
        return {
          exists: false,
          conversation_id: null
        };
      }
    }),
});

