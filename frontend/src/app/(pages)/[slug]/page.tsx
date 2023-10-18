import Link from "@/types/Link";
import Links from "@/components/links-page/Links";
import Header from "@/components/links-page/Header";
import { Footer } from "@/components/links-page/Footer";

type Props = {
  params: { slug: string };
};

export const metadata = {
  title: `@ronilsonalves | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  description: "Links from @ronilsonalves",
};

export default function LinksPage() {
  const avatarUrl = "https://avatars.githubusercontent.com/u/8782579?v=4";
  const title = "@ronilsonalves";
  const description = metadata.description;
  const links = [
    {
      id: "1137d427-25bf-4967-b6bb-a9a97a512611",
      original: "https://github.com/ronilsonalves",
      title: "GitHub",
      shortened: "74Xzn0",
      finalUrl: "https://5lnk.me/74Xzn0",
      userId: "VVcLOX3GfXbn7oCgrmNRbYV3Ifj1",
      createdAt: "2023-10-15T19:55:30.097844Z",
      clicks: 0,
    },
    {
      id: "2d799d3a-c153-4992-97a4-cc0b551a90f3",
      original: "https://www.linkedin.com/in/ronilsonalves",
      title: "LinkedIn",
      shortened: "VBmsMH",
      finalUrl: "https://5lnk.me/VBmsMH",
      userId: "VVcLOX3GfXbn7oCgrmNRbYV3Ifj1",
      createdAt: "2023-10-15T19:55:30.097847Z",
      clicks: 0,
    },
  ] as unknown as Link[];
  return (
    <>
      <main className="hero min-h-screen bg-base-200">
        <div className="text-center hero-content flex-col w-full">
          <Header
            title={title}
            description={description}
            avatarUrl={avatarUrl}
          />
          <Links links={links} />
        </div>
      </main>
      <Footer />
    </>
  );
}