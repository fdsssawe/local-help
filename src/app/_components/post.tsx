"use client";

import { useState } from "react";
import type { Post } from "~/types";
import { api } from "~/trpc/react";

export function LatestPost() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();
  const utils = api.useUtils();
  const [post, setPost] = useState({} as Post);
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setPost({} as Post);
    },
  });


  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.skill}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // if (!user.userId) throw new Error("Unauthorized");
          createPost.mutate({ ...post, userId: "fdf"});
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Skill"
          value={post.skill}
          onChange={(e) => setPost({ ...post, skill: e.target.value })}
          className="w-full rounded-full px-4 py-2 text-black"
        />
        <input
          type="text"
          placeholder="Latitude"
          value={post.latitude}
          onChange={(e) => setPost({ ...post, latitude: e.target.value })}
          className="w-full rounded-full px-4 py-2 text-black"
        />
        <input
          type="text"
          placeholder="Longitude"
          value={post.longitude}
          onChange={(e) => setPost({ ...post, longitude: e.target.value })}
          className="w-full rounded-full px-4 py-2 text-black"
        />
        <input
          type="text"
          placeholder="Description"
          value={post.description}
          onChange={(e) => setPost({ ...post, description: e.target.value })}
          className="w-full rounded-full px-4 py-2 text-black"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
