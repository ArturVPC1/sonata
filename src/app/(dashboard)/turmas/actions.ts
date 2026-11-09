"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { assertRole, STAFF } from "@/lib/session"
import { turmaFormSchema } from "@/lib/validations/turma"
import { actionError, formToObject, zodFieldErrors, type FormState, erroValidacao } from "@/lib/form-state"
import { overlaps, proximaDataDoDia } from "@/lib/dates"
import { sincronizarAulasDaTurma } from "@/lib/aulas"
import { MSG_CONFLITO_PROF_OU_SALA, salaEmManutencao } from "@/lib/conflitos"
import { redirectOk } from "@/lib/flash"

export async function salvarTurma(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  try {
    await assertRole(STAFF)
    const parsed = turmaFormSchema.safeParse(formToObject(fd))
    if (!parsed.success) return erroValidacao(parsed.error)
    const v = parsed.data
    const salaId = v.salaId || null

    // Conflitos de horário (professor e sala) no mesmo dia, entre turmas ativas
    const mesmas = await prisma.turma.findMany({
      where: { ativo: true, diaSemana: v.diaSemana, ...(id ? { id: { not: id } } : {}), OR: [{ professorId: v.professorId }, ...(salaId ? [{ salaId }] : [])] },
    })
    for (const o of mesmas) {
      if (!overlaps(o.horario, o.duracaoMin, v.horario, v.duracaoMin)) continue
      if (o.professorId === v.professorId || (salaId && o.salaId === salaId)) return { error: MSG_CONFLITO_PROF_OU_SALA }
    }

    if (salaId) {
      const sala = await prisma.sala.findUnique({ where: { id: salaId } })
      if (!sala) return { error: "Sala não encontrada." }
      if (salaEmManutencao(sala, proximaDataDoDia(v.diaSemana))) return { error: MSG_CONFLITO_PROF_OU_SALA, fieldErrors: { salaId: "Sala em manutenção" } }
    }

    const prof = await prisma.professor.findUnique({ where: { id: v.professorId }, include: { usuario: true } })
    if (!prof?.usuario.ativo) return { error: "O professor selecionado está inativo.", fieldErrors: { professorId: "Professor inativo" } }

    if (id) {
      const ativos = await prisma.matricula.count({ where: { turmaId: id, ativo: true } })
      if (v.vagas < ativos) return { error: `A turma já tem ${ativos} aluno(s) matriculado(s); as vagas não podem ser menores.`, fieldErrors: { vagas: `Mínimo ${ativos}` } }
      const t = await prisma.turma.update({ where: { id }, data: { ...v, salaId } })
      await sincronizarAulasDaTurma(t)
    } else {
      const t = await prisma.turma.create({ data: { ...v, salaId } })
      await sincronizarAulasDaTurma(t)
    }
  } catch (e) {
    return actionError(e)
  }
  revalidatePath("/turmas")
  redirectOk("/turmas", id ? "Dados da turma atualizados com sucesso." : "Turma cadastrada com sucesso.")
}

export async function alternarTurma(id: string): Promise<FormState> {
  try {
    await assertRole(STAFF)
    const t = await prisma.turma.findUnique({ where: { id } })
    if (!t) return { error: "Turma não encontrada." }
    const nova = await prisma.turma.update({ where: { id }, data: { ativo: !t.ativo } })
    await sincronizarAulasDaTurma(nova)
    revalidatePath("/turmas")
    return { ok: true }
  } catch (e) {
    return actionError(e)
  }
}
