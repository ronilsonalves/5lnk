import Image from "next/image";
import Link from "next/link";
import Post from "@/types/Post";

interface ArticleCardProps {
  post: Post;
}
export default function ArticleCard({ post }: ArticleCardProps) {
  return (
    <article
      key={post.id}
      className="flex flex-col items-start justify-between"
    >
      <Link href={`${post.slug}`}>
        <div className="relative w-full">
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={1080}
            height={720}
            priority={false}
            title={post.title}
            loading="lazy"
            placeholder="empty"
            className="aspect-[16/9] w-full rounded-2xl bg-white-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
          />
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-purple-100/10" />
        </div>
      </Link>
      <div className="max-w-xl">
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
        <div className="group relative">
          <h3 className="mt-3 text-lg font-semibold leading-6 text-white-900 group-hover:text-white-600">
            <Link href={`${post.slug}`}>
              <span className="absolute inset-0" />
              {post.title}
            </Link>
          </h3>
          <p className="mt-5 line-clamp-3 text-sm leading-6 text-white-600">
            {post.description}
          </p>
        </div>
        <div className="relative mt-8 flex items-center gap-x-4">
          <Image
            src={post.author.imageUrl}
            alt={post.author.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full bg-white-100"
          />
          <div className="text-sm leading-6">
            <p className="font-semibold text-white-900">
              <Link href={post.author.href}>
                <span className="absolute inset-0" />
                {post.author.name}
              </Link>
            </p>
            <p className="text-white-600">{post.author.role}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
