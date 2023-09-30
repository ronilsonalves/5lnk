import { allPages, allPosts } from "contentlayer/generated";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const articleSlugs = allPosts.map(article => article.slug);
    const pageSlugs = allPages.map(page => page.slug);
    let xml: MetadataRoute.Sitemap = [
        {
            url: process.env.NEXT_PUBLIC_SITE_URL!,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1
        },
        {
            url: process.env.NEXT_PUBLIC_SITE_URL!+"/auth/login",
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.8
        },
        {
            url: process.env.NEXT_PUBLIC_SITE_URL!+"/auth/register",
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.8
        },
        {
            url: process.env.NEXT_PUBLIC_SITE_URL!+"/pages/contact",
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.8
        },
        {
            url: process.env.NEXT_PUBLIC_SITE_URL!+"/blog",
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8
        }
    ];

    articleSlugs.forEach((slug) => {
        xml.push({
            url: process.env.NEXT_PUBLIC_SITE_URL!+"/"+slug,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.5
        })
    });

    pageSlugs.forEach((slug) => {
        xml.push({
            url: process.env.NEXT_PUBLIC_SITE_URL!+"/"+slug,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.8
        })
    })

    return xml;
}