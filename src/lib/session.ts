import { redirect } from "next/navigation"
import type { UserRole } from "@prisma/client"
import { auth } from "@/auth"

export type Role = UserRole
export const STAFF: Role[] = ["ADMIN", "SECRETARIA"]
export const isStaff = (role?: Role | null) => role === "ADMIN" || role === "SECRETARIA"

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrador",
  SECRETARIA: "Secretaria",
  PROFESSOR: "Professor",
  ALUNO: "Aluno",
}

/** Para páginas: exige login e (opcionalmente) um dos perfis; senão redireciona. */
export async function requireUser(roles?: Role[]) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (roles && !roles.includes(session.user.role)) redirect("/dashboard")
  return session.user
}

/** Para Server Actions: lança erro (tratado pela action) se não houver permissão. */
export async function assertRole(roles: Role[]) {
  const session = await auth()
  if (!session?.user || !roles.includes(session.user.role)) {
    throw new Error("Você não tem permissão para esta ação.")
  }
  return session.user
}
