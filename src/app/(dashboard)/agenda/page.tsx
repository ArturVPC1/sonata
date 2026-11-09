import Link from "next/link"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireUser, isStaff } from "@/lib/session"
import { todayStr, isDateStr, dayRange, addDays, weekStart, diaSemanaOf, fmtTime, fmtLongDate, fromMin, toMin, DIA_LABEL, DIAS_UTEIS_E_SABADO } from "@/lib/dates"
import { salaEmManutencao } from "@/lib/conflitos"
import { TIPO_RESERVA_LABEL } from "@/lib/validations/reserva"
import { PageHeader, DataTable, EmptyRow } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StaffTools } from "./staff-tools"
import { AulaActions } from "./aula-actions"
import { cn } from "@/lib/utils"

type Item = {
  key: string
  dia: string
  inicio: string
  fim: string
  titulo: string
  detalhe: string
  salaId: string | null
  sala: string
  responsavel: string
  status: string
  aulaId?: string
  obs?: string | null
  meu?: boolean
}

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ data?: string; vista?: string }> }) {
  const user = await requireUser()
  const sp = await searchParams
  const hoje = todayStr()
  const data = isDateStr(sp.data) ? sp.data : hoje
  const vista = sp.vista === "semana" ? "semana" : "dia"
  const staff = isStaff(user.role)

  // Escopo do usuário
  let turmaWhere: Prisma.TurmaWhereInput = {}
  let reservaWhere: Prisma.ReservaWhereInput = {}
  if (user.role === "PROFESSOR") {
    const p = await prisma.professor.findUnique({ where: { usuarioId: user.id } })
    turmaWhere = { professorId: p?.id ?? "__none__" }
    reservaWhere = { OR: [{ professorId: p?.id ?? "__none__" }, { criadoPorId: user.id }] }
  } else if (user.role === "ALUNO") {
    const a = await prisma.aluno.findUnique({ where: { usuarioId: user.id } })
    turmaWhere = { matriculas: { some: { alunoId: a?.id ?? "__none__", ativo: true } } }
    reservaWhere = { solicitacao: { alunoId: a?.id ?? "__none__" } }
  }

  const seg = weekStart(data)
  const semana = DIAS_UTEIS_E_SABADO.map((_, i) => addDays(seg, i))
  const faixa = { gte: dayRange(seg).gte, lte: dayRange(addDays(seg, 6)).lte }

  const [aulasSemana, reservasSemana, salas, turmasAtivas, aulasTodasDia, reservasTodasDia] = await Promise.all([
    prisma.aula.findMany({
      where: { data: faixa, turma: turmaWhere },
      include: { turma: { include: { instrumento: true, sala: true, professor: { include: { usuario: true } } } } },
      orderBy: { data: "asc" },
    }),
    prisma.reserva.findMany({ where: { data: faixa, status: "ATIVA", ...reservaWhere }, include: { sala: true, professor: { include: { usuario: true } }, criadoPor: true }, orderBy: { data: "asc" } }),
    prisma.sala.findMany({ orderBy: { nome: "asc" } }),
    staff ? prisma.turma.findMany({ where: { ativo: true, diaSemana: diaSemanaOf(data) }, orderBy: { horario: "asc" } }) : Promise.resolve([]),
    prisma.aula.findMany({ where: { data: dayRange(data) }, include: { turma: true } }),
    prisma.reserva.findMany({ where: { data: dayRange(data), status: "ATIVA" } }),
  ])

  const diaKey = (d: Date) => d.toISOString().slice(0, 10)
  const itens: Item[] = [
    ...aulasSemana.map((a) => ({
      key: `a-${a.id}`,
      dia: diaKey(a.data),
      inicio: fmtTime(a.data),
      fim: fromMin(toMin(fmtTime(a.data)) + a.turma.duracaoMin),
      titulo: a.turma.nome,
      detalhe: `${a.turma.instrumento.nome} · ${a.turma.duracaoMin} min`,
      salaId: a.turma.salaId,
      sala: a.turma.sala?.nome ?? "—",
      responsavel: a.turma.professor.usuario.nome,
      status: a.realizada ? "Realizada" : "Agendada",
      aulaId: a.id,
      obs: a.observacao,
      meu: user.role === "PROFESSOR" && a.turma.professor.usuarioId === user.id,
    })),
    ...reservasSemana.map((r) => ({
      key: `r-${r.id}`,
      dia: diaKey(r.data),
      inicio: fmtTime(r.data),
      fim: fromMin(toMin(fmtTime(r.data)) + r.duracaoMin),
      titulo: TIPO_RESERVA_LABEL[r.tipo],
      detalhe: r.observacao ?? "Reserva de sala",
      salaId: r.salaId,
      sala: r.sala.nome,
      responsavel: r.professor?.usuario.nome ?? r.criadoPor.nome,
      status: "Reserva",
    })),
  ].sort((a, b) => a.dia.localeCompare(b.dia) || a.inicio.localeCompare(b.inicio))

  const contagem = new Map<string, number>()
  for (const i of itens) contagem.set(i.dia, (contagem.get(i.dia) ?? 0) + 1)
  const itensDia = itens.filter((i) => i.dia === data)

  // Ocupação das salas no dia (visão da escola inteira)
  const ocupacaoSala = new Map<string, string[]>()
  const add = (salaId: string | null, h: string) => salaId && ocupacaoSala.set(salaId, [...(ocupacaoSala.get(salaId) ?? []), h])
  for (const a of aulasTodasDia) add(a.turma.salaId, fmtTime(a.data))
  for (const r of reservasTodasDia) add(r.salaId, fmtTime(r.data))
  const livres = salas.filter((s) => !salaEmManutencao(s, data) && !ocupacaoSala.has(s.id)).length

  const nav = (d: string) => `/agenda?data=${d}${vista === "semana" ? "&vista=semana" : ""}`

  return (
    <div className="space-y-6">
      <PageHeader title="Agenda" description={fmtLongDate(data)} action={user.role !== "ALUNO" ? { href: "/reservas/nova", label: "Nova reserva" } : undefined} />

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm"><Link href={nav(addDays(data, -7))}>← Semana anterior</Link></Button>
        <Button asChild variant="outline" size="sm"><Link href={nav(hoje)}>Hoje</Link></Button>
        <Button asChild variant="outline" size="sm"><Link href={nav(addDays(data, 7))}>Próxima semana →</Link></Button>
        <span className="mx-2 hidden sm:inline text-muted-foreground">|</span>
        <Button asChild variant={vista === "dia" ? "default" : "outline"} size="sm"><Link href={`/agenda?data=${data}`}>Dia</Link></Button>
        <Button asChild variant={vista === "semana" ? "default" : "outline"} size="sm"><Link href={`/agenda?data=${data}&vista=semana`}>Semana</Link></Button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Semana">
        {semana.map((d, i) => (
          <Link
            key={d}
            href={nav(d)}
            className={cn(
              "rounded-md border px-3 py-2 text-center text-sm transition-colors",
              d === data ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted",
              d === hoje && d !== data && "border-primary"
            )}
          >
            <span className="block text-xs opacity-80">{DIA_LABEL[DIAS_UTEIS_E_SABADO[i]!]}</span>
            <span className="block font-semibold">{d.slice(8, 10)}/{d.slice(5, 7)}</span>
            <span className="block text-xs opacity-80">{contagem.get(d) ?? 0} item(ns)</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-4">
          {staff && vista === "dia" && <StaffTools data={data} turmas={turmasAtivas.map((t) => ({ id: t.id, label: `${t.horario} · ${t.nome}` }))} />}

          {vista === "dia" ? (
            <DataTable head={["Horário", "Atividade", "Responsável", "Sala", "Status", ""]}>
              {itensDia.length === 0 && <EmptyRow colSpan={6}>Nenhuma atividade neste dia.</EmptyRow>}
              {itensDia.map((i) => (
                <tr key={i.key} className="hover:bg-muted/30">
                  <td className="px-4 py-3 tabular-nums font-medium whitespace-nowrap">{i.inicio} – {i.fim}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{i.titulo}</p>
                    <p className="text-xs text-muted-foreground">{i.detalhe}</p>
                    {i.obs && <p className="mt-1 text-xs italic text-muted-foreground">Obs.: {i.obs}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{i.responsavel}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.sala}</td>
                  <td className="px-4 py-3"><Badge variant={i.status === "Agendada" || i.status === "Reserva" ? "outline" : "secondary"}>{i.status}</Badge></td>
                  <td className="px-4 py-3">{i.aulaId && <AulaActions id={i.aulaId} realizada={i.status === "Realizada"} podeMarcar={staff || !!i.meu} podeExcluir={staff} />}</td>
                </tr>
              ))}
            </DataTable>
          ) : (
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6" aria-label="Grade semanal">
              {semana.map((d, idx) => {
                const doDia = itens.filter((i) => i.dia === d)
                return (
                  <div key={d} className={cn("rounded-lg border bg-card p-3 min-h-32", d === hoje && "border-primary")}>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">{DIA_LABEL[DIAS_UTEIS_E_SABADO[idx]!]} {d.slice(8, 10)}/{d.slice(5, 7)}</p>
                    <div className="mt-2 space-y-2">
                      {doDia.length === 0 && <p className="text-xs text-muted-foreground">Sem atividades.</p>}
                      {doDia.map((i) => (
                        <div key={i.key} className={cn("rounded-md border-l-4 bg-muted/40 px-2 py-1.5 text-xs", i.status === "Reserva" ? "border-amber-500" : "border-primary")}>
                          <p className="font-semibold tabular-nums">{i.inicio}–{i.fim}</p>
                          <p className="font-medium">{i.titulo}</p>
                          <p className="text-muted-foreground">{i.sala}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <Card className="h-fit min-w-0">
          <CardHeader>
            <CardTitle className="text-base">Salas no dia</CardTitle>
            <p className="text-xs text-muted-foreground">{ocupacaoSala.size} ocupada(s) · {livres} livre(s)</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {salas.map((s) => {
              const horas = ocupacaoSala.get(s.id) ?? []
              const estado = salaEmManutencao(s, data) ? "Manutenção" : horas.length > 0 ? "Ocupada" : "Livre"
              return (
                <div key={s.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{s.nome}</p>
                    {horas.length > 0 && <p className="text-xs text-muted-foreground tabular-nums">{[...horas].sort().join(", ")}</p>}
                  </div>
                  <Badge variant={estado === "Livre" ? "secondary" : estado === "Manutenção" ? "destructive" : "default"}>{estado}</Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
