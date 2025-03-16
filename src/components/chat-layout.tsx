"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import { useRef, useEffect, useState } from "react";
import Spinner from "~/components/ui/spinner";
import Image from "next/image";
import ChatComponent from "./chat";
import { cn } from "~/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export default function ChatLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    searchParams?.get("id")
  );
  const [isChangingChat, setIsChangingChat] = useState(false);

  useEffect(() => {
    const id = searchParams?.get("id");
    if (id !== activeConversationId) {
      if (id) {
        setIsChangingChat(true);
        setTimeout(() => {
          setActiveConversationId(id);
          setIsChangingChat(false);
        }, 10);
      } else {
        setActiveConversationId(null);
      }
    }
  }, [searchParams, activeConversationId]);

  // Fetch all chats for the sidebar
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    api.chat.getUserChats.useInfiniteQuery(
      { limit: 10 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const chats = data?.pages.flatMap((page) => page.chats) ?? [];
  const loadMoreRef = useRef(null);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        fetchNextPage();
      }
    });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleChatSelect = (chatId: string) => {
    if (chatId === activeConversationId) return; // Skip if already selected
    setIsChangingChat(true);
    router.push(`/chats?id=${chatId}`, { scroll: false });
  };

  // Find the active chat's details
  const activeChat = activeConversationId
    ? chats.find(chat => chat.id === activeConversationId)
    : null;

  return (
    <div className="flex h-full w-full border-gray-200 border-t">
      {/* Left sidebar with fixed header and scrollable chat list */}
      <div className="w-1/3 border-r border-gray-200 h-full flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200 bg-primary/10 flex-shrink-0">
          <h2 className="text-xl font-bold">Conversations</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1 p-2">
            {chats.length === 0 ? (
              isPending ? (
                <div className="flex items-center justify-center h-56">
                  <Spinner size="8"/>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                No conversations yet
              </div>
              )
            ) : (
              chats.map((chat: { id: string; partner_avatar?: string; partner_name?: string; post_title: string }) => (
                <motion.div
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  key={chat.id}
                  className={cn(
                    "flex items-center px-3 py-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200",
                    chat.id === activeConversationId && "bg-primary/40"
                  )}
                  onClick={() => handleChatSelect(chat.id)}
                >
                  <div className="flex-shrink-0 mr-3">
                    {chat.partner_avatar ? (
                      <div className="relative h-12 w-12 rounded-full overflow-hidden">
                        <Image
                          src={chat.partner_avatar}
                          alt={chat.partner_name ?? "User"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">{chat.partner_name?.charAt(0) ?? "?"}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="font-semibold truncate">{chat.post_title}</span>
                    <span className="text-sm text-gray-500 truncate">with {chat.partner_name ?? "Unknown User"}</span>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={loadMoreRef} className="w-full h-10 flex justify-center items-center">
              {isFetchingNextPage && <Spinner size="6" className="text-primary" />}
            </div>
          </div>
        </div>
      </div>

      <div className="w-2/3 h-full relative">
        <AnimatePresence mode="wait">
          {isChangingChat ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center bg-gray-50"
            >
              <Spinner size="10" className="text-primary" />
            </motion.div>
          ) : activeConversationId ? (
            <motion.div
              key={activeConversationId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ChatComponent 
                conversation_id={activeConversationId} 
                partner_name={activeChat?.partner_name}
                partner_avatar={activeChat?.partner_avatar}
                post_title={activeChat?.post_title}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex h-full items-center justify-center bg-gray-50"
            >
              <div className="text-center text-gray-500">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-16 w-16 mx-auto mb-4 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                  />
                </svg>
                <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
                <p>Select a conversation to start chatting</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
