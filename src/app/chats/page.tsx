'use client'

import { api } from "~/trpc/react";
import { useRef, useEffect } from "react";
import Spinner from "~/components/ui/spinner";
import { useRouter } from "next/navigation";

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
                {chats.map((chat) => (
                    <div key={chat.id} className="h-20 flex justify-center items-center rounded-xl border-[0.5px] shadow-md border-primary/40 cursor-pointer hover:bg-primary/10" onClick={() => router.push(`/chat/${chat.id}`)}>
                        {chat.post_title}
                    </div>
                ))}
                <div ref={loadMoreRef} className="w-full h-40 flex justify-center items-center">
                    {isFetchingNextPage && <Spinner size="10" className="text-primary" />}
                </div>
            </div>
        </div>
    );
};

export default ChatList;
