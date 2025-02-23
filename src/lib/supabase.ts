import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Message = {
    senderId: string;
    receiverId: string;
    message: string;
    createdAt: string;
    // Add other fields as needed
  };
  

  export const listenForMessages = (
    userId: string,
    callback: (message: Message) => void
  ) => {
    const channel = supabase
      .channel(`chat-messages-${userId}`) // Unique channel for each user
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
          filter: `receiverId=eq.${userId}`, // Remove this if needed
        },
        (payload) => {
          console.log('New message:', payload);
          callback(payload.new as Message);
        }
      )
      .subscribe();
  
    console.log("✅ Subscribed to Supabase Realtime for user:", userId);
  
    return () => {
      supabase.removeChannel(channel);
    };
  };
  

