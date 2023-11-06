import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/config/server-config";
import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { refreshAuthCookies } from "next-firebase-auth-edge/lib/next/middleware";

export async function GET(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);

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

  const analytics = request.nextUrl.searchParams.get("analytics");
  const linkId = request.nextUrl.searchParams.get("linkId");

  if (analytics) {
    const apiResponse = await fetch(process.env.NEXT_BACKEND_API_URL + "stats/user/" + tokens.decodedToken.uid, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + tokens.token,
      },
    });

    const data = await apiResponse.json();

    return new NextResponse(JSON.stringify(data), {
      status: apiResponse.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (linkId) {
    const apiResponse = await fetch(process.env.NEXT_BACKEND_API_URL + "stats/link/" + linkId, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + tokens.token,
      },
    });

    const data = await apiResponse.json();

    return new NextResponse(JSON.stringify(data), {
      status: apiResponse.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const apiResponse = await fetch(
    process.env.NEXT_BACKEND_API_URL +
      "stats/user/" +
      tokens.decodedToken.uid + "/overview",
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