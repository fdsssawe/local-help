"use client";

import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function ConversationsList() {
  const { user } = useUser();
  const { data: conversations, isLoading } = api.chat.getConversations.useQuery();

  if (isLoading) return <p>Loading chats...</p>;
  if (!conversations?.length) return <p>No conversations found.</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Your Chats</h2>
      <ul>
        {conversations.map((chat) => {
          const otherUser = chat.sender_id === user?.id ? chat.receiver : chat.sender;
          return (
            <li key={chat.id} className="border p-2 mb-2 rounded">
              <Link href={`/chat/${chat.id}`}>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                  <img src={otherUser.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                  <span>{otherUser.name}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
