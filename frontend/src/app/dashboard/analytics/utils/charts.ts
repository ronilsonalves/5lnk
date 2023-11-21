import { ApexOptions } from "apexcharts";
import { StatsByDate } from "@/types/Stats";

interface Stats {
  key: string;
  date: Date;
  total: number;
}

/**
 * Generates an array of Stats objects without duplicates based on the provided StatsByDate array and name.
 * @param stats - The StatsByDate array to generate the Stats array from.
 * @param name - The name to generate the Stats array for.
 * @returns An array of Stats objects without duplicates.
 */
export function generateStatsArrayWithoutDuplicates(
  stats: StatsByDate[],
  name: string
): Stats[] {
  const statsArray = stats
    .map((stat: StatsByDate) => {
      if (name in stat) {
        return {
          key: stat[name as keyof StatsByDate],
          date: stat.date,
          total: stat.total,
        };
      }
    })
    .filter((stat): stat is Stats => stat !== undefined);

  for (let i = 0; i < statsArray.length; i++) {
    for (let j = i + 1; j < statsArray.length; j++) {
      if (
        statsArray[i].key === statsArray[j].key &&
        statsArray[i].date === statsArray[j].date
      ) {
        statsArray[i].total += statsArray[j].total;
        statsArray.splice(j, 1);
      }
    }
  }
  return statsArray;
}

/**
 * Generates series for a given set of stats.
 * @param stats - The stats to generate series from.
 * @param name - The name of the series.
 * @returns An array of series data.
 */
export function generateSeries(
  stats: Stats[],
  name: string
): ApexOptions["series"] {
  const series = [] as ApexOptions["series"];
  if (series) {
    stats.forEach((stat) => {
      if (series.find((s) => typeof s === "object" && s.name === stat.key)) {
        return;
      }
      if (stat.key === " ") {
        series.push({
          name: "Unknown",
          data: stats
            .filter((d) => d.key === stat.key)
            .map((d) => ({ x: new Date(d.date), y: d.total })),
        } as any);
        return;
      }
      series.push({
        name: stat.key,
        data: stats
          .filter((d) => d.key === stat.key)
          .map((d) => ({ x: new Date(d.date), y: d.total })),
      } as any);
    });
  }
  return series;
}

/**
 * Generates ApexCharts options for a grouped chart.
 * @param group - The group to which the chart belongs.
 * @param name - The name of the chart.
 * @param xaxisType - The type of the x-axis. Can be "datetime", "category", or "numeric".
 * @param stats - An array of Stats objects containing the data to be plotted.
 * @param dateTimeFormat - The format of the date and time to be displayed on the x-axis. Only applicable if xaxisType is "datetime".
 * @returns An ApexOptions object containing the chart options.
 */
export function generateGroupedOptions(
  group: string,
  name: string,
  xaxisType: "datetime" | "category" | "numeric",
  stats: Stats[],
  dateTimeFormat?: string
): ApexOptions {
  const title = name.startsWith("links") ? "Clicks" : "Views";
  return {
    chart: {
      id: name.toLowerCase().replaceAll(" ", "-") + "-chart",
      group: group.toLowerCase().replaceAll(" ", "-") + "-group",
      dropShadow: {
        enabled: true,
        color: "#000",
        top: 18,
        left: 7,
        blur: 10,
        opacity: 0.2,
      },
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 4,
      curve: "straight",
    },
    markers: {
      size: 6,
    },
    xaxis: {
      type: xaxisType,
      categories: stats.map((stats) => new Date(stats.date).toLocaleString()),
      title: {
        text: `${group.split("s ")[0]} ${title.toLowerCase()} by date`,
      },
    },
    yaxis: {
      title: {
        text: title,
      },
      min: 0,
      max: stats.reduce((m, stats) => Math.max(m, stats.total), 0) + 2,
    },
    tooltip: {
      enabled: true,
      enabledOnSeries: undefined,
      shared: false,
      followCursor: true,
      intersect: false,
      inverseOrder: false,
      custom: undefined,
      fillSeriesColor: false,
      style: {
        fontSize: "12px",
        fontFamily: undefined,
      },
      x: {
        format: dateTimeFormat,
      },
      y: {
        formatter: (value) => value + " " + title.toLowerCase(),
      },
    },
  } as ApexOptions;
}
