import { Post } from "contentlayer/generated";
import {allPosts} from 'contentlayer/generated';

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
    //@ts-ignore
    return allPosts.find((postBySlug) => postBySlug.slug === 'blog/'+slug);
};