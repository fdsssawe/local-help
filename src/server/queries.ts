import "server-only";
import { db } from "./db";
import { auth } from "@clerk/nextjs/server";
import { posts } from "./db/schema";
// import { and, eq } from "drizzle-orm";
// import { redirect } from "next/navigation";
// import analyticsServerClient from "./analytics";
import type { Post } from "~/types";

export async function createPost(post : Post) {
  const user = auth();
  if (!user.userId) throw new Error("Unauthorized");
  const { skill, description, latitude, longitude } = post;
  const newPost = await db.insert(posts).values({
  latitude : latitude,
  longitude : longitude,
  skill : skill,
  description : description,
  userId : user.userId,
  createdAt: new Date(),
  });
  console.log(newPost);
  return newPost;
}

// export async function getImage(id: number) {
//   const user = auth();
//   if (!user.userId) throw new Error("Unauthorized");

//   const image = await db.query.images.findFirst({
//     where: (model, { eq }) => eq(model.id, id),
//   });
//   if (!image) throw new Error("Image not found");

//   if (image.userId !== user.userId) throw new Error("Unauthorized");

//   return image;
// }

// export async function deleteImage(id: number) {
//   const user = auth();
//   if (!user.userId) throw new Error("Unauthorized");

//   await db
//     .delete(images)
//     .where(and(eq(images.id, id), eq(images.userId, user.userId)));

//   analyticsServerClient.capture({
//     distinctId: user.userId,
//     event: "delete image",
//     properties: {
//       imageId: id,
//     },
//   });

//   redirect("/");
// }
