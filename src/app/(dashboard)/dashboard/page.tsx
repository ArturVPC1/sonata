import Link from "next/link"
import { Users, Music2, GraduationCap, CalendarDays, DoorOpen } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { requireUser, isStaff, ROLE_LABEL } from "@/lib/session"
import { todayStr, dayRange, diaSemanaOf, fmtTime, fmtLongDate, DIA_LABEL } from "@/lib/dates"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"

function Kpi({ titulo, valor, desc, icon: Icon }: { titulo: string; valor: number; desc: string; icon: typeof Users }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{titulo}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{valor}</div>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  const user = await requireUser()
  const hoje = todayStr()

  // Escopo conforme o perfil
  let turmaWhere: object = { ativo: true }
  let nomeAluno: string | undefined
  if (user.role === "PROFESSOR") {
    const prof = await prisma.professor.findUnique({ where: { usuarioId: user.id } })
    turmaWhere = { ativo: true, professorId: prof?.id ?? "__none__" }
  } else if (user.role === "ALUNO") {
    const al = await prisma.aluno.findUnique({ where: { usuarioId: user.id } })
    nomeAluno = al?.nome
    turmaWhere = { ativo: true, matriculas: { some: { alunoId: al?.id ?? "__none__", ativo: true } } }
  }

  const staff = isStaff(user.role)
  // Todas as consultas em paralelo (RNF003: o painel precisa carregar em até 3 s)
  const [aulasHoje, minhasTurmas, contagens] = await Promise.all([
    prisma.aula.findMany({
      where: { data: dayRange(hoje), turma: turmaWhere },
      include: { turma: { include: { instrumento: true, professor: { include: { usuario: true } }, sala: true } } },
      orderBy: { data: "asc" },
    }),
    prisma.turma.findMany({
      where: turmaWhere,
      include: { instrumento: true, sala: true, professor: { include: { usuario: true } }, _count: { select: { matriculas: { where: { ativo: true } } } } },
      orderBy: { nome: "asc" },
    }),
    staff
      ? Promise.all([
          prisma.aluno.count({ where: { ativo: true } }),
          prisma.professor.count({ where: { usuario: { ativo: true } } }),
          prisma.turma.count({ where: { ativo: true } }),
          prisma.sala.count({ where: { status: "DISPONIVEL" } }),
        ])
      : Promise.resolve(null),
  ])

  let kpis: React.ReactNode = null
  if (staff && contagens) {
    const [alunos, professores, turmas, salas] = contagens
    const salasOcupadas = new Set(aulasHoje.map((a) => a.turma.salaId).filter(Boolean)).size
    kpis = (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi titulo="Alunos ativos" valor={alunos} desc="cadastrados" icon={Users} />
        <Kpi titulo="Professores" valor={professores} desc="com acesso ativo" icon={GraduationCap} />
        <Kpi titulo="Turmas ativas" valor={turmas} desc="em andamento" icon={Music2} />
        <Kpi titulo="Aulas hoje" valor={aulasHoje.length} desc="agendadas" icon={CalendarDays} />
        <Kpi titulo="Salas livres hoje" valor={Math.max(salas - salasOcupadas, 0)} desc={`de ${salas} disponíveis`} icon={DoorOpen} />
      </div>
    )
  } else {
    kpis = (
      <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
        <Kpi titulo="Aulas hoje" valor={aulasHoje.length} desc="agendadas" icon={CalendarDays} />
        <Kpi titulo={user.role === "PROFESSOR" ? "Minhas turmas" : "Minhas turmas (matriculado)"} valor={minhasTurmas.length} desc="ativas" icon={Music2} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${(nomeAluno ?? user.name ?? "").split(" ")[0]}`}
        description={`${ROLE_LABEL[user.role]} · ${fmtLongDate(hoje)}`}
      />
      {kpis}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aulas de hoje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aulasHoje.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma aula hoje.</p>}
            {aulasHoje.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    <span className="tabular-nums">{fmtTime(a.data)}</span> · {a.turma.nome}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {a.turma.sala?.nome ?? "Sem sala"} · Prof. {a.turma.professor.usuario.nome}
                  </p>
                </div>
                <Badge variant={a.realizada ? "secondary" : "outline"}>{a.realizada ? "Realizada" : "Agendada"}</Badge>
              </div>
            ))}
            <Link href="/agenda" className="text-sm text-primary hover:underline inline-block pt-1">
              Abrir agenda →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{isStaff(user.role) ? "Turmas ativas" : "Minhas turmas"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {minhasTurmas.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma turma.</p>}
            {minhasTurmas.slice(0, 6).map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">{t.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {DIA_LABEL[t.diaSemana]} {t.horario} · {t.sala?.nome ?? "Sem sala"}
                  </p>
                </div>
                <Badge variant="outline">
                  {t._count.matriculas}/{t.vagas}
                </Badge>
              </div>
            ))}
            <Link href="/turmas" className="text-sm text-primary hover:underline inline-block pt-1">
              Ver todas →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
