import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/sidebar"

// Layout exclusivo das páginas autenticadas.
// O proxy já bloqueia rotas, mas auth() aqui serve como
// segunda barreira e fornece os dados do usuário ao Sidebar.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")
  const naoLidas = await prisma.notificacao.count({ where: { usuarioId: session.user.id, lida: false } })

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar user={session.user} naoLidas={naoLidas} />
      <main className="flex-1 min-w-0 p-4 pt-20 lg:p-8 lg:pt-8 overflow-x-auto">{children}</main>
    </div>
  )
}
