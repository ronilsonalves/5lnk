import LinksPage from "@/types/LinksPage";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

/**
 * Retrieves a page by its slug.
 * @param slug - The slug of the page to retrieve.
 * @param userAgent - The user agent string to include in the request headers.
 * @returns A promise that resolves to the LinksPage object representing the requested page.
 * @throws An error if the data cannot be fetched.
 */
export const getPageBySlug = async (slug: string, userAgent: string): Promise<LinksPage> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/public_pages/?alias=${slug}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_FRONTEND_API_KEY}`,
                "User-Agent": userAgent,
            },
            cache: "no-cache",
        });
        const data = await response.json();
        return data as LinksPage;
    } catch (e) {
        throw new Error("Unable to fetch data");
    }
};

export const getPages = async (userAccessToken: string): Promise<LinksPage[]> => {
    try {
        const response = await fetch('/api/pages', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userAccessToken}`,
            },
        });
        const data = await response.json();
        return data as LinksPage[];
    } catch (e) {
        // TODO: Apply better error handling
        throw new Error('Unable to fetch data');
    }
};

export const getAsyncPageById = async (id: string, reqCookies: RequestCookie[]): Promise<LinksPage> => {
    // Remove the edge-verified cookie from the request to prevent a 500 while middleware try to verify the cookie
    reqCookies = reqCookies.filter((c) => c.name !== 'x-next-firebase-auth-edge-verified');
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/pages/?pageId=${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: reqCookies.map((c) => `${c.name}=${c.value}`).join("; "),
            },
            credentials: "same-origin",
            cache: "no-cache",
        });
        const data = await response.json();
        return data as LinksPage;
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
        }
        return {} as LinksPage;
    }
};