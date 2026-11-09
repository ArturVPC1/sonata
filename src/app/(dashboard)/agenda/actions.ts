"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { assertRole, STAFF } from "@/lib/session"
import { actionError, type FormState } from "@/lib/form-state"
import { addDays, dayRange, diaSemanaOf, isDateStr, toDbDateTime, weekStart, DIAS_UTEIS_E_SABADO } from "@/lib/dates"

export async function criarAula(data: string, turmaId: string): Promise<FormState> {
  try {
    await assertRole(STAFF)
    if (!isDateStr(data)) return { error: "Data inválida." }
    if (!turmaId) return { error: "Selecione uma turma." }
    const t = await prisma.turma.findUnique({ where: { id: turmaId } })
    if (!t || !t.ativo) return { error: "Turma inexistente ou inativa." }
    if (t.diaSemana !== diaSemanaOf(data)) return { error: "A turma não acontece neste dia da semana." }
    const dt = toDbDateTime(data, t.horario)
    const ja = await prisma.aula.findFirst({ where: { turmaId, data: dayRange(data) } })
    if (ja) return { error: "Esta turma já tem aula agendada neste dia." }
    await prisma.aula.create({ data: { turmaId, data: dt } })
    revalidatePath("/agenda")
    return { ok: true }
  } catch (e) {
    return actionError(e)
  }
}

export async function gerarSemana(data: string): Promise<FormState> {
  try {
    await assertRole(STAFF)
    if (!isDateStr(data)) return { error: "Data inválida." }
    const seg = weekStart(data)
    const turmas = await prisma.turma.findMany({ where: { ativo: true } })
    let criadas = 0
    for (const t of turmas) {
      const offset = DIAS_UTEIS_E_SABADO.indexOf(t.diaSemana)
      if (offset < 0) continue
      const dia = addDays(seg, offset)
      const ja = await prisma.aula.findFirst({ where: { turmaId: t.id, data: dayRange(dia) } })
      if (!ja) {
        await prisma.aula.create({ data: { turmaId: t.id, data: toDbDateTime(dia, t.horario) } })
        criadas++
      }
    }
    revalidatePath("/agenda")
    return criadas > 0 ? { ok: true } : { ok: true, error: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function alternarRealizada(aulaId: string, observacao?: string): Promise<FormState> {
  try {
    const user = await assertRole(["ADMIN", "SECRETARIA", "PROFESSOR"])
    const a = await prisma.aula.findUnique({ where: { id: aulaId }, include: { turma: { include: { professor: true } } } })
    if (!a) return { error: "Aula não encontrada." }
    if (user.role === "PROFESSOR" && a.turma.professor.usuarioId !== user.id) return { error: "Você só pode atualizar aulas das suas turmas." }
    await prisma.aula.update({ where: { id: aulaId }, data: { realizada: !a.realizada, observacao: a.realizada ? null : observacao?.trim().slice(0, 300) || null } })
    revalidatePath("/agenda")
    return { ok: true }
  } catch (e) {
    return actionError(e)
  }
}

export async function excluirAula(aulaId: string): Promise<FormState> {
  try {
    await assertRole(STAFF)
    await prisma.aula.delete({ where: { id: aulaId } })
    revalidatePath("/agenda")
    return { ok: true }
  } catch (e) {
    return actionError(e)
  }
}
