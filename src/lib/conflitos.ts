import { prisma } from "@/lib/prisma"
import { dayRange, diaSemanaOf, fmtTime, fromMin, overlaps, toInputDate, toMin } from "@/lib/dates"

export { MSG_CONFLITO_SALA, MSG_CONFLITO_PROF_OU_SALA, MSG_HORARIO_INVALIDO } from "@/lib/mensagens"
import { MSG_CONFLITO_SALA, MSG_CONFLITO_PROF_OU_SALA, MSG_HORARIO_INVALIDO } from "@/lib/mensagens"

export type Ocupacao = { origem: "turma" | "reserva"; id: string; salaId: string | null; professorId: string | null; inicio: string; dur: number }

/** Tudo que ocupa sala/professor em uma data: turmas ativas do dia da semana e reservas ativas. */
export async function ocupacoesDoDia(dateStr: string, ignore?: { reservaId?: string; turmaId?: string }): Promise<Ocupacao[]> {
  const [turmas, reservas] = await Promise.all([
    prisma.turma.findMany({ where: { ativo: true, diaSemana: diaSemanaOf(dateStr), ...(ignore?.turmaId ? { id: { not: ignore.turmaId } } : {}) } }),
    prisma.reserva.findMany({ where: { status: "ATIVA", data: dayRange(dateStr), ...(ignore?.reservaId ? { id: { not: ignore.reservaId } } : {}) } }),
  ])
  return [
    ...turmas.map((t) => ({ origem: "turma" as const, id: t.id, salaId: t.salaId, professorId: t.professorId, inicio: t.horario, dur: t.duracaoMin })),
    ...reservas.map((r) => ({ origem: "reserva" as const, id: r.id, salaId: r.salaId, professorId: r.professorId, inicio: fmtTime(r.data), dur: r.duracaoMin })),
  ]
}

/** Função pura: há ocupação conflitante para a sala e/ou o professor no intervalo? */
export function conflita(ocs: Ocupacao[], alvo: { salaId?: string | null; professorId?: string | null }, inicio: string, dur: number) {
  return ocs.some(
    (o) =>
      overlaps(o.inicio, o.dur, inicio, dur) &&
      ((alvo.salaId && o.salaId === alvo.salaId) || (alvo.professorId && o.professorId === alvo.professorId))
  )
}

/** Sala em manutenção na data? (sem data de término, considera indisponível) */
export function salaEmManutencao(sala: { status: string; manutencaoAte: Date | null }, dateStr: string) {
  if (sala.status !== "MANUTENCAO") return false
  return !sala.manutencaoAte || dateStr <= toInputDate(sala.manutencaoAte)
}

export async function salaDisponivel(salaId: string, dateStr: string, inicio: string, dur: number, ignore?: { reservaId?: string }) {
  const sala = await prisma.sala.findUnique({ where: { id: salaId } })
  if (!sala || salaEmManutencao(sala, dateStr)) return false
  const ocs = await ocupacoesDoDia(dateStr, ignore)
  return !conflita(ocs, { salaId }, inicio, dur)
}

export async function professorDisponivel(professorId: string, dateStr: string, inicio: string, dur: number, ignore?: { reservaId?: string }) {
  const ocs = await ocupacoesDoDia(dateStr, ignore)
  return !conflita(ocs, { professorId }, inicio, dur)
}

/** Até 3 horários alternativos no mesmo dia, com o professor livre e ao menos uma sala disponível. */
export async function sugerirHorarios(professorId: string, dateStr: string, inicio: string, dur: number) {
  const [ocs, salas] = await Promise.all([ocupacoesDoDia(dateStr), prisma.sala.findMany()])
  const salasOk = salas.filter((s) => !salaEmManutencao(s, dateStr))
  const alvo = toMin(inicio)
  const candidatos: string[] = []
  for (let m = 8 * 60; m + dur <= 21 * 60; m += 30) {
    const h = fromMin(m)
    if (h === inicio) continue
    if (conflita(ocs, { professorId }, h, dur)) continue
    if (!salasOk.some((s) => !conflita(ocs, { salaId: s.id }, h, dur))) continue
    candidatos.push(h)
  }
  return candidatos.sort((a, b) => Math.abs(toMin(a) - alvo) - Math.abs(toMin(b) - alvo)).slice(0, 3).sort()
}
