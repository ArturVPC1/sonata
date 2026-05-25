// auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // 👈 seus providers (Google, GitHub, Credentials, etc.)
  callbacks: {
    authorized({ request, auth }) {
      // 👈 sua lógica de autorização (se tinha dentro do auth.ts)
      const { pathname } = request.nextUrl;
      if (pathname === "/login") return true;
      return !!auth;
    },
    // outros callbacks (jwt, session, etc.)
  },
  pages: {
    signIn: "/login",
  },
  // outras opções (secret, trustHost, etc.)
} satisfies NextAuthConfig;