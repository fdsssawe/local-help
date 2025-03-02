"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "~/lib/supabase";
import { cn } from "~/lib/utils";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export default function ChatPage({ conversation_id }: { conversation_id: string }) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const { data: initialMessages } = api.chat.getMessages.useQuery({ conversation_id });

  const { mutate: sendMessage } = api.chat.sendMessage.useMutation({
    onSuccess: () => setNewMessage(""),
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // ✅ Supabase Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    sendMessage({ conversation_id, message: newMessage });
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <div className="flex-1 overflow-y-auto bg-white p-4 rounded shadow flex gap-2 flex-col">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex", msg.sender_id === user?.id ? "justify-end" : "justify-start")}>
            <div
              className={`p-2 rounded max-w-xs  ${
                msg.sender_id === user?.id ? "bg-blue-500 text-white self-end right-0 top-0" : "bg-gray-200 text-black left-0 top-0"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
      </div>
      <div className="flex mt-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
          Send
        </button>
      </div>
    </div>
  );
}
