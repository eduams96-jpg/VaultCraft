import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera .next/standalone: servidor autónomo que a distribuição Windows usa (sem npm em runtime)
  output: "standalone",
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // src/proxy.ts guarda as rotas /api; o proxy só faz buffer do corpo até este limite
    // (10MB por omissão), o que truncaria o restauro de backups JSON grandes.
    proxyClientMaxBodySize: "200mb",
  },
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
