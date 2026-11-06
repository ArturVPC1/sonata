/**
 * Datas do sistema.
 * As colunas DateTime do banco guardam "relógio de parede" de São Paulo sem fuso
 * (ex.: aula às 09:00 fica como 2026-11-30 09:00:00). Para não depender do fuso do
 * servidor (a Vercel roda em UTC), tudo aqui é calculado em America/Sao_Paulo e
 * tratado como UTC ao falar com o banco.
 */
const TZ = "America/Sao_Paulo"

export const DIAS_DB = ["DOMINGO", "SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"] as const
export type DiaSemanaKey = (typeof DIAS_DB)[number]

export const DIA_LABEL: Record<DiaSemanaKey, string> = {
  DOMINGO: "Domingo", SEGUNDA: "Segunda", TERCA: "Terça", QUARTA: "Quarta",
  QUINTA: "Quinta", SEXTA: "Sexta", SABADO: "Sábado",
}
export const DIAS_UTEIS_E_SABADO: DiaSemanaKey[] = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"]

function parts(d: Date) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  })
  const o: Record<string, string> = {}
  for (const p of f.formatToParts(d)) o[p.type] = p.value
  return o
}

/** Hoje em São Paulo, no formato yyyy-MM-dd. */
export function todayStr(now = new Date()): string {
  const p = parts(now)
  return `${p.year}-${p.month}-${p.day}`
}

/** Minutos desde 00:00 agora, em São Paulo. */
export function nowMinutes(now = new Date()): number {
  const p = parts(now)
  return Number(p.hour) * 60 + Number(p.minute)
}

export const isDateStr = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s)

/** Início e fim do dia (como UTC "relógio de parede"). */
export function dayRange(dateStr: string) {
  return { gte: new Date(`${dateStr}T00:00:00.000Z`), lte: new Date(`${dateStr}T23:59:59.999Z`) }
}

export function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export function diaSemanaOf(dateStr: string): DiaSemanaKey {
  return DIAS_DB[new Date(`${dateStr}T00:00:00.000Z`).getUTCDay()]!
}

/** Segunda-feira da semana da data. */
export function weekStart(dateStr: string): string {
  const dow = new Date(`${dateStr}T00:00:00.000Z`).getUTCDay() // 0=domingo
  return addDays(dateStr, dow === 0 ? -6 : 1 - dow)
}

/** Data + horário (HH:mm) -> Date para gravar no banco. */
export function toDbDateTime(dateStr: string, hhmm: string): Date {
  return new Date(`${dateStr}T${hhmm}:00.000Z`)
}

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export const fmtTime = (d: Date) => d.toISOString().slice(11, 16)
export const fmtDateBR = (d: Date) => {
  const s = d.toISOString().slice(0, 10).split("-")
  return `${s[2]}/${s[1]}/${s[0]}`
}
export const toInputDate = (d?: Date | null) => (d ? d.toISOString().slice(0, 10) : "")

export function fmtLongDate(dateStr: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" })
    .format(new Date(`${dateStr}T00:00:00.000Z`))
}

export function ageFrom(d: Date, now = new Date()): number {
  const t = todayStr(now).split("-").map(Number)
  let age = t[0]! - d.getUTCFullYear()
  if (t[1]! < d.getUTCMonth() + 1 || (t[1] === d.getUTCMonth() + 1 && t[2]! < d.getUTCDate())) age--
  return age
}

/** Dois intervalos [início, início+duração) se sobrepõem? */
export function overlaps(startA: string, durA: number, startB: string, durB: number) {
  const a = toMin(startA), b = toMin(startB)
  return a < b + durB && b < a + durA
}
