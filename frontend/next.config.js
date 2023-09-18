/** @type {import('next').NextConfig} */
const nextConfig = {
}

module.exports = nextConfig

module.exports = {
    images: {
        dangerouslyAllowSVG: true,
        remotePatterns: [
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
            }
        ]
    },
}