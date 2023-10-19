import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/config/server-config";
import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";

export async function GET(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);

  if (!tokens) {
    return new NextResponse(JSON.stringify({
        error: "Unauthorized",
        code: 401,
        details: "Cannot get the links pages of unauthenticated user",
        timestamp: new Date(),
    }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      }
    });
  }

  const apiResponse = await fetch(process.env.NEXT_BACKEND_API_URL + "links-page/user/" + tokens.decodedToken.uid, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + tokens.token,
    },
  });

  const data = await apiResponse.json();

  const response = new NextResponse(JSON.stringify(data), {
    status: apiResponse.status,
    headers: {
      "Content-Type": "application/json"
    }
  });

  return response;
}