"use client";
import { Suspense, useEffect, useState } from "react";
import { usePosts } from "@/lib/hooks/usePosts";
import Post from "@/types/Post";
import ArticleCard from "@/app/blog/components/ArticleCard";
import Link from "next/link";

export default function HomeBlog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    usePosts(setPosts, setLoading, setError);
  }, []);
  return (
    <div className="bg-base-200 py-12 sm:py-16" id="blog">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white-900 sm:text-4xl">
            From the blog
          </h2>
          <p className="mt-2 text-lg leading-8 text-white-600">
            Learn how to grow your business with our expert advice.
          </p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {posts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.id}>
                <ArticleCard key={post.id} post={post} />
              </Link>
            ))}
          </div>
        </Suspense>
      </div>
    </div>
  );
}
