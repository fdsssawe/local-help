"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "~/lib/supabase";
import { cn } from "~/lib/utils";
import Spinner from "./ui/spinner";
import Image from "next/image";
import { UserRating } from "./ui/user-rating";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface ChatComponentProps {
  conversation_id: string;
  partner_name?: string;
  partner_avatar?: string;
  post_title?: string;
}

const MAX_MESSAGE_LENGTH = 500;

export default function ChatComponent({ 
  conversation_id,
  partner_name,
  partner_avatar,
  post_title 
}: ChatComponentProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const utils = api.useUtils();
  
  const { data: initialMessages, isLoading } = api.chat.getMessages.useQuery(
    { conversation_id },
    { 
      refetchOnWindowFocus: false,
      enabled: !!conversation_id
    }
  );

  const { data: conversationDetails } = api.chat.getConversationDetails.useQuery(
    { conversation_id },
    { enabled: !!conversation_id && !!user }
  );

  const partnerId = conversationDetails?.partnerId || undefined;

  const { mutate: sendMessage } = api.chat.sendMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");
      utils.chat.getMessages.invalidate({ conversation_id });
    },
  });

  useEffect(() => {
    setMessages([]);
  }, [conversation_id]);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user?.id ?? '',
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
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              {partner_avatar ? (
                <div className="relative h-7 w-7 rounded-full overflow-hidden">
                  <Image
                    src={partner_avatar}
                    alt={partner_name ?? "User"}
                    width={28}
                    height={28}
                  />
                </div>
              ) : (
                <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">{partner_name?.charAt(0) ?? "?"}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">{partner_name ?? "Chat"}</h2>
            </div>
          </div>
          {partnerId && (
            <UserRating 
              userId={partnerId}
              size="sm"
              showRatingDialog={true}
            />
          )}
        </div>
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
                className={`p-3 rounded-lg max-w-sm break-words whitespace-pre-wrap ${
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
        <div className="flex flex-col">
          <textarea
            value={newMessage}
            onChange={(e) => {
              if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                setNewMessage(e.target.value);
              }
            }}
            onKeyDown={handleKeyPress}
            className="flex-1 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-pre-wrap break-words"
            placeholder="Type a message..."
            rows={3}
            maxLength={MAX_MESSAGE_LENGTH}
            style={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}
          />
          <div className="flex justify-between items-center mt-2">
            <span className={`text-xs ${newMessage.length > MAX_MESSAGE_LENGTH ? 'text-red-500' : 'text-muted-foreground'}`}>
              {newMessage.length} / {MAX_MESSAGE_LENGTH}
            </span>
            <button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || newMessage.length > MAX_MESSAGE_LENGTH}
              className={`ml-2 px-4 py-2 rounded-lg flex items-center justify-center ${
                newMessage.trim() && newMessage.length <= MAX_MESSAGE_LENGTH ? 'bg-accent text-white' : 'bg-secondary text-white cursor-not-allowed'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
