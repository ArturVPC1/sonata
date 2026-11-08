"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { assertRole, STAFF } from "@/lib/session"
import { reservaFormSchema } from "@/lib/validations/reserva"
import { actionError, formToObject, zodFieldErrors, type FormState } from "@/lib/form-state"
import { diffMin, fmtTime, fromMin, dayRange, diaSemanaOf, toDbDateTime, toMin, todayStr } from "@/lib/dates"
import { MSG_CONFLITO_SALA, ocupacoesDoDia, conflita, salaEmManutencao } from "@/lib/conflitos"
import { redirectOk } from "@/lib/flash"

const MSG_CONFLITO_PROF = "Conflito de horário: o professor não está disponível neste período."

type Alvo = { salaId: string; professorId?: string | null; data: string; inicio: string; dur: number; ignoreReservaId?: string }

/** Retorna a mensagem de conflito (ou null se estiver livre). */
async function verificarConflitos(a: Alvo): Promise<string | null> {
  const sala = await prisma.sala.findUnique({ where: { id: a.salaId } })
  if (!sala) return "Sala não encontrada."
  if (salaEmManutencao(sala, a.data)) return MSG_CONFLITO_SALA
  const ocs = await ocupacoesDoDia(a.data, { reservaId: a.ignoreReservaId })
  if (conflita(ocs, { salaId: a.salaId }, a.inicio, a.dur)) return MSG_CONFLITO_SALA
  if (a.professorId && conflita(ocs, { professorId: a.professorId }, a.inicio, a.dur)) return MSG_CONFLITO_PROF
  return null
}

export async function criarReserva(_prev: FormState, fd: FormData): Promise<FormState> {
  try {
    const user = await assertRole(["ADMIN", "SECRETARIA", "PROFESSOR"])
    const parsed = reservaFormSchema.safeParse(formToObject(fd))
    if (!parsed.success) return { error: parsed.error.issues.find((i) => i.path[0] === "fim")?.message ?? "Corrija os campos destacados.", fieldErrors: zodFieldErrors(parsed.error) }
    const v = parsed.data
    if (v.data < todayStr()) return { error: "A data da reserva não pode ser anterior a hoje.", fieldErrors: { data: "Data anterior a hoje" } }

    let professorId: string | null = v.professorId || null
    if (user.role === "PROFESSOR") {
      const p = await prisma.professor.findUnique({ where: { usuarioId: user.id } })
      professorId = p?.id ?? null
    }
    const dur = diffMin(v.inicio, v.fim)
    const conflito = await verificarConflitos({ salaId: v.salaId, professorId, data: v.data, inicio: v.inicio, dur })
    if (conflito) return { error: conflito }

    await prisma.reserva.create({
      data: { salaId: v.salaId, criadoPorId: user.id, professorId, tipo: v.tipo, observacao: v.observacao ?? null, data: toDbDateTime(v.data, v.inicio), duracaoMin: dur },
    })
  } catch (e) {
    return actionError(e)
  }
  revalidatePath("/reservas")
  revalidatePath("/agenda")
  redirectOk("/reservas", "Reserva realizada com sucesso.")
}

/** RF027 — reagendamento (somente administração/secretaria). */
export async function reagendarReserva(id: string, _prev: FormState, fd: FormData): Promise<FormState> {
  try {
    await assertRole(STAFF)
    const atual = await prisma.reserva.findUnique({ where: { id } })
    if (!atual || atual.status !== "ATIVA") return { error: "Reserva não encontrada ou já cancelada." }
    const raw = formToObject(fd)
    const parsed = reservaFormSchema.safeParse({ ...raw, salaId: atual.salaId, tipo: atual.tipo })
    if (!parsed.success) return { error: parsed.error.issues.find((i) => i.path[0] === "fim")?.message ?? "Corrija os campos destacados.", fieldErrors: zodFieldErrors(parsed.error) }
    const v = parsed.data
    const dur = diffMin(v.inicio, v.fim)
    const conflito = await verificarConflitos({ salaId: atual.salaId, professorId: atual.professorId, data: v.data, inicio: v.inicio, dur, ignoreReservaId: id })
    if (conflito) return { error: conflito }
    await prisma.reserva.update({ where: { id }, data: { data: toDbDateTime(v.data, v.inicio), duracaoMin: dur } })
  } catch (e) {
    return actionError(e)
  }
  revalidatePath("/reservas")
  revalidatePath("/agenda")
  redirectOk("/reservas", "Reserva reagendada com sucesso.")
}

/** RF026 — cancelamento pelo autor da reserva ou pela administração. */
export async function cancelarReserva(id: string): Promise<FormState> {
  try {
    const user = await assertRole(["ADMIN", "SECRETARIA", "PROFESSOR"])
    const r = await prisma.reserva.findUnique({ where: { id } })
    if (!r) return { error: "Reserva não encontrada." }
    const pode = user.role === "ADMIN" || user.role === "SECRETARIA" || r.criadoPorId === user.id
    if (!pode) return { error: "Você não possui permissão para cancelar esta reserva." }
    await prisma.reserva.update({ where: { id }, data: { status: "CANCELADA" } })
    revalidatePath("/reservas")
    revalidatePath("/agenda")
    return { ok: true, message: "Reserva cancelada com sucesso." }
  } catch (e) {
    return actionError(e)
  }
}

/** Ocupação da sala em uma data, em ordem de horário (grade exibida no formulário). */
export async function ocupacaoDaSala(salaId: string, data: string): Promise<{ inicio: string; fim: string; descricao: string }[]> {
  await assertRole(["ADMIN", "SECRETARIA", "PROFESSOR"])
  if (!salaId || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return []
  const [sala, turmas, reservas] = await Promise.all([
    prisma.sala.findUnique({ where: { id: salaId } }),
    prisma.turma.findMany({ where: { salaId, ativo: true, diaSemana: diaSemanaOf(data) } }),
    prisma.reserva.findMany({ where: { salaId, status: "ATIVA", data: dayRange(data) } }),
  ])
  const out: { inicio: string; fim: string; descricao: string }[] = []
  if (sala && salaEmManutencao(sala, data)) out.push({ inicio: "00:00", fim: "23:59", descricao: "Sala em manutenção" })
  for (const t of turmas) out.push({ inicio: t.horario, fim: fromMin(toMin(t.horario) + t.duracaoMin), descricao: `Turma: ${t.nome}` })
  for (const r of reservas) out.push({ inicio: fmtTime(r.data), fim: fromMin(toMin(fmtTime(r.data)) + r.duracaoMin), descricao: "Reserva" })
  return out.sort((a, b) => a.inicio.localeCompare(b.inicio))
}
