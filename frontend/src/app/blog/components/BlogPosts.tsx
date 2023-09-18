"use client";

import { useEffect, useState } from "react";

import Post from "@/types/Post";
import { usePosts } from "@/lib/hooks/usePosts";
import ArticleCard from "@/app/blog/components/ArticleCard";

export default function BlogPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    usePosts(setPosts, setLoading, setError);
  }, []);
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 my-12">
      <div className="mx-auto max-w-2xl text-center my-6">
        <h2 className="text-3xl font-bold tracking-tight text-white-900 sm:text-4xl">
          Blog
        </h2>
        <p className="mt-2 text-lg leading-8 text-white-600">
          Learn how to grow your business with our expert advice.
        </p>
      </div>
      <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {posts.map((post) => (
          <ArticleCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
