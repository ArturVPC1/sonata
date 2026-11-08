import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { UserRole } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { hashPassword, isLegacyHash, verifyPassword } from "@/lib/password"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
})

/**
 * Quais perfis acessam cada área. Quem não tem permissão volta ao /dashboard.
 * (As Server Actions e as páginas conferem de novo: esta é só a primeira barreira.)
 */
const ROTAS: { prefixo: string; perfis: UserRole[] }[] = [
  { prefixo: "/professores", perfis: ["ADMIN", "SECRETARIA"] },
  { prefixo: "/alunos", perfis: ["ADMIN", "SECRETARIA", "PROFESSOR"] },
  { prefixo: "/salas", perfis: ["ADMIN", "SECRETARIA"] },
  { prefixo: "/instrumentos", perfis: ["ADMIN", "SECRETARIA"] },
  { prefixo: "/reservas", perfis: ["ADMIN", "SECRETARIA", "PROFESSOR"] },
]

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials)
        if (!validated.success) return null

        const { email, senha } = validated.data
        const user = await prisma.usuario.findUnique({ where: { email: email.toLowerCase() } })

        // Usuário inexistente ou inativo não entra
        if (!user || !user.ativo) return null
        if (!(await verifyPassword(senha, user.senhaHash))) return null

        // Migra hashes antigos (SHA-256) para bcrypt no primeiro login bem-sucedido
        if (isLegacyHash(user.senhaHash)) {
          await prisma.usuario.update({
            where: { id: user.id },
            data: { senhaHash: await hashPassword(senha) },
          })
        }

        return { id: user.id, email: user.email, name: user.nome, role: user.role }
      },
    }),
  ],
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl
      if (pathname === "/login") return true
      if (!auth?.user) return false

      const regra = ROTAS.find((r) => pathname === r.prefixo || pathname.startsWith(r.prefixo + "/"))
      if (regra && !regra.perfis.includes(auth.user.role)) {
        return Response.redirect(new URL("/dashboard", request.nextUrl))
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
  pages: { signIn: "/login" },
})
