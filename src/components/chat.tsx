"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "~/lib/supabase";
import { cn } from "~/lib/utils";
import Spinner from "./ui/spinner";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export default function ChatComponent({ conversation_id }: { conversation_id: string }) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const utils = api.useUtils();
  
  const { data: initialMessages, isLoading } = api.chat.getMessages.useQuery(
    { conversation_id },
    { 
      refetchOnWindowFocus: false,
      // This ensures we'll refetch when conversation_id changes
      queryKey: ['chat.getMessages', { conversation_id }]
    }
  );

  const { mutate: sendMessage } = api.chat.sendMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");
      // Invalidate the query for the current conversation to refresh messages
      utils.chat.getMessages.invalidate({ conversation_id });
    },
  });

  // Reset messages when switching conversations
  useEffect(() => {
    setMessages([]);
  }, [conversation_id]);

  // Update messages when initialMessages changes
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ Supabase Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${conversation_id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversation_id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation_id]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    
    // Optimistically add the message to the UI
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user?.id || '',
      message: newMessage,
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    sendMessage({ conversation_id, message: newMessage });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b border-gray-200 p-4 bg-primary/10">
        <h2 className="text-lg font-semibold">Chat</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex gap-2 flex-col bg-background">
        {isLoading ? (
          <div className="flex items-center justify-center h-56">
            <Spinner size="8"/>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.sender_id === user?.id ? "justify-end" : "justify-start")}>
              <div
                className={`p-3 rounded-lg max-w-sm ${
                  msg.sender_id === user?.id ? "bg-primary/40 text-text" : "bg-gray-200 text-black"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-gray-200 p-4">
        <div className="flex">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
            rows={2}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()} 
            className={`ml-2 px-4 rounded-lg flex items-center justify-center ${
              newMessage.trim() ? 'bg-accent text-white' : 'bg-secondary text-white cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
