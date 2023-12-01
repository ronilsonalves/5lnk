import {NextRequest, NextResponse} from "next/server";
import {authConfig} from "@/config/server-config";
import {getTokens} from "next-firebase-auth-edge/lib/next/tokens";

export async function POST(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);

  if (!tokens) {
    return new NextResponse(JSON.stringify("Error: Cannot short a link of unauthenticated user"),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      }
    });
  }

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
    userId: parsedBody.userId ?? tokens.decodedToken.uid,
  };

  const apiResponse = await fetch(process.env.NEXT_BACKEND_API_URL + "links", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + tokens.token,
    },
    body: JSON.stringify(link),
  });

  const data = await apiResponse.json();

  return new NextResponse(JSON.stringify(data), {
    status: apiResponse.status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export async function GET(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);

  if (!tokens) {
    return new NextResponse(JSON.stringify("Error: Cannot get the links of unauthenticated user"),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      }
    });
  }

  if (request.nextUrl.searchParams.has("linkId")) {
    console.log("linkId: " + request.nextUrl.searchParams.get("linkId"));
    const linkId = request.nextUrl.searchParams.get("linkId");
    
    const apiResponse = await fetch(
      process.env.NEXT_BACKEND_API_URL + "links/" + linkId,
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
        "Content-Type": "application/json"
      }
    });
  }

  const apiResponse = await fetch(
    process.env.NEXT_BACKEND_API_URL + "links/user/" + tokens.decodedToken.uid,
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
      "Content-Type": "application/json"
    }
  });
}

export async function PUT(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);

  if (!tokens) {
    return new NextResponse(JSON.stringify("Error: Cannot update a link of unauthenticated user"),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      }
    });
  }

  const getBody = await request.body
    ?.getReader()
    .read()
    .then(({ value }) => {
      return new TextDecoder().decode(value);
    });

  const parsedBody = JSON.parse(getBody?.toString() ?? "{}");

  const backendResponse = await fetch(
    process.env.NEXT_BACKEND_API_URL + "links",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + tokens.token,
      },
      body: JSON.stringify({
        id: parsedBody.id,
        original: parsedBody.original,
        shortened: parsedBody.shortened,
        userId: parsedBody.userId,
      }),
    }
  );

  const data = await backendResponse.json();

  return new NextResponse(JSON.stringify(data), {
    status: backendResponse.status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export async function DELETE(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);

  if (!tokens) {
    console.error("Error: Cannot delete link stats of unauthenticated user");
    return new NextResponse(JSON.stringify("Error: Cannot delete link stats of unauthenticated user"),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      }
    });
  }

  const getBody = await request.body
    ?.getReader()
    .read()
    .then(({ value }) => {
      return new TextDecoder().decode(value);
    });

  const parsedBody = JSON.parse(getBody?.toString() ?? "{}");

  const backendResponse = await fetch(
    process.env.NEXT_BACKEND_API_URL + "links",
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + tokens.token,
      },
      body: JSON.stringify({
        id: parsedBody.id,
        original: parsedBody.original,
        shortened: parsedBody.shortened,
        userId: parsedBody.userId,
      }),
    }
  );

  let response = new NextResponse(null, {
    status: backendResponse.status,
    headers: backendResponse.headers,
  });

  switch (backendResponse.status) {
    case 204:
      response = new NextResponse(
        JSON.stringify({
          message: "Link deleted successfully",
        }),
        {
          status: 200,
          headers: backendResponse.headers,
        }
      );

    return response;
    default:
      const data = await backendResponse.json();
      response = new NextResponse(JSON.stringify(data), {
        status: backendResponse.status,
        headers: {
          "Content-Type": "application/json"
        }
      });

    return response;
  }
}
