import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  async rewrites() {
    const backend = process.env.API_BASE_URL ?? "http://localhost:8080";
    return ["auth", "customer", "owner"].map((scope) => ({
      source: `/api/${scope}/:path*`,
      destination: `${backend}/api/${scope}/:path*`,
    }));
  },
};

export default withNextIntl(nextConfig);
