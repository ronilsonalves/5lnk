import { Post, Page } from "contentlayer/generated";
import {allPosts, allPages} from 'contentlayer/generated';

export const usePosts = async(setPosts: Function, setError: Function) => {
    try {
        setPosts(allPosts);
    } catch (e) {
        if (e instanceof Error) {
            setError("Error while fetching post's data: ",e.message);
            setTimeout(() => {
                setError("");
            }, 1500);
        }
    }
};

export const getPostBySlug = async(slug: string): Promise<Post> => {
    return allPosts.find((postBySlug) => postBySlug.slug === 'blog/'+slug)!;
};

export const getPageBySlug = async (slug: string): Promise<Page> => {
    return allPages.find((pageBySlug) => pageBySlug.slug === 'pages/'+slug)!;    
};