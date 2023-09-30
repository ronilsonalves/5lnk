import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  authentication,
  refreshAuthCookies,
} from "next-firebase-auth-edge/lib/next/middleware";
import { getFirebaseAuth } from "next-firebase-auth-edge/lib/auth";
import { authConfig } from "@config/server-config";

const PUBLIC_PATHS = ["/", "/blog", "/pages", "/auth/register", "/auth/login", "/auth/recover"];

const { getUser } = getFirebaseAuth(
  authConfig.serviceAccount,
  authConfig.apiKey
);

function redirectToDashboard(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/dashboard";
  url.search = "";
  return NextResponse.redirect(url);
}

function redirectToLogin(request: NextRequest) {
  if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/auth/login";
  url.search = `redirect=${request.nextUrl.pathname}${url.search}`;
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {

  return authentication(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: authConfig.apiKey,
    cookieName: authConfig.cookieName,
    cookieSerializeOptions: authConfig.cookieSerializeOptions,
    cookieSignatureKeys: authConfig.cookieSignatureKeys,
    serviceAccount: authConfig.serviceAccount,
    handleValidToken: async ({ token, decodedToken }) => {
      // Authenticated user should not be able to access /auth/login, /auth/register and /auth/recover routes
      if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
        return redirectToDashboard(request);
      }

      const user = await getUser(decodedToken.uid);
      const response = new NextResponse(JSON.stringify(user), {
        status: 200,
        headers: { "content-type": "application/json" },
      });

      // Attach `Set-Cookie` headers with token containing new custom claims
      await refreshAuthCookies(token, response, authConfig);

      return NextResponse.next();
    },
    handleInvalidToken: async () => {
      return redirectToLogin(request);
    },
    handleError: async (error) => {
      console.error("Unhandled authentication error", { error });
      return redirectToLogin(request);
    },
  });
}

export const config = {
  matcher: [
    "/",
    "/((?!_next|favicon.ico|screenshot-dev.png|logo.svg|logo_dark.svg|robots.txt|sitemap.xml|api|blog|pages).*)",
    "/api/login",
    "/api/logout",
  ],
};
