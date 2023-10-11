import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/config/server-config";
import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { refreshAuthCookies } from "next-firebase-auth-edge/lib/next/middleware";
import Stats from "@/types/Stats";

export async function GET(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);
  let stats: Stats = {
    clicks: 0,
    count: 0,
  };

  if (!tokens) {
    console.log("Error: Cannot get link stats of unauthenticated user");
    return new NextResponse(JSON.stringify("Error: Cannot get link stats of unauthenticated user"),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      }
    });
  }

  const fetchLinkCount = () => {
    return fetch(
      process.env.NEXT_BACKEND_API_URL +
        "links/user/" +
        tokens.decodedToken.uid +
        "/count",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + tokens.token,
        },
      }
    );
  };

  const fetchClickCount = () => {
    return fetch(
      process.env.NEXT_BACKEND_API_URL +
        "links/user/" +
        tokens.decodedToken.uid +
        "/clicks",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + tokens.token,
        },
      }
    );
  };

  const [linkCount, clickCount] = await Promise.all([
    fetchLinkCount(),
    fetchClickCount(),
  ]);
  const linkCountData = await linkCount.json();
  const clickCountData = await clickCount.json();
  stats.count = linkCountData;
  stats.clicks = clickCountData;
  stats = {
    clicks: clickCountData,
    count: linkCountData,
  };

  const response = new NextResponse(JSON.stringify(stats), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Attach `Set-Cookie` headers with token containing new custom claims
  await refreshAuthCookies(tokens.token, response, authConfig);
  return response;
}
