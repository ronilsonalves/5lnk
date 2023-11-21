"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { StatsByDate } from "@/types/Stats";
import {
  generateGroupedOptions,
  generateSeries,
  generateStatsArrayWithoutDuplicates,
} from "../utils/charts";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface StatsChartProps {
  stats: StatsByDate[];
  type: "Links" | "Pages";
  height?: number;
};

const StatsChart: React.FC<StatsChartProps> = ({ stats, type, height }) => {
  const os = generateStatsArrayWithoutDuplicates(stats, "os");
  const browsers = generateStatsArrayWithoutDuplicates(stats, "browser");
  const osOptions = generateGroupedOptions(
    type + " stats",
    type.toLowerCase()+"OS",
    "OS",
    "datetime",
    os,
    "dd/MM/yy"
  );
  const browserOptions = generateGroupedOptions(
    type + " stats",
    type.toLowerCase()+"Browser",
    "Browser",
    "datetime",
    browsers,
    "dd/MM/yy"
  );

  const [osSeries, setOsSeries] = useState([]);
  const [browserSeries, setBrowserSeries] = useState([]);

  useEffect(() => {
    setOsSeries(generateSeries(os, type.toLowerCase()+"os") as any);
    setBrowserSeries(generateSeries(browsers, type.toLowerCase()+"browser") as any);
  }, [stats]);

  return (
    <Suspense fallback={<div>Loading data...</div>}>
      <div className="flex flex-col" id={`${type.toLowerCase()}-wrapper`}>
        <div className="w-full" id={`${type.toLowerCase()}-os-chart`}>
          <Chart
            options={osOptions}
            series={osSeries}
            type="line"
            height={height || 320}
          />
        </div>
        <div className="w-full" id={`${type.toLowerCase()}-browser-chart`}>
          <Chart
            options={browserOptions}
            series={browserSeries}
            type="line"
            height={height || 320}
          />
        </div>
      </div>
    </Suspense>
  );
};

export default StatsChart;