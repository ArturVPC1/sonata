import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar"

// Layout exclusivo das páginas autenticadas.
// O middleware já bloqueia rotas, mas auth() aqui serve como
// segunda barreira e fornece os dados do usuário ao Sidebar.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar user={session.user} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
