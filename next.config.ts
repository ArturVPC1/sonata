import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    // Necessário para server actions com next-auth v5
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
}

export default nextConfig
