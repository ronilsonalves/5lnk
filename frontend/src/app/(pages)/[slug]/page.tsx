import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import LinksPage from "@/types/LinksPage";
import { getPageBySlug } from "@/lib/hooks/usePages";
import Links from "@/components/links-page/Links";
import Header from "@/components/links-page/Header";
import { Footer } from "@/components/links-page/Footer";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;
  const page = await fechPageData(slug);
  if (page.alias === undefined) {
    return {
      title: `Page not found | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
      description: "Sorry, we couldn't find the links' page you're looking for.",
    };
  }
  return {
    title: page.title + " | " + process.env.NEXT_PUBLIC_SITE_NAME,
    description: page.description,
    openGraph: {
      title: page.title + " | " + process.env.NEXT_PUBLIC_SITE_NAME,
      description: page.description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${page.alias}`,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME,
      type: "website",
      images: page.imageURL,
    },
  };
}

/**
 * Fetches page data for a given slug.
 * @param slug - The slug of the page to fetch.
 * @returns A Promise that resolves to a LinksPage object.
 */
async function fechPageData(slug: string): Promise<LinksPage> {
  const headersList = headers();
  const userAgent = headersList.get("user-agent");
  return getPageBySlug(slug, userAgent!);
}

export default async function LinksPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const page = await fechPageData(slug);
  if (page.alias === undefined) {
    return notFound();
  }

  const {imageURL, title, description, links } = page;

  return (
    <>
      <main className="hero min-h-screen bg-base-200">
        <div className="text-center hero-content flex-col w-full">
          <Header
            title={title}
            description={description}
            avatarUrl={imageURL}
          />
          <Links links={links} />
        </div>
      </main>
      <Footer />
    </>
  );
}
