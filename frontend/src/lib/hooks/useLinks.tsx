import Link from "@/types/Link";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const userLinks = async (userAccessToken: string, setLinks: Function, setError: Function) => {
  try {
    const response = await fetch("/api/links", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + userAccessToken,
      },
    });
    const data = await response.json();
    setLinks(data);
  } catch (e) {
    if (e instanceof Error) {
      setError(e.message);
      setTimeout(() => {
        setError("");
      }, 1500);
    }
  }
};

export const getAsyncLinkById = async (id: string, reqCookies: RequestCookie[]): Promise<Link> => {
  // Remove the edge-verified cookie from the request to prevent a 500 while middleware try to verify the cookie
  reqCookies = reqCookies.filter((c) => c.name !== 'x-next-firebase-auth-edge-verified');
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/links/?linkId=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: reqCookies.map((c) => `${c.name}=${c.value}`).join("; "),
      },
      credentials: "same-origin",
      cache: "no-cache",
    });
    const data = await response.json();
    return data as Link;
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
    return {} as Link;
  }
};