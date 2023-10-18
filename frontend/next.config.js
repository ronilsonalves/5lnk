const { withContentlayer } = require('next-contentlayer')
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
                serverActions: true,
            },
    images: {
        dangerouslyAllowSVG: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com'
            },
            {
                protocol: 'https',
                hostname: 'tailwindui.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com'
            },
            {
                protocol: 'https',
                hostname: 'www.svgrepo.com'
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com'
            },
            {
                protocol: 'https',
                hostname: 'www.ronilsonalves.com'
            }
        ]
    },
}

module.exports = withContentlayer(nextConfig)