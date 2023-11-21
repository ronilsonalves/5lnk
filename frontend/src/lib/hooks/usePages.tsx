import LinksPage from "@/types/LinksPage";

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