import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { getPageBySlug } from "@/lib/hooks/useContent";
import { Page } from "contentlayer/generated";
import Content from "@/components/Content";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const slug = params.slug;
  const page = await fetchPageData(slug);
  if (page === undefined) {
    return {
      title: `Page not found | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
      description: "Sorry, we couldn't find the page you're looking for.",
    };
  }
  return {
    title: page.title + " | " + process.env.NEXT_PUBLIC_SITE_NAME,
    openGraph: {
      title: page.title + " | " + process.env.NEXT_PUBLIC_SITE_NAME,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/pages/${page.slug}`,
      type: "website",
    },
  };
}

async function fetchPageData(slug: string): Promise<Page> {
  return getPageBySlug(slug);
}

export default async function Page({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const page = await fetchPageData(slug);
  if (!page) {
    return notFound();
  }
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 my-12">
        <Content page={page} />
      </div>
      <Footer />
    </>
  );
}
