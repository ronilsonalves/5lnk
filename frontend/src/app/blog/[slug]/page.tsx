import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { getPostBySlug } from "@/lib/hooks/useContent";
import { Post } from "contentlayer/generated";
import Content from "@/components/Content";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;
  const post = await fechPostData(slug);
  if (post === undefined) {
    return {
      title: `Page not found | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
      description: "Sorry, we couldn't find the page you're looking for.",
    };
  }
  return {
    title: post.title + " | Blog",
    authors: [
      {
        name: post.author.name,
        url: post.author.href,
      },
    ],
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
      type: "article",
      images: [
        {
          url: post.imageUrl,
          width: 800,
          height: 600,
          alt: post.title,
        },
      ],
    },
  };
}

async function fechPostData(slug: string): Promise<Post> {
  return getPostBySlug(slug);
}

export default async function Article({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const post = await fechPostData(slug);
  if (!post) {
    return notFound();
  }
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 my-12">
        <Content post={post} />
      </div>
      <Footer />
    </>
  );
}
