import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const getBody = await request.body
    ?.getReader()
    .read()
    .then(({ value }) => {
      return new TextDecoder().decode(value);
    });

  const parsedBody = JSON.parse(getBody?.toString() ?? "{}");
  const link = {
    url: parsedBody.url,
    domain: parsedBody.domain,
    userId: null,
  };

  const apiResponse = await fetch(process.env.NEXT_PUBLIC_API_URL + "links", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.NEXT_PUBLIC_FRONTEND_API_KEY,
    },
    body: JSON.stringify(link),
  });

  const data = await apiResponse.json();

  const response = new NextResponse(JSON.stringify(data), {
    status: apiResponse.status,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
