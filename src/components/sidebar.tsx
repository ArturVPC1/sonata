"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Music2,
  CalendarDays,
  DoorOpen,
  Guitar,
  BookmarkCheck,
  MessageSquarePlus,
  Bell,
  LogOut,
  Menu,
  X,
  Music,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  user: { name?: string | null; email?: string | null; role?: string }
  naoLidas?: number
}

type Role = "ADMIN" | "SECRETARIA" | "PROFESSOR" | "ALUNO"
const ALL: Role[] = ["ADMIN", "SECRETARIA", "PROFESSOR", "ALUNO"]
const STAFF: Role[] = ["ADMIN", "SECRETARIA"]
const navLinks: { href: string; label: string; icon: typeof Users; roles: Role[] }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ALL },
  { href: "/alunos", label: "Alunos", icon: Users, roles: [...STAFF, "PROFESSOR"] },
  { href: "/professores", label: "Professores", icon: GraduationCap, roles: STAFF },
  { href: "/instrumentos", label: "Instrumentos", icon: Guitar, roles: STAFF },
  { href: "/salas", label: "Salas", icon: DoorOpen, roles: STAFF },
  { href: "/turmas", label: "Turmas", icon: Music2, roles: ALL },
  { href: "/agenda", label: "Agenda", icon: CalendarDays, roles: ALL },
  { href: "/reservas", label: "Reservas", icon: BookmarkCheck, roles: [...STAFF, "PROFESSOR"] },
  { href: "/solicitacoes", label: "Aulas extras", icon: MessageSquarePlus, roles: ALL },
  { href: "/notificacoes", label: "Notificações", icon: Bell, roles: ALL },
  // Pagamentos: módulo previsto como complementar (implementação posterior)
]
const ROLE_LABEL: Record<string, string> = { ADMIN: "Administrador", SECRETARIA: "Secretaria", PROFESSOR: "Professor", ALUNO: "Aluno" }

export function Sidebar({ user, naoLidas = 0 }: SidebarProps) {
  const pathname = usePathname()
  const [aberto, setAberto] = useState(false)

  // Fecha o menu ao navegar (versão móvel)
  useEffect(() => setAberto(false), [pathname])

  const label = (l: { href: string; label: string }) => (l.href === "/solicitacoes" && user.role !== "ALUNO" ? "Solicitações" : l.label)

  const conteudo = (
    <>
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Music className="h-4 w-4" />
        </div>
        <span className="font-bold text-sm leading-tight">
          SONATA, um Web App
          <br />
          <span className="text-muted-foreground font-normal">Para Escolas de Música</span>
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Principal">
        {navLinks
          .filter((l) => !user.role || l.roles.includes(user.role as Role))
          .map((l) => {
            const Icon = l.icon
            const ativo = pathname === l.href || (l.href !== "/dashboard" && pathname.startsWith(l.href + "/"))
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  ativo ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{label(l)}</span>
                {l.href === "/notificacoes" && naoLidas > 0 && (
                  <span className="rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground" aria-label={`${naoLidas} não lidas`}>
                    {naoLidas}
                  </span>
                )}
              </Link>
            )
          })}
      </nav>

      <div className="border-t p-4 space-y-3">
        <div className="px-1">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          {user.role && (
            <span className="inline-block mt-1 text-[10px] font-medium uppercase tracking-wide bg-muted px-1.5 py-0.5 rounded">
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Barra superior (celular e tablet) */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-4">
        <Button variant="ghost" size="icon" onClick={() => setAberto(true)} aria-label="Abrir menu" aria-expanded={aberto}>
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-bold text-sm">SONATA</span>
        {naoLidas > 0 && (
          <Link href="/notificacoes" className="ml-auto flex items-center gap-1 text-sm text-muted-foreground" aria-label={`${naoLidas} notificações não lidas`}>
            <Bell className="h-4 w-4" />
            {naoLidas}
          </Link>
        )}
      </header>

      {/* Menu deslizante (celular e tablet) */}
      {aberto && (
        <div className="lg:hidden fixed inset-0 z-40 flex" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAberto(false)} />
          <aside className="relative flex w-72 max-w-[85%] flex-col bg-card shadow-xl">
            <Button variant="ghost" size="icon" className="absolute right-2 top-3" onClick={() => setAberto(false)} aria-label="Fechar menu">
              <X className="h-5 w-5" />
            </Button>
            {conteudo}
          </aside>
        </div>
      )}

      {/* Barra lateral fixa (desktop) */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r bg-card flex-col">{conteudo}</aside>
    </>
  )
}
