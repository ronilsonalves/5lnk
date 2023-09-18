import Image from "next/image";
import ReactMarkdown from "react-markdown";

import Post from "@/types/Post";

interface ArticleProps {
  post: Post;
}

const ArticleContent: React.FC<ArticleProps> = async ({post}: ArticleProps) => {
  return (
    <article className="my-2">
      <div className="mx-auto max-w-2xl text-center my-6">
        <h1 className="text-3xl font-bold tracking-tight text-white-900 sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-2 text-lg leading-8 text-white-600">
          {post.description}
        </p>
        <div className="mt-8 flex items-center gap-x-4 text-xs">
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
          <img
            src={post.author.imageUrl}
            alt={post.author.name}
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
      <div className="grid grid-flow-col justify-center my-8">
        <Image
          src={post.imageUrl}
          alt={post.title}
          width={800}
          height={600}
          priority
          className="aspect-[16/9] w-full rounded-2xl object-cover sm:aspect-[2/1] lg:aspect-[3/2] bg:black"
        />
      </div>
      <ReactMarkdown>{post.content}</ReactMarkdown>
    </article>
  );
};

export default ArticleContent;
