import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
            return [
              {
                source: "/api/:path*", // Apply to all API routes
                headers: [
                  { key: "Access-Control-Allow-Credentials", value: "true" },
                  { key: "Access-Control-Allow-Origin", value: "*" }, // Or specific origins like 'https://example.com'
                  { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
                  { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ],
              },
            ];
          },
};

export default nextConfig;
