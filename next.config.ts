import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack(config, { isServer }) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Handle WASM files for libheif (image tools) — async WASM module type.
    // Exclude onnxruntime-web's WASM files which use their own loader internally.
    config.module.rules.push({
      test: /\.wasm$/,
      exclude: /node_modules[\\/]onnxruntime-web/,
      type: "webassembly/async",
    });

    // onnxruntime-web (used by @imgly/background-removal) ships its own WASM
    // files that reference internal path aliases webpack can't resolve.
    // Tell webpack to ignore those .wasm references — onnxruntime loads them
    // at runtime via fetch() anyway, not through the module system.
    config.module.rules.push({
      test: /onnxruntime-web[\\/]dist[\\/].*\.wasm$/,
      type: "asset/resource",
    });

    // On the server side, mark @imgly/background-removal as external so it
    // is never bundled into the server build at all. The next/dynamic ssr:false
    // wrapper ensures it only ever runs in the browser.
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "@imgly/background-removal",
        "onnxruntime-web",
      ];
    }

    return config;
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLint runs in CI/pre-commit — don't let warnings block production builds.
    // TypeScript errors (ignoreBuildErrors: false) still fail the build.
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 86400, // Cache optimized images for 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        // Allow any HTTPS host (MinIO CDN, S3, Cloudflare Images, external blog image URLs)
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/:path*\\.(jpg|jpeg|png|webp|avif|gif|ico|svg)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/tools/(audio|video)/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/blogs", destination: "/blog", permanent: true },
      { source: "/blogs/:path*", destination: "/blog/:path*", permanent: true },
      { source: "/privacy-policy", destination: "/legal/privacy", permanent: true },
      { source: "/terms-of-use", destination: "/legal/terms", permanent: true },
      { source: "/refund-policy", destination: "/legal/refund", permanent: true },
      { source: "/compare/trndinn/buffer", destination: "/vs/buffer", permanent: true },
      { source: "/compare/trndinn/postiz", destination: "/vs/postiz", permanent: true },
    ];
  },
};

export default nextConfig;
