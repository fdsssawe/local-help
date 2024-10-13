import React, { useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card"
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { api } from "~/trpc/react";



export function PostCard(postData : {title: string, description: string, userId: string}) {

    const [user, setUser] = useState(null);

    useEffect(() => {
      api.post.getUser.useQuery({ userId: postData.userId });
    }, [user]);

    return (
        <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{postData.title}</CardTitle>
        <CardDescription>{postData.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Label>{user}</Label>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
    );
};

export default PostCard;