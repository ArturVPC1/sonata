// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"], // 👈 sem "experimental"
  // Se quiser manter Turbopack local, adicione:
  // turbopack: {},
};

export default nextConfig;