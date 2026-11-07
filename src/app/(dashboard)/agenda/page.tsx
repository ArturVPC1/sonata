import Link from "next/link"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireUser, isStaff } from "@/lib/session"
import { todayStr, isDateStr, dayRange, addDays, weekStart, diaSemanaOf, fmtTime, fmtLongDate, DIA_LABEL, DIAS_UTEIS_E_SABADO } from "@/lib/dates"
import { PageHeader, DataTable, EmptyRow } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StaffTools } from "./staff-tools"
import { AulaActions } from "./aula-actions"
import { cn } from "@/lib/utils"

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ data?: string }> }) {
  const user = await requireUser()
  const sp = await searchParams
  const hoje = todayStr()
  const data = isDateStr(sp.data) ? sp.data : hoje
  const staff = isStaff(user.role)

  let turmaWhere: Prisma.TurmaWhereInput = {}
  if (user.role === "PROFESSOR") {
    const p = await prisma.professor.findUnique({ where: { usuarioId: user.id } })
    turmaWhere = { professorId: p?.id ?? "__none__" }
  } else if (user.role === "ALUNO") {
    const a = await prisma.aluno.findUnique({ where: { usuarioId: user.id } })
    turmaWhere = { matriculas: { some: { alunoId: a?.id ?? "__none__", ativo: true } } }
  }

  const seg = weekStart(data)
  const semana = DIAS_UTEIS_E_SABADO.map((_, i) => addDays(seg, i))

  const [aulasSemana, salas, turmasAtivas] = await Promise.all([
    prisma.aula.findMany({
      where: { data: { gte: dayRange(seg).gte, lte: dayRange(addDays(seg, 6)).lte }, turma: turmaWhere },
      include: { turma: { include: { instrumento: true, sala: true, professor: { include: { usuario: true } } } } },
      orderBy: { data: "asc" },
    }),
    prisma.sala.findMany({ orderBy: { nome: "asc" } }),
    staff ? prisma.turma.findMany({ where: { ativo: true, diaSemana: diaSemanaOf(data) }, orderBy: { horario: "asc" } }) : Promise.resolve([]),
  ])

  const diaKey = (d: Date) => d.toISOString().slice(0, 10)
  const contagem = new Map<string, number>()
  for (const a of aulasSemana) contagem.set(diaKey(a.data), (contagem.get(diaKey(a.data)) ?? 0) + 1)
  const aulasDia = aulasSemana.filter((a) => diaKey(a.data) === data)

  // Salas ocupadas/livres no dia (todas as aulas do dia, independentemente do perfil)
  const todasDia = staff
    ? aulasDia
    : await prisma.aula.findMany({ where: { data: dayRange(data) }, include: { turma: true } })
  const ocupadas = new Set(todasDia.map((a) => a.turma.salaId).filter(Boolean) as string[])
  const livres = salas.filter((s) => s.status === "DISPONIVEL" && !ocupadas.has(s.id)).length

  const nav = (d: string) => `/agenda?data=${d}`

  return (
    <div className="space-y-6">
      <PageHeader title="Agenda" description={fmtLongDate(data)} />

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm"><Link href={nav(addDays(data, -7))}>← Semana anterior</Link></Button>
        <Button asChild variant="outline" size="sm"><Link href={nav(hoje)}>Hoje</Link></Button>
        <Button asChild variant="outline" size="sm"><Link href={nav(addDays(data, 7))}>Próxima semana →</Link></Button>
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
            <span className="block text-xs opacity-80">{contagem.get(d) ?? 0} aula(s)</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          {staff && <StaffTools data={data} turmas={turmasAtivas.map((t) => ({ id: t.id, label: `${t.horario} · ${t.nome}` }))} />}
          <DataTable head={["Horário", "Turma", "Professor", "Sala", "Status", ""]}>
            {aulasDia.length === 0 && <EmptyRow colSpan={6}>Nenhuma aula neste dia.</EmptyRow>}
            {aulasDia.map((a) => {
              const meu = user.role === "PROFESSOR" && a.turma.professor.usuarioId === user.id
              return (
                <tr key={a.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 tabular-nums font-medium">{fmtTime(a.data)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{a.turma.nome}</p>
                    <p className="text-xs text-muted-foreground">{a.turma.instrumento.nome} · {a.turma.duracaoMin} min</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.turma.professor.usuario.nome}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.turma.sala?.nome ?? "—"}</td>
                  <td className="px-4 py-3"><Badge variant={a.realizada ? "secondary" : "outline"}>{a.realizada ? "Realizada" : "Agendada"}</Badge></td>
                  <td className="px-4 py-3"><AulaActions id={a.id} realizada={a.realizada} podeMarcar={staff || meu} podeExcluir={staff} /></td>
                </tr>
              )
            })}
          </DataTable>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Salas no dia</CardTitle>
            <p className="text-xs text-muted-foreground">{ocupadas.size} ocupada(s) · {livres} livre(s)</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {salas.map((s) => {
              const aulaSala = todasDia.filter((a) => a.turma.salaId === s.id)
              const estado = s.status === "MANUTENCAO" ? "Manutenção" : aulaSala.length > 0 ? "Ocupada" : "Livre"
              return (
                <div key={s.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{s.nome}</p>
                    {aulaSala.length > 0 && <p className="text-xs text-muted-foreground tabular-nums">{aulaSala.map((a) => fmtTime(a.data)).join(", ")}</p>}
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
