import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getAsyncLinkById } from "@/lib/hooks/useLinks";
import { getStatsByDate } from "@/lib/hooks/useStats";
import { StatsByDate } from "@/types/Stats";
import Link from "@/types/Link";
import StatsChart from "@dashboard/analytics/components/StatsChart";
import Base from "@dashboard/home";
import Head from "@dashboard/components/Head";
import Details from "../components/Details";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  let link: Link = {} as Link;
  await fetchLinkData(id).then((linkData) => {
    if (linkData === undefined || linkData.shortened === undefined) {
      return {
        title: `Link not found | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
        description: "Sorry, we couldn't find the link you're looking for.",
      };
    }
    link = linkData;
  });
  return {
    title: `Link ${link.shortened} – Overview | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: "Deep dive into the stats of your link.",
  };
}

async function fetchLinkData(id: string): Promise<Link> {
  const reqCookies = cookies().getAll();
  return getAsyncLinkById(id, reqCookies);
}

async function fetchLinkStats(id: string): Promise<StatsByDate[]> {
  const reqCookies = cookies().getAll();
  return getStatsByDate(id, "link", reqCookies);
}

export default async function LinkOverviewPage({
  params: { id },
}: {
  params: { id: string };
}) {
  let stats: StatsByDate[] = [];
  let link: Link = {} as Link;
  await Promise.all([fetchLinkData(id), fetchLinkStats(id)]).then(
    ([linkData, statsData]) => {
      if (
        linkData === undefined ||
        linkData.shortened === undefined ||
        statsData === undefined
      ) {
        return notFound();
      }
      stats = statsData;
      link = linkData;
    }
  );

  return (
    <main>
      <Base>
        <Head title={`Link ${link.shortened} – Overview`} />
        <div className="flex flex-col w-full px-4">
          <Details link={link} />
          <div className="divider" />
          <h2 className="font-bold text-lg"> Link {link.shortened} Stats</h2>
          <span className="text-sm text-gray-500">
            Your link stats for the last 30 days
          </span>
          <StatsChart stats={stats} type="Links" height={320} />
        </div>
      </Base>
    </main>
  );
}
