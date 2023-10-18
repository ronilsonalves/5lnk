import Link from "./Link";
// Define the LinksPage type
export default interface LinksPage {
    id: string;
    alias: string;
    title: string;
    description: string;
    imageURL: string;
    links: Link[];
}