import Post from "@/types/Post";

export const usePosts = async(setPosts: Function, setLoading: Function, setError: Function) => {
    try {
        const response = await fetch("/api/articles", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        
        setPosts([]);
        data.forEach((post: any) => {
            setPosts((posts: any) => [...posts, post]);
        })
        setLoading(false);
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
    return await fetch(`http://localhost:3000/api/articles?slug=${slug}`).then((res) => res.json());
};