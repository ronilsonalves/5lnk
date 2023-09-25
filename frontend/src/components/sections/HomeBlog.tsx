"use client";
import { Suspense, useEffect, useState } from "react";
import { usePosts } from "@/lib/hooks/useContent";
import Post from "@/types/Post";
import ArticleCard from "@/app/blog/components/ArticleCard";
import Link from "next/link";

export default function HomeBlog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    usePosts(setPosts, setError);
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
              <Link href={`${post.slug}`} key={post.id}>
                <ArticleCard key={post.id} post={post} />
              </Link>
            ))}
          </div>
        </Suspense>
        {error && (
        <div className="toast toast-end">
          <div className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
