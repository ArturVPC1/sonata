import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/crypto";
import { getUserByEmail } from "@/lib/user-actions"; // ⚠️ Veja nota abaixo

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        // 👈 Essa função NÃO roda no middleware, só nas API Routes
        const user = await getUserByEmail(credentials.email as string);
        if (user && await verifyPassword(credentials.password as string, user.password)) {
          return { id: user.id, email: user.email };
        }
        return null;
      }
    })
  ],
  callbacks: {
    authorized({ request, auth }) {
      // 👈 Essa função roda no middleware (Edge)
      const { pathname } = request.nextUrl;
      if (pathname === "/login") return true;
      return !!auth;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    }
  },
  pages: { signIn: "/login" },
} satisfies NextAuthConfig;