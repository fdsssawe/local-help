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
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Switch } from "./ui/switch";
import { MapPin, Home } from "lucide-react";
import { Card } from "./ui/card";

const FormSchema = z.object({
  skill: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
})

export function CreatePost() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [useRegisteredAddress, setUseRegisteredAddress] = useState(false);
  const utils = api.useUtils();
  const { user } = useUser();
  const router = useRouter();
  
  const { data: userAddress } = api.address.getUserAddress.useQuery(undefined, {
    enabled: !!user,
  });
  
  const createPost = api.post.create.useMutation({
    onSuccess: async (data) => {
      await utils.post.invalidate();
      form.reset();
      
      toast({
        title: "Post created successfully",
        description: "Your post has been published.",
      });
      
      if (data?.id) {
        router.push(`/post/${data.id}`);
      }
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
    if (!useRegisteredAddress && typeof window !== "undefined" && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        setLocation({ latitude, longitude });
      });
    }
  }, [useRegisteredAddress]);

  useEffect(() => {
    if (userAddress) {
      setUseRegisteredAddress(true);
    }
  }, [userAddress]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!location && !useRegisteredAddress) {
      toast({
        title: "Location required",
        description: "Please enable location services or use your registered address.",
        variant: "destructive",
      });
      return;
    }
    
    createPost.mutate({
      ...data,
      userId: user?.id ?? "",
      latitude: !useRegisteredAddress ? location?.latitude.toString() ?? "0" : "0",
      longitude: !useRegisteredAddress ? location?.longitude.toString() ?? "0" : "0",
      useRegisteredAddress: useRegisteredAddress && !!userAddress,
    });
  }

  if (!location && !useRegisteredAddress) {
    return (
      <div className="w-full max-w-[18rem]">
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
      {userAddress && (
        <Card className="p-3 mb-4 bg-secondary/10">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Location:</div>
            <div className="flex items-center gap-2">
              <span className="text-xs flex items-center"><MapPin size={12} className="mr-1" />Current</span>
              <Switch 
                checked={useRegisteredAddress} 
                onCheckedChange={setUseRegisteredAddress} 
              />
              <span className="text-xs flex items-center"><Home size={12} className="mr-1" />Address</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {useRegisteredAddress
              ? `Using your registered address`
              : "Using your current location"}
          </div>
        </Card>
      )}
      
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
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
        <Button 
          type="submit" 
          className="w-full mt-8"
          disabled={createPost.isPending || (!location && !useRegisteredAddress)}
        >
          {createPost.isPending ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
    </div>
  );
}
