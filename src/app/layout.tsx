import type { Metadata } from "next"
import { SessionProvider } from "next-auth/react"
import "./globals.css"

export const metadata: Metadata = {
  title: "ERP Escola de Música",
  description: "Sistema de gerenciamento para escolas de música",
}

// Não chamamos auth() aqui para não importar Prisma no layout raiz.
// O SessionProvider busca a sessão automaticamente via /api/auth/session.
// Os layouts internos (dashboard) fazem auth() onde realmente é necessário.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
