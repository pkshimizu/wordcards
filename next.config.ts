import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Playwright は 127.0.0.1 で開くため、開発サーバーへの接続を許可する
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
