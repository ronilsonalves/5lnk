import {NextRequest, NextResponse} from "next/server";
import {authConfig} from "@/config/server-config";
import {getTokens} from "next-firebase-auth-edge/lib/next/tokens";

export async function POST(request: NextRequest) {
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

  const getBody = await request.body
    ?.getReader()
    .read()
    .then(({ value }) => {
      return new TextDecoder().decode(value);
    });

  const body = JSON.parse(getBody?.toString() || "{}");
  const page = {
    title: body.title,
    description: body.description,
    imageURL: body.imageURL,
    alias: body.alias,
    links: body.links,
    domain: "5lnk.me",
    userId: tokens.decodedToken.uid,
  };

  const apiResponse = await fetch(
    process.env.NEXT_BACKEND_API_URL + "pages",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + tokens.token,
      },
      body: JSON.stringify(page),
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

  /*
   * If the request has an alias parameter, it means that the user is trying to verify if the alias is available
   */
  const alias = request.nextUrl.searchParams.get("alias");
  if (alias) {
    const apiResponse = await fetch(
      process.env.NEXT_BACKEND_API_URL +
        "links-page/" +
        request.nextUrl.searchParams.get("alias"),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: tokens.token,
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

  const apiResponse = await fetch(
    process.env.NEXT_BACKEND_API_URL +
      "links-page/user/" +
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

export async function PUT(request: NextRequest) {
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

  const getBody = await request.body
    ?.getReader()
    .read()
    .then(({ value }) => {
      return new TextDecoder().decode(value);
    });

  const body = JSON.parse(getBody?.toString() || "{}");
  const page = {
    id: body.id,
    links: body.links,
    userId: tokens.decodedToken.uid,
    title: body.title,
    description: body.description,
    imageURL: body.imageURL,
    alias: body.alias,
    domain: "5lnk.me",
    finalURL: body.finalURL,
    views: body.views,
    createdAt: body.createdAt,
  };

  // Remove the id from the links array where the id is null
  page.links = page.links.map((link:any) => {
    if (link.id.length === 0) {
      delete link.id;
    }
    return link;
  });

  const apiResponse = await fetch(
    process.env.NEXT_BACKEND_API_URL + "pages",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + tokens.token,
      },
      body: JSON.stringify(page),
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

export async function DELETE(request: NextRequest) {
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

  const getBody = await request.body
    ?.getReader()
    .read()
    .then(({ value }) => {
      return new TextDecoder().decode(value);
    });

  const body = JSON.parse(getBody?.toString() ?? "{}");
  const page = {
    id: body.id,
    links: body.links,
    userId: tokens.decodedToken.uid,
    title: body.title,
    description: body.description,
    imageURL: body.imageURL,
    alias: body.alias,
    domain: body.domain,
    finalURL: body.finalURL,
    views: body.views,
    createdAt: body.createdAt,
  }

  const apiResponse = await fetch(
    process.env.NEXT_BACKEND_API_URL + "pages",
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + tokens.token,
      },
      body: JSON.stringify(page),
    }
  );

  switch (apiResponse.status) {
    case 204:
      return new NextResponse(JSON.stringify({
        message: "Links page deleted successfully"
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    default:
      const data = await apiResponse.json();
      return new NextResponse(JSON.stringify(data), {
        status: apiResponse.status,
        headers: {
          "Content-Type": "application/json",
        },
      });
  }
}