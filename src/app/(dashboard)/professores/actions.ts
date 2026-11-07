"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { assertRole, STAFF } from "@/lib/session"
import { hashPassword } from "@/lib/password"
import { professorFormSchema } from "@/lib/validations/professor"
import { actionError, formToObject, zodFieldErrors, type FormState } from "@/lib/form-state"

export async function salvarProfessor(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  try {
    await assertRole(STAFF)
    const parsed = professorFormSchema.safeParse(formToObject(fd))
    if (!parsed.success) return { error: "Corrija os campos destacados.", fieldErrors: zodFieldErrors(parsed.error) }
    const { senha, nome, email, telefone, bio } = parsed.data

    if (id) {
      const atual = await prisma.professor.findUnique({ where: { id } })
      if (!atual) return { error: "Professor não encontrado." }
      await prisma.$transaction(async (tx) => {
        await tx.usuario.update({
          where: { id: atual.usuarioId },
          data: { nome, email, ...(senha ? { senhaHash: await hashPassword(senha) } : {}) },
        })
        await tx.professor.update({ where: { id }, data: { telefone: telefone ?? null, bio: bio ?? null } })
      })
    } else {
      if (!senha) return { error: "Corrija os campos destacados.", fieldErrors: { senha: "Informe a senha inicial (mín. 6 caracteres)" } }
      await prisma.usuario.create({
        data: {
          nome, email, role: "PROFESSOR", senhaHash: await hashPassword(senha),
          professor: { create: { telefone: telefone ?? null, bio: bio ?? null } },
        },
      })
    }
  } catch (e) {
    return actionError(e)
  }
  revalidatePath("/professores")
  redirect("/professores")
}

export async function alternarProfessor(id: string): Promise<FormState> {
  try {
    await assertRole(STAFF)
    const p = await prisma.professor.findUnique({ where: { id }, include: { usuario: true, _count: { select: { turmas: { where: { ativo: true } } } } } })
    if (!p) return { error: "Professor não encontrado." }
    if (p.usuario.ativo && p._count.turmas > 0) {
      return { error: `Não é possível inativar: o professor tem ${p._count.turmas} turma(s) ativa(s). Reatribua ou inative as turmas antes.` }
    }
    await prisma.usuario.update({ where: { id: p.usuarioId }, data: { ativo: !p.usuario.ativo } })
    revalidatePath("/professores")
    return { ok: true }
  } catch (e) {
    return actionError(e)
  }
}
