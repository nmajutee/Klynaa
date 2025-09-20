/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    compress: true,

    // Security headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    },
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    }
                ]
            }
        ];
    },

    // Image optimization
    images: {
        domains: ['localhost'],
        formats: ['image/webp', 'image/avif'],
    },

    // Performance optimizations
    experimental: {
        optimizeCss: true,
    },

    // Re-enable for production
    eslint: {
        ignoreDuringBuilds: true, // TODO: Re-enable after ESLint fixes
    },
    typescript: {
        ignoreBuildErrors: true, // TODO: Re-enable after Next.js path resolution fix
    },
};

module.exports = nextConfig;