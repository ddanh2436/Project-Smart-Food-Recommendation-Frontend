import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  images: {
    /**
     * Restaurant photos are hot-linked from the crawled sources.
     *
     * `hostname: "**"` allowed any host on the internet to be proxied through
     * this site's image endpoint — an open relay that also lets a third party
     * burn the Vercel image quota. These are the hosts the data actually uses;
     * add to the list rather than widening it back to a wildcard.
     */
    remotePatterns: [
      // ShopeeFood's CDN: 5,504 of the 5,506 restaurant photos live here.
      { protocol: "https", hostname: "**.susercontent.com" },
      { protocol: "https", hostname: "**.foody.vn" },
      { protocol: "https", hostname: "**.foodycdn.net" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "**.pinimg.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
    ],
    // Remote sources set no useful cache headers, so cache the optimized
    // output here for a day instead of re-fetching on every request.
    minimumCacheTTL: 86_400,
    formats: ["image/webp"],
  },

  /**
   * `typescript.ignoreBuildErrors` used to be true, which meant every type
   * error in the app shipped to production silently — including real ones that
   * only surfaced once it was removed. Keep it off.
   */

  // Do not advertise the framework version to every visitor.
  poweredByHeader: false,

  // Note: Next.js 16 dropped the `eslint` config key; linting is run
  // separately via `npm run lint`.

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            // Geolocation is used by the "near me" features; nothing else.
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },

  // Surface the API host at build time so a misconfigured deploy is visible in
  // the Vercel build log rather than only failing in the browser.
  env: { NEXT_PUBLIC_API_URL: apiUrl },
};

export default nextConfig;
