import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/config/server-config";
import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { refreshAuthCookies } from "next-firebase-auth-edge/lib/next/middleware";

export async function GET(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);
  const analytics = request.nextUrl.searchParams.get("analytics");
  const linkId = request.nextUrl.searchParams.get("linkId");
  const pageId = request.nextUrl.searchParams.get("pageId");
  const objectToFetch = request.nextUrl.searchParams.get("fetch");

  if (linkId) {
    const apiResponse = await fetch(
      process.env.NEXT_BACKEND_API_URL + "stats/link/" + linkId + "/stats",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + process.env.NEXT_FRONTEND_API_KEY,
        },
      }
    );

    const data = await apiResponse.json();

    return new NextResponse(JSON.stringify(data), {
      status: apiResponse.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (pageId) {
    const apiResponse = await fetch(
      process.env.NEXT_BACKEND_API_URL + "stats/page/" + pageId + "/stats",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + process.env.NEXT_FRONTEND_API_KEY,
        },
      }
    );

    const data = await apiResponse.json();

    return new NextResponse(JSON.stringify(data), {
      status: apiResponse.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (!tokens) {
    return new NextResponse(
      JSON.stringify({
        error: "Unauthorized",
        code: 401,
        details: "Cannot get the links pages of unauthenticated user",
        timestamp: new Date(),
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  if (analytics) {
    const apiResponse = await fetch(
      process.env.NEXT_BACKEND_API_URL +
        "stats/user/" +
        tokens.decodedToken.uid,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + tokens.token,
        },
      }
    );

    const data = await apiResponse.json();

    return new NextResponse(JSON.stringify(data), {
      status: apiResponse.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (objectToFetch) {
    let dateQuery = "";
    const startDate = request.nextUrl.searchParams.get("startDate");
    const endDate = request.nextUrl.searchParams.get("endDate");
    if (!(startDate === "" && endDate === "")) {
      dateQuery = "?startDate=" + startDate + "&endDate=" + endDate;
    }
    console.log(
      "INFO: Fetching stats for " +
        objectToFetch +
        " with dateQuery: " +
        dateQuery
    );
    try {
      const apiResponse = await fetch(
        process.env.NEXT_BACKEND_API_URL +
          "stats/user/" +
          tokens.decodedToken.uid +
          "/" +
          objectToFetch +
          dateQuery,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + tokens.token,
          },
        }
      );

      const data = await apiResponse.json();

      return new NextResponse(JSON.stringify(data), {
        status: apiResponse.status,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      return new NextResponse(
        JSON.stringify({
          error: "Internal Server Error",
          code: 500,
          details: "Cannot get the stats of the user",
          timestamp: new Date(),
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }

  const apiResponse = await fetch(
    process.env.NEXT_BACKEND_API_URL +
      "stats/user/" +
      tokens.decodedToken.uid +
      "/overview",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + tokens.token,
      },
    }
  );

  const data = await apiResponse.json();

  const response = new NextResponse(JSON.stringify(data), {
    status: apiResponse.status,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Attach `Set-Cookie` headers with token containing new custom claims
  await refreshAuthCookies(tokens.token, response, authConfig);
  return response;
}
