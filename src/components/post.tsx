"use client";

import { useEffect, useState } from "react";
import type { Post } from "~/types";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "~/components/hooks/use-toast"
import { Button } from "~/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Skeleton } from "./ui/skeleton";

const FormSchema = z.object({
  skill: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
})

export function LatestPost() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const utils = api.useUtils();
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      form.reset()
    },
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      skill: "",
      description: ""
    },
  })

  useEffect(() => {
    if (typeof window !== "undefined" && 'geolocation' in navigator) {
      // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        setLocation({ latitude, longitude });
      });
    }
  }, []);

  // const { data: latestPost, isLoading } = api.post.getNearbyPosts.useQuery(
  //   {
  //     latitude: location?.latitude.toString() ?? "0",
  //     longitude: location?.longitude.toString() ?? "0",
  //   },
  //   {
  //     enabled: !!location, // Only run the query if location is available
  //   }
  // );

  function onSubmit(data: z.infer<typeof FormSchema>) {
    createPost.mutate({
        ...data,
        userId: "fdf", // Assuming userId is hardcoded for now
        latitude: location?.latitude.toString() ?? "0",
        longitude: location?.longitude.toString() ?? "0",
    })
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  if (!location) {
    return (
      <div className="w-full max-w-[18rem]">
      {/* {isLoading ? (
        <p>Loading posts...</p>
      ) : latestPost && latestPost.rows.length > 0 ? (
        <p className="truncate">Your most recent post {latestPost.rows[0]?.description}</p>
      ) : (
        <p>You have no posts yet.</p>
      )} */}
      <div className="w-full space-y-4 h-[216px]">
        <div className="w-full h-[72px] space-y-2">
        <Skeleton className="w-[27px] h-[19px]"/>
        <Skeleton className="w-full h-10"/>
        </div>
        <div className="w-full h-[72px] space-y-2">
        <Skeleton className="w-[73px] h-[19px]"/>
        <Skeleton className="w-full h-10"/>
        </div>
        <Skeleton className="w-full h-10 rounded-full"/>
      </div>
    </div>
    )
  }

  return (
    <div className="w-full max-w-[18rem]">
      {/* {isLoading ? (
        <p>Loading posts...</p>
      ) : latestPost && latestPost.rows.length > 0 ? (
        <p className="truncate">Your most recent post {latestPost.rows[0]?.description}</p>
      ) : (
        <p>You have no posts yet.</p>
      )} */}
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="skill"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Need to fix sink e.g." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="I need help with ... e.g." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">{createPost.isPending ? "Submitting..." : "Submit"}</Button>
      </form>
    </Form>
    </div>
  );
}
