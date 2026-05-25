import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, Music2, GraduationCap, CalendarDays } from "lucide-react"

async function getResumo() {
  const [totalAlunos, totalProfessores, turmasAtivas, aulasHoje] =
    await Promise.all([
      prisma.aluno.count({ where: { ativo: true } }),
      prisma.professor.count(),
      prisma.turma.count({ where: { ativo: true } }),
      prisma.aula.count({
        where: {
          data: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ])

  return { totalAlunos, totalProfessores, turmasAtivas, aulasHoje }
}

export default async function DashboardPage() {
  const session = await auth()
  const resumo = await getResumo()

  const cards = [
    {
      titulo: "Alunos ativos",
      valor: resumo.totalAlunos,
      descricao: "matriculados",
      icon: Users,
    },
    {
      titulo: "Professores",
      valor: resumo.totalProfessores,
      descricao: "cadastrados",
      icon: GraduationCap,
    },
    {
      titulo: "Turmas ativas",
      valor: resumo.turmasAtivas,
      descricao: "em andamento",
      icon: Music2,
    },
    {
      titulo: "Aulas hoje",
      valor: resumo.aulasHoje,
      descricao: "agendadas",
      icon: CalendarDays,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo, {session?.user?.name?.split(" ")[0]}!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.titulo}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.titulo}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.valor}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {card.descricao}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
