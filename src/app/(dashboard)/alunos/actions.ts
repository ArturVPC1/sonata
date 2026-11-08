"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { assertRole, STAFF } from "@/lib/session"
import { hashPassword } from "@/lib/password"
import { alunoFormSchema } from "@/lib/validations/aluno"
import { actionError, formToObject, zodFieldErrors, type FormState } from "@/lib/form-state"
import { matricular } from "@/lib/matricula"
import { todayStr, isDateStr } from "@/lib/dates"
import { redirectOk } from "@/lib/flash"

export async function salvarAluno(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  try {
    await assertRole(STAFF)
    const parsed = alunoFormSchema.safeParse(formToObject(fd))
    if (!parsed.success) return { error: "Corrija os campos destacados.", fieldErrors: zodFieldErrors(parsed.error) }
    const { senha, dataNasc, ...v } = parsed.data
    const data = {
      ...v,
      dataNasc: dataNasc ? new Date(`${dataNasc}T00:00:00.000Z`) : null,
      telefone: v.telefone ?? null,
      cpf: v.cpf ?? null,
      responsavelNome: v.responsavelNome ?? null,
      responsavelTelefone: v.responsavelTelefone ?? null,
      observacoes: v.observacoes ?? null,
    }

    if (id) {
      const atual = await prisma.aluno.findUnique({ where: { id } })
      if (!atual) return { error: "Aluno não encontrado." }
      await prisma.$transaction(async (tx) => {
        await tx.aluno.update({ where: { id }, data })
        if (atual.usuarioId) await tx.usuario.update({ where: { id: atual.usuarioId }, data: { nome: data.nome, email: data.email } })
        else if (senha) {
          const u = await tx.usuario.create({ data: { nome: data.nome, email: data.email, senhaHash: await hashPassword(senha), role: "ALUNO" } })
          await tx.aluno.update({ where: { id }, data: { usuarioId: u.id } })
        }
      })
    } else {
      await prisma.$transaction(async (tx) => {
        const u = senha
          ? await tx.usuario.create({ data: { nome: data.nome, email: data.email, senhaHash: await hashPassword(senha), role: "ALUNO" } })
          : null
        await tx.aluno.create({ data: { ...data, usuarioId: u?.id ?? null } })
      })
    }
  } catch (e) {
    return actionError(e, { entity: "aluno" })
  }
  revalidatePath("/alunos")
  redirectOk("/alunos", id ? "Dados do aluno atualizados com sucesso." : "Aluno cadastrado com sucesso.")
}

export async function alternarAluno(id: string): Promise<FormState> {
  try {
    await assertRole(STAFF)
    const a = await prisma.aluno.findUnique({ where: { id } })
    if (!a) return { error: "Aluno não encontrado." }
    const ativo = !a.ativo
    await prisma.$transaction(async (tx) => {
      await tx.aluno.update({ where: { id }, data: { ativo } })
      if (a.usuarioId) await tx.usuario.update({ where: { id: a.usuarioId }, data: { ativo } })
      if (!ativo) await tx.matricula.updateMany({ where: { alunoId: id, ativo: true }, data: { ativo: false, dataFim: new Date(`${todayStr()}T00:00:00.000Z`) } })
    })
    revalidatePath("/alunos")
    revalidatePath("/alunos/editar")
    return { ok: true }
  } catch (e) {
    return actionError(e, { entity: "aluno" })
  }
}

/** RF003 — exclui o aluno, desde que não haja vínculos ativos (matrículas ativas ou solicitações pendentes). */
export async function excluirAluno(id: string): Promise<FormState> {
  try {
    await assertRole(STAFF)
    const a = await prisma.aluno.findUnique({ where: { id } })
    if (!a) return { error: "Aluno não encontrado." }
    const [matriculas, pendentes] = await Promise.all([
      prisma.matricula.count({ where: { alunoId: id, ativo: true } }),
      prisma.solicitacaoAula.count({ where: { alunoId: id, status: "PENDENTE" } }),
    ])
    if (matriculas > 0 || pendentes > 0) return { error: "Não é possível excluir o aluno. Existem vínculos ativos associados a este registro." }
    await prisma.$transaction(async (tx) => {
      await tx.solicitacaoAula.deleteMany({ where: { alunoId: id } })
      await tx.matricula.deleteMany({ where: { alunoId: id } })
      await tx.pagamento.deleteMany({ where: { alunoId: id } })
      await tx.aluno.delete({ where: { id } })
      if (a.usuarioId) await tx.usuario.delete({ where: { id: a.usuarioId } })
    })
  } catch (e) {
    return actionError(e, { entity: "aluno" })
  }
  revalidatePath("/alunos")
  redirectOk("/alunos", "Aluno excluído com sucesso.")
}

export async function matricularAluno(alunoId: string, turmaId: string, dataInicio?: string): Promise<FormState> {
  try {
    await assertRole(STAFF)
    if (!alunoId) return { error: "Selecione um aluno." }
    if (!turmaId) return { error: "Selecione uma turma." }
    const inicio = dataInicio && isDateStr(dataInicio) ? dataInicio : todayStr()
    await matricular(alunoId, turmaId, new Date(`${inicio}T00:00:00.000Z`))
    revalidatePath("/alunos/editar")
    revalidatePath("/turmas")
    revalidatePath("/turmas/detalhe")
    return { ok: true, message: "Aluno matriculado com sucesso." }
  } catch (e) {
    return actionError(e)
  }
}

export async function desmatricularAluno(alunoId: string, turmaId: string): Promise<FormState> {
  try {
    await assertRole(STAFF)
    await prisma.matricula.update({
      where: { alunoId_turmaId: { alunoId, turmaId } },
      data: { ativo: false, dataFim: new Date(`${todayStr()}T00:00:00.000Z`) },
    })
    revalidatePath("/alunos/editar")
    revalidatePath("/turmas")
    revalidatePath("/turmas/detalhe")
    return { ok: true }
  } catch (e) {
    return actionError(e)
  }
}
