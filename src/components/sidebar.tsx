"use client"

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
  CreditCard,
  LogOut,
  Music,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/alunos", label: "Alunos", icon: Users },
  { href: "/professores", label: "Professores", icon: GraduationCap },
  { href: "/turmas", label: "Turmas", icon: Music2 },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/pagamentos", label: "Pagamentos", icon: CreditCard },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 border-r bg-card flex flex-col">
      {/* Marca */}
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Music className="h-4 w-4" />
        </div>
        <span className="font-bold text-sm leading-tight">
          ERP Escola
          <br />
          <span className="text-muted-foreground font-normal">de Música</span>
        </span>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4 space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Usuário + logout */}
      <div className="border-t p-4 space-y-3">
        <div className="px-1">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          {user.role && (
            <span className="inline-block mt-1 text-[10px] font-medium uppercase tracking-wide bg-muted px-1.5 py-0.5 rounded">
              {user.role}
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
    </aside>
  )
}
