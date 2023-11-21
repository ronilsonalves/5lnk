import Stats, { LinkStats, LinkStatsByDate, StatsByDate } from "@/types/Stats";

export const getUserOverviewStats = async (
  userAccessToken: string,
  setStats: Function,
  setError: Function
) => {
  try {
    const response = await fetch("/api/stats", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + userAccessToken,
      },
    });
    const data = await response.json();
    setStats(data);
  } catch (e) {
    if (e instanceof Error) {
      setError(e.message);
      setTimeout(() => {
        setError("");
      }, 1500);
    }
  }
};

export const getUserStatsByDate = async (
  startDate: string,
  endDate: string,
  object: "links" | "pages"
): Promise<StatsByDate[]> => {
  console.log(startDate, endDate, object);
  try {
    const response = await fetch(
      `/api/stats?fetch=${object}&startDate=${
        startDate.split("T")[0]
      }&endDate=${endDate.split("T")[0]}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    return data as StatsByDate[];
  } catch (e) {
    console.error(e);
    return {} as StatsByDate[];
  }
};

export const getUserOverviewStatsFunc = async (): Promise<Stats> => {
  try {
    const response = await fetch(`/api/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data as Stats;
  } catch (e) {
    console.error(e);
    return {} as Stats;
  }
};

// export const getLinkStatsFunc = async (
//   linkId: string
// ): Promise<LinkStats[]> => {
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_SITE_URL}/api/stats/?linkId=${linkId}`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     const data = await response.json();
//     return data.data as LinkStats[];
//   } catch (e) {
//     console.error(e);
//     return {} as LinkStats[];
//   }
// };

// export const getLinkStatsByDate = async (
//   linkId: string
// ): Promise<LinkStatsByDate[]> => {
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_SITE_URL}/api/stats/?linkId=${linkId}`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         cache: "no-cache",
//       }
//     );
//     const data = await response.json();
//     return data as LinkStatsByDate[];
//   } catch (e) {
//     console.error(e);
//     return {} as LinkStatsByDate[];
//   }
// };