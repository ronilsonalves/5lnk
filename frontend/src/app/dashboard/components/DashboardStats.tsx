"use client";

import { Suspense, useEffect, useState } from "react";
import { useFirebaseAuth } from "@/auth/firebase";
import {
  ArrowTrendingUpIcon,
  LinkIcon,
  PresentationChartLineIcon,
  GlobeAmericasIcon,
  FolderIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/outline";
import { getLinkStats } from "@/lib/hooks/useLinks";
import Stats from "@/types/Stats";

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>();
  const [userAccessToken, setUserAccessToken] = useState("");
  const [error, setError] = useState("");
  const authenticatedUser = useFirebaseAuth().getFirebaseAuth().currentUser;
  authenticatedUser?.getIdToken().then((token) => {
    setUserAccessToken(token);
  });

  useEffect(() => {
    getLinkStats(userAccessToken, setStats, setError);
  }, []);

  return (
    <>
      <h1 className="my-8 px-7 text-3xl font-bold">Dashboard</h1>
      <div className="px-7 grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 gap-4 ">
        <Suspense fallback={<div>Loading...</div>}>
        <div className="stat bg-primary text-primary-content rounded">
          <div className="stat-figure text-white">
            <LinkIcon className="w-8 h-8" />
          </div>
          <div className="stat-title text-white">Total shortened links</div>
          <div className="stat-value">{stats?.count}</div>
        </div>
        </Suspense>

        <div className="stat bg-primary text-primary-content rounded">
          <div className="stat-figure text-white">
            <PresentationChartLineIcon className="w-8 h-8" />
          </div>
          <div className="stat-title text-white">Total link clicks</div>
          <div className="stat-value text-white">{stats?.clicks}</div>
          <div className="stat-desc text-white">Lifetime</div>
        </div>

        <div className="stat bg-primary text-primary-content rounded">
          <div className="stat-figure text-white">
            <ArrowTrendingUpIcon className="w-8 h-8" />
          </div>
          <div className="stat-title text-white">Total page views</div>
          <div className="stat-value text-white">0</div>
          <div className="stat-desc badge badge-secondary">COMING SOON</div>
        </div>

        <div className="stat bg-primary text-primary-content rounded">
          <div className="stat-figure text-white">
            <RectangleGroupIcon className="w-8 h-8" />
          </div>
          <div className="stat-title text-white">Biolink pages</div>
          <div className="stat-value text-white">0</div>
          <div className="stat-desc badge badge-secondary">COMING SOON</div>
        </div>

        <div className="stat bg-primary text-primary-content rounded">
          <div className="stat-figure text-white">
            <FolderIcon className="w-8 h-8" />
          </div>
          <div className="stat-title text-white">Projects</div>
          <div className="stat-value text-white">0</div>
          <div className="stat-desc badge badge-secondary">COMING SOON</div>
        </div>

        <div className="stat bg-primary text-primary-content rounded disabled">
          <div className="stat-figure text-white">
            <GlobeAmericasIcon className="w-8 h-8" />
          </div>
          <div className="stat-title text-white">Custom domains</div>
          <div className="stat-value text-white">0</div>
          <div className="stat-desc badge badge-secondary">COMING SOON</div>
        </div>
      </div>
    </>
  );
}
