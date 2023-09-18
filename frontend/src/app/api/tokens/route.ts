import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/config/server-config";
import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { refreshAuthCookies } from "next-firebase-auth-edge/lib/next/middleware";

export async function POST(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);

  if (!tokens) {
    throw new Error("Cannot generate an API Token for an unauthenticated user");
  }

  const getBody = await request.body
    ?.getReader()
    .read()
    .then(({ value }) => {
      return new TextDecoder().decode(value);
    });

  const parsedBody = JSON.parse(getBody?.toString() ?? "{}");
  const apiTokenReq = {
    userId: parsedBody.userId ?? tokens.decodedToken.uid,
  };

  const apiResponse = await fetch(process.env.NEXT_PUBLIC_API_URL + "apikeys", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + tokens.token,
    },
    body: JSON.stringify(apiTokenReq),
  });

  const data = await apiResponse.json();

  const response = new NextResponse(JSON.stringify(data), {
    status: apiResponse.status,
    headers: apiResponse.headers,
  });

  // Attach `Set-Cookie` headers with token containing new custom claims
  await refreshAuthCookies(tokens.token, response, authConfig);

  return response;
}

export async function GET(request: NextRequest) {
    const tokens = await getTokens(request.cookies, authConfig);

    if (!tokens) {
      throw new Error("Cannot GET an API Token for an unauthenticated user");
    }

    const apiResponse = await fetch(process.env.NEXT_PUBLIC_API_URL + "apikeys" +"/"+tokens.decodedToken.uid, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + tokens.token,
      },
    });

    const data = await apiResponse.json();

    var start = 4;
    var end = data.length - 4

    let tokenProtected = data.toString().slice(start, end).replace(/./g, '*');
    tokenProtected = data.toString().slice(0, 4) + tokenProtected + data.toString().slice(-4)

    const response = new NextResponse(JSON.stringify(tokenProtected), {
      status: apiResponse.status,
      headers: apiResponse.headers,
    });

    // Attach `Set-Cookie` headers with token containing new custom claims
    await refreshAuthCookies(tokens.token, response, authConfig);

    return response;
}