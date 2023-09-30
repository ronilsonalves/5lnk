import Author from "./Author";

// Define the Post type
export default interface Post {
    id: string;
    imageUrl: string;
    author: Author;
    description: string;
    title: string;
    date: Date;
    tags: string[];
    content: string;
    slug: string;
}