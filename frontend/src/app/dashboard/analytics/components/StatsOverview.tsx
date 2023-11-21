"use client";

import { Suspense, useEffect, useState } from "react";
import {
  ArrowTrendingUpIcon,
  LinkIcon,
  PresentationChartLineIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/outline";
import {
  getUserOverviewStatsFunc,
  getUserStatsByDate,
} from "@/lib/hooks/useStats";
import Stats, { StatsByDate } from "@/types/Stats";
import StatsChartComponent from "./ChartOverview";

interface DateInterval {
  startDate: Date;
  endDate: Date;
}

const StatsOverview: React.FC = () => {
  const [linkDateInterval, setLinkDateInterval] = useState<DateInterval>();
  const [pageDateInterval, setPageDateInterval] = useState<DateInterval>();
  const [stats, setStats] = useState<Stats>();
  const [linkStats, setLinkStats] = useState<StatsByDate[]>();
  const [pageStats, setPageStats] = useState<StatsByDate[]>();

  useEffect(() => {
    getUserOverviewStatsFunc().then((data) => {
      setStats(data);
    });
    getUserStatsByDate(
      pageDateInterval?.startDate.toISOString() || "",
      pageDateInterval?.endDate.toISOString() || "",
      "pages"
    ).then((data) => {
      setPageStats(data);
    });
    getUserStatsByDate(
      linkDateInterval?.startDate.toISOString() || "",
      linkDateInterval?.endDate.toISOString() || "",
      "links"
    ).then((data) => {
      setLinkStats(data);
    });
  }, [linkDateInterval, pageDateInterval]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="px-7 grid xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 gap-4 ">
        <div className="stat bg-primary text-primary-content rounded">
          <div className="stat-figure text-white">
            <LinkIcon className="w-8 h-8" />
          </div>
          <div className="stat-title text-white">Total shortened links</div>
          <div className="stat-value text-white">{stats?.links.total}</div>
        </div>

        <div className="stat bg-primary text-primary-content rounded">
          <div className="stat-figure text-white">
            <PresentationChartLineIcon className="w-8 h-8" />
          </div>
          <div className="stat-title text-white">Total link clicks</div>
          <div className="stat-value text-white">{stats?.links.clicks}</div>
          <div className="stat-desc text-white">Lifetime</div>
        </div>

        <div className="stat bg-primary text-primary-content rounded">
          <div className="stat-figure text-white">
            <ArrowTrendingUpIcon className="w-8 h-8" />
          </div>
          <div className="stat-title text-white">Total page views</div>
          <div className="stat-value text-white">{stats?.pages.views}</div>
          <div className="stat-desc text-white">Lifetime</div>
        </div>

        <div className="stat bg-primary text-primary-content rounded">
          <div className="stat-figure text-white">
            <RectangleGroupIcon className="w-8 h-8" />
          </div>
          <div className="stat-title text-white">Links pages</div>
          <div className="stat-value text-white">{stats?.pages.total}</div>
        </div>
      </div>
      {linkStats && (
        <StatsChartComponent
          stats={linkStats}
          type="Links"
          setDateInterval={setLinkDateInterval}
        />
      )}
      {pageStats && (
        <StatsChartComponent
          stats={pageStats}
          type="Pages"
          setDateInterval={setPageDateInterval}
        />
      )}
    </Suspense>
  );
};

export default StatsOverview;