import LinksPage from "@/types/LinksPage";

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