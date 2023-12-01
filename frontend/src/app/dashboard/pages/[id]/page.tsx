import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Base from "@dashboard/home";
import Head from "@dashboard/components/Head";
import StatsChart from "@dashboard/analytics/components/StatsChart";
import Details from "@dashboard/pages/components/Details";
import { getAsyncPageById } from "@/lib/hooks/usePages";
import { getStatsByDate } from "@/lib/hooks/useStats";

import LinksPage from "@/types/LinksPage";
import { StatsByDate } from "@/types/Stats";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  let page: LinksPage = {} as LinksPage;
  await fetchPageData(id).then((pageData) => {
    if (pageData === undefined || pageData.id === undefined) {
      return {
        title: `Page not found | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
        description: "Sorry, we couldn't find the page you're looking for.",
      };
    }
    page = pageData;
  });
  return {
    title: `Page ${page.title} – Overview | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: "Deep dive into the stats of your page.",
  };
}

async function fetchPageData(id: string): Promise<LinksPage> {
  const reqCookies = cookies().getAll();
  return getAsyncPageById(id, reqCookies);
}

async function fetchPageStats(id: string): Promise<StatsByDate[]> {
  const reqCookies = cookies().getAll();
  return getStatsByDate(id, "page", reqCookies);
}

export default async function PageOverviewPage({
  params: { id },
}: {
  params: { id: string };
}) {
  let stats: StatsByDate[] = [];
  let page: LinksPage = {} as LinksPage;
  await Promise.all([fetchPageData(id), fetchPageStats(id)]).then(
    ([pageData, statsData]) => {
      if (
        pageData === undefined ||
        pageData.id === undefined ||
        statsData === undefined
      ) {
        return notFound();
      }
      stats = statsData;
      page = pageData;
    }
  );

  return (
    <main>
      <Base>
        <Head title={`Page ${page.title} – Overview`} />
        <div className="flex flex-col w-full px-4">
          <Details page={page} />
          <div className="divider" />
          <h2 className="font-bold text-lg">Page {page.title} stats</h2>
          <span className="text-sm text-gray-500">
            Your page stats for the last 30 days.
          </span>
          <StatsChart stats={stats} type="Pages" height={320} />
        </div>
      </Base>
    </main>
  );
}
