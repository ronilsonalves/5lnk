import Link from "./Link";
// Define the LinksPage type
export default interface LinksPage {
    id: string;
    alias: string;
    userId?: string;
    title: string;
    description: string;
    imageURL: string;
    links: Link[];
    finalURL: string;
    views: number;
    createdAt: Date;
}

export interface CreateLinksPage {
    alias: string;
    title: string;
    description: string;
    imageURL: string;
    links: string[];
}