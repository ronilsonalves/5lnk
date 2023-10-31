import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
  if (
    !request.headers
      .get("Authorization")
      ?.includes(`Bearer ` + process.env.NEXT_FRONTEND_API_KEY)
  ) {
    return new NextResponse(
      JSON.stringify({
        error: "Unauthorized",
        code: 401,
        details: "Request missing Authorization header",
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
  const apiResponse = await fetch(
    process.env.NEXT_BACKEND_API_URL +
      "pages/" +
      request.nextUrl.searchParams.get("alias"),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization")!,
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