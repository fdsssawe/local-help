"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react"; // Adjust this based on your TRPC setup
import { useUser } from "@clerk/nextjs"; // Clerk authentication
import { supabase } from "~/lib/supabase";

interface Message {
  id: number;
  senderid: string;
  receiverid: string;
  message: string;
  createdAt: string;
}

export default function ChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const receiverid = "user_2mwNdGfBWORQ85TqZkN1fBWr47z"; // Replace with the actual receiver ID

  const { mutate: sendMessage } = api.chat.sendMessage.useMutation({
    onSuccess: () => setNewMessage(""),
  });

  const { data: initialMessages } = api.chat.getMessages.useQuery(
    { receiverid: receiverid },
    { enabled: !!user }
  );

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chats" },
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
    sendMessage({ receiverId: receiverid, message: newMessage });
  };
  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <div className="flex-1 overflow-y-auto bg-white p-4 rounded shadow">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 my-2 rounded max-w-xs ${
              msg.receiverid === user?.id ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-black"
            }`}
          >
            {msg.message}
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
