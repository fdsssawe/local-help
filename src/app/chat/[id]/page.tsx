"use client";

import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useParams } from "next/navigation";
import ChatPage from "~/components/chat";

export default function Chatss() {
  const { id: conversation_id } = useParams();
  const { user } = useUser();
  const [message, setMessage] = useState("");

  const { data: messages, isLoading } = api.chat.getMessages.useQuery({ conversation_id: conversation_id as string });
  const sendMessageMutation = api.chat.sendMessage.useMutation();

  const sendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate({ conversation_id: conversation_id as string, message });
    setMessage("");
  };

  if (isLoading) return <p>Loading messages...</p>;

  return (
    <ChatPage conversation_id={conversation_id as string}/>
  );
}
