import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { getPostBySlug } from "@/lib/hooks/usePosts";
import Post from "@/types/Post";
import ArticleContent from "@/app/blog/components/ArticleContent";
import Footer from "@/components/Footer";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;
  const post = await fechPostData(slug);
  return {
    title: post.title + " | " + process.env.NEXT_PUBLIC_SITE_NAME,
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

export default async function Article({params: { slug }} : {
  params: { slug: string };
}) {
  const post = await fechPostData(slug);
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 my-12">        
        <ArticleContent post={post} />
      </div>
      <Footer />
    </>
  );
}