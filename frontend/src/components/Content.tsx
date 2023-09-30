import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import { useMDXComponent } from "next-contentlayer/hooks";
import { Post, Page } from "contentlayer/generated";
import '@styles/markdown.css'

interface ContentProps {
  post?: Post;
  page?: Page;
}

const mdxComponents: MDXComponents = {
  a: ({ href, children }) => <Link href={href as string}>{children}</Link>,
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold mt-8 mb-2 text-white-900">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-bold mt-8 mb-2 text-white-900">{children}</h2>
  ),
  p: ({ children }) => <p className="my-4">{children}</p>,
  
  img: ({ alt, src }) => (
    <Image
      alt={alt!}
      src={src!}
      width={1080}
      height={720}
      loading="lazy"
      className="aspect-[16/9] w-full rounded-2xl object-cover sm:aspect-[2/1]"
    />
  ),
};

const Content: FC<ContentProps> = async ({ post, page }: ContentProps) => {
  const MDXContent = useMDXComponent(post?.body.code! ?? page?.body.code!);

  if (post) {
    return (
      <article className="my-2">
        <div className="mx-auto max-w-2xl text-center my-6">
          <h1 className="text-3xl font-bold tracking-tight text-white-900 sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-8 flex items-center gap-x-4 text-sm">
            <time
              dateTime={new Date(post.date).toLocaleDateString()}
              className="text-white-500"
            >
              {new Date(post.date).toLocaleDateString()}
            </time>
            {post.tags.map((tag) => (
              <p
                key={tag}
                className="relative z-10 rounded-full bg-base-50 px-3 py-1.5 font-medium text-white-600 hover:bg-gray-100 hover:text-gray-900"
              >
                {tag}
              </p>
            ))}
          </div>
          <div className="relative mt-8 flex items-center gap-x-4">
            <Image
              src={post.author.imageUrl}
              alt={post.author.name}
              width={40}
              height={40}
              loading="lazy"
              className="h-10 w-10 rounded-full bg-white-100"
            />
            <div className="text-sm leading-6">
              <p className="font-semibold text-white-900">
                <a href={post.author.href}>
                  <span className="absolute inset-0" />
                  {post.author.name}
                </a>
              </p>
              <p className="text-white-600">{post.author.role}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-flow-col gap-2 justify-center my-8">
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={1080}
            height={720}
            priority
            className="aspect-[16/9] w-full rounded-2xl object-cover sm:aspect-[2/1] bg:black"
          />
        </div>
        <MDXContent components={mdxComponents} />
      </article>
    );
  }

  if (page) {
    return (
      <div className="my-2">
        <div className="mx-auto max-w-7xl text-center my-6">
          <h1 className="text-3xl font-bold tracking-tight text-white-900 sm:text-4xl">
            {page.title}
          </h1>
          <div className="mt-8 flex items-left gap-x-4 text-sm">
            <time
              dateTime={new Date(page.date).toLocaleDateString()}
              className="text-white-500 italic"
            >
              Last update: {new Date(page.date).toLocaleDateString()}
            </time>
          </div>
        </div>
        <MDXContent components={mdxComponents} />
      </div>
    );
  }
};

export default Content;