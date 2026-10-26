import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), geolocation=(), microphone=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    const backend = process.env.API_BASE_URL ?? "http://localhost:8080";
    return ["auth", "account", "customer", "owner", "admin", "locations", "restaurants"].map((scope) => ({
      source: `/api/${scope}/:path*`,
      destination: `${backend}/api/${scope}/:path*`,
    }));
  },
};

export default withNextIntl(nextConfig);
