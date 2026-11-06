"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { assertRole, STAFF } from "@/lib/session"
import { turmaFormSchema } from "@/lib/validations/turma"
import { actionError, formToObject, zodFieldErrors, type FormState } from "@/lib/form-state"
import { overlaps } from "@/lib/dates"

export async function salvarTurma(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  try {
    await assertRole(STAFF)
    const parsed = turmaFormSchema.safeParse(formToObject(fd))
    if (!parsed.success) return { error: "Corrija os campos destacados.", fieldErrors: zodFieldErrors(parsed.error) }
    const v = parsed.data
    const salaId = v.salaId || null

    // Conflitos de horário (professor e sala) no mesmo dia, entre turmas ativas
    const mesmas = await prisma.turma.findMany({
      where: { ativo: true, diaSemana: v.diaSemana, ...(id ? { id: { not: id } } : {}), OR: [{ professorId: v.professorId }, ...(salaId ? [{ salaId }] : [])] },
    })
    for (const o of mesmas) {
      if (!overlaps(o.horario, o.duracaoMin, v.horario, v.duracaoMin)) continue
      if (o.professorId === v.professorId) return { error: `O professor já tem a turma "${o.nome}" neste horário (${o.horario}).` }
      if (salaId && o.salaId === salaId) return { error: `A sala já está ocupada pela turma "${o.nome}" neste horário (${o.horario}).` }
    }

    if (salaId) {
      const sala = await prisma.sala.findUnique({ where: { id: salaId } })
      if (!sala) return { error: "Sala não encontrada." }
      if (sala.status === "MANUTENCAO") return { error: `A sala "${sala.nome}" está em manutenção.`, fieldErrors: { salaId: "Sala em manutenção" } }
    }

    const prof = await prisma.professor.findUnique({ where: { id: v.professorId }, include: { usuario: true } })
    if (!prof?.usuario.ativo) return { error: "O professor selecionado está inativo.", fieldErrors: { professorId: "Professor inativo" } }

    if (id) {
      const ativos = await prisma.matricula.count({ where: { turmaId: id, ativo: true } })
      if (v.vagas < ativos) return { error: `A turma já tem ${ativos} aluno(s) matriculado(s); as vagas não podem ser menores.`, fieldErrors: { vagas: `Mínimo ${ativos}` } }
      await prisma.turma.update({ where: { id }, data: { ...v, salaId } })
    } else {
      await prisma.turma.create({ data: { ...v, salaId } })
    }
  } catch (e) {
    return actionError(e)
  }
  revalidatePath("/turmas")
  redirect("/turmas")
}

export async function alternarTurma(id: string): Promise<FormState> {
  try {
    await assertRole(STAFF)
    const t = await prisma.turma.findUnique({ where: { id } })
    if (!t) return { error: "Turma não encontrada." }
    await prisma.turma.update({ where: { id }, data: { ativo: !t.ativo } })
    revalidatePath("/turmas")
    return { ok: true }
  } catch (e) {
    return actionError(e)
  }
}
