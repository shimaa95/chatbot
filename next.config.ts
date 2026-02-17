import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Allow the chatbot to be embedded in any iframe on any domain
        source: "/chatbot/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
          {
            // X-Frame-Options is superseded by CSP frame-ancestors but
            // kept for older browser compatibility
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
          {
            // Cookies in iframes require SameSite=None; Secure — but since
            // the chatbot guest flow has no auth cookies this is mainly for
            // any future session needs
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin",
          },
        ],
      },
      {
        // Full CORS support for all API routes so the embedded chatbot
        // can call /api/send-message and /api/graphql cross-origin
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            // Previously only "Content-Type" — Authorization was missing,
            // which blocked Clerk-authenticated requests from other origins
            value: "Content-Type, Authorization, Accept, X-Requested-With",
          },
          {
            // Required for preflight OPTIONS requests to be cached by browser
            key: "Access-Control-Max-Age",
            value: "86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;