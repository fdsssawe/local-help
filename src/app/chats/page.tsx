'use client'

import { api } from "~/trpc/react";
import { useRef, useEffect } from "react";
import Spinner from "~/components/ui/spinner";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ChatList = () => {
    const router = useRouter();
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
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

    return (
        <div className='w-full h-full flex pt-10 flex-col items-center relative'>
            <div className="w-full lg:max-w-[600px] flex flex-col gap-4 text-center">
                {chats.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        No conversations yet
                    </div>
                ) : (
                    chats.map((chat) => (
                        <div
                            key={chat.id}
                            className="h-20 flex items-center px-4 rounded-xl border-[0.5px] shadow-md border-primary/40 cursor-pointer hover:bg-primary/10"
                            onClick={() => router.push(`/chat/${chat.id}`)}
                        >
                            <div className="flex-shrink-0 mr-3">
                                {chat.partner_avatar ? (
                                    <div className="relative h-10 w-10 rounded-full overflow-hidden">
                                        <Image
                                            src={chat.partner_avatar}
                                            alt={chat.partner_name || "User"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-500">{chat.partner_name?.charAt(0) || "?"}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-semibold">{chat.post_title}</span>
                                <span className="text-sm text-gray-500">with {chat.partner_name || "Unknown User"}</span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={loadMoreRef} className="w-full h-40 flex justify-center items-center"></div>
                {isFetchingNextPage && <Spinner size="10" className="text-primary" />}
            </div>
        </div>
    );
};

export default ChatList;
