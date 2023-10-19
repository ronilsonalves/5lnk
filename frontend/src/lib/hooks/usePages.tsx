import LinksPage from "@/types/LinksPage";
import { CreateLinksPage } from "@/types/LinksPage";

export const getPageBySlug = async (slug: string): Promise<LinksPage> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/public_pages/?alias=${slug}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_FRONTEND_API_KEY}`,
            },
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

export const createPage = async (page: CreateLinksPage, userAccessToken: string): Promise<LinksPage> => {
    try {
        const response = await fetch('/api/pages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userAccessToken}`,
            },
            body: JSON.stringify(page),
        });
        const data = await response.json();
        return data as LinksPage;
    } catch (e) {
        // TODO: Apply better error handling
        throw new Error('Unable to create page');
    }
};

export const updatePage = async (page: LinksPage, userAccessToken: string): Promise<LinksPage> => {
    try {
        const response = await fetch('/api/pages', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userAccessToken}`,
            },
            body: JSON.stringify(page),
        });
        const data = await response.json();
        return data as LinksPage;
    } catch (e) {
        // TODO: Apply better error handling
        throw new Error('Unable to update page');
    };
};