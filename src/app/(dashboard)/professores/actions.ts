"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { assertRole, STAFF } from "@/lib/session"
import { hashPassword } from "@/lib/password"
import { professorFormSchema } from "@/lib/validations/professor"
import { actionError, formToObject, zodFieldErrors, type FormState, erroValidacao } from "@/lib/form-state"
import { redirectOk } from "@/lib/flash"

export async function salvarProfessor(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  try {
    await assertRole(STAFF)
    const parsed = professorFormSchema.safeParse(formToObject(fd))
    if (!parsed.success) return erroValidacao(parsed.error)
    const { senha, nome, email, cpf, telefone, endereco, registroProfissional, bio } = parsed.data
    const perfil = { cpf, telefone, endereco, registroProfissional: registroProfissional ?? null, bio: bio ?? null }

    if (id) {
      const atual = await prisma.professor.findUnique({ where: { id } })
      if (!atual) return { error: "Professor não encontrado." }
      await prisma.$transaction(async (tx) => {
        await tx.usuario.update({
          where: { id: atual.usuarioId },
          data: { nome, email, ...(senha ? { senhaHash: await hashPassword(senha) } : {}) },
        })
        await tx.professor.update({ where: { id }, data: perfil })
      })
    } else {
      if (!senha) return { error: "Corrija os campos destacados.", fieldErrors: { senha: "Informe a senha inicial (mín. 6 caracteres)" } }
      await prisma.usuario.create({
        data: { nome, email, role: "PROFESSOR", senhaHash: await hashPassword(senha), professor: { create: perfil } },
      })
    }
  } catch (e) {
    return actionError(e, { entity: "professor" })
  }
  revalidatePath("/professores")
  redirectOk("/professores", id ? "Dados do professor atualizados com sucesso." : "Professor cadastrado com sucesso.")
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
    return actionError(e, { entity: "professor" })
  }
}

/** RF010 — exclui o professor, desde que não haja vínculos (turmas, solicitações pendentes ou reservas futuras). */
export async function excluirProfessor(id: string): Promise<FormState> {
  try {
    await assertRole(STAFF)
    const p = await prisma.professor.findUnique({ where: { id } })
    if (!p) return { error: "Professor não encontrado." }
    const agora = new Date()
    const [turmas, pendentes, reservas] = await Promise.all([
      prisma.turma.count({ where: { professorId: id } }),
      prisma.solicitacaoAula.count({ where: { professorId: id, status: "PENDENTE" } }),
      prisma.reserva.count({ where: { OR: [{ professorId: id }, { criadoPorId: p.usuarioId }], status: "ATIVA", data: { gte: agora } } }),
    ])
    if (turmas > 0 || pendentes > 0 || reservas > 0) return { error: "Não é possível excluir o professor. Existem vínculos ativos associados a este registro." }
    await prisma.$transaction(async (tx) => {
      await tx.solicitacaoAula.deleteMany({ where: { professorId: id } })
      await tx.reserva.deleteMany({ where: { OR: [{ professorId: id }, { criadoPorId: p.usuarioId }] } })
      await tx.professor.delete({ where: { id } })
      await tx.usuario.delete({ where: { id: p.usuarioId } })
    })
  } catch (e) {
    return actionError(e, { entity: "professor" })
  }
  revalidatePath("/professores")
  redirectOk("/professores", "Professor excluído com sucesso.")
}
