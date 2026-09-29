import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    qualities: [65, 70, 75, 80, 85, 90, 95, 100],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }, { protocol: "https", hostname: "picsum.photos" }],
    minimumCacheTTL: 259200,
  },
  async redirects() {
    return ["classic-proposals", "modern-proposals", "dining-proposals", "adventure-proposals"].flatMap((category) =>
      ["", "/en", "/es"].flatMap((prefix) => [
        { source: `${prefix}/${category}/:slug`, destination: `${prefix || "/"}#experience-:slug`, permanent: true },
        // Legacy dining URLs describe PROPOSALS with dinner, not anniversary dinners.
        { source: `${prefix}/${category}`, destination: `${prefix || "/"}#proposals`, permanent: true },
      ]),
    );
  },
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
