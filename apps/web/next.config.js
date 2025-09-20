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

    // Bundle analyzer in production
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Analyze bundle in production builds
        if (!dev && !isServer) {
            const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
            if (process.env.ANALYZE === 'true') {
                config.plugins.push(
                    new BundleAnalyzerPlugin({
                        analyzerMode: 'static',
                        reportFilename: '../bundle-analysis.html',
                        openAnalyzer: false,
                    })
                );
            }
        }
        return config;
    },

    // Re-enable for production
    eslint: {
        ignoreDuringBuilds: true, // TODO: Re-enable after ESLint fixes
    },
    typescript: {
        ignoreBuildErrors: true, // TODO: Re-enable after Next.js path resolution fix
    },

    // Performance optimizations
    experimental: {
        optimizeCss: true,
    },

    // External packages for server components
    serverExternalPackages: ['@klynaa/api'],
};

module.exports = nextConfig;
