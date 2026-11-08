import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"
import { PageHeader } from "@/components/page-header"
import { SolicitacaoForm } from "../solicitacao-form"
import { addDays, fmtDateBR, fmtTime, todayStr } from "@/lib/dates"

export default async function NovaSolicitacaoPage() {
  const user = await requireUser(["ALUNO"])
  const aluno = await prisma.aluno.findUnique({
    where: { usuarioId: user.id },
    include: { matriculas: { where: { ativo: true }, include: { turma: { include: { professor: { include: { usuario: true } } } } } } },
  })
  const meus = new Map<string, string>()
  for (const m of aluno?.matriculas ?? []) meus.set(m.turma.professorId, m.turma.professor.usuario.nome)
  let professores = [...meus].map(([id, nome]) => ({ id, nome }))
  if (professores.length === 0) {
    const todos = await prisma.professor.findMany({ where: { usuario: { ativo: true } }, include: { usuario: true }, orderBy: { usuario: { nome: "asc" } } })
    professores = todos.map((p) => ({ id: p.id, nome: p.usuario.nome }))
  }
  const turmaIds = (aluno?.matriculas ?? []).map((m) => m.turmaId)
  const aulasPassadas = await prisma.aula.findMany({
    where: { turmaId: { in: turmaIds }, data: { gte: new Date(`${addDays(todayStr(), -30)}T00:00:00.000Z`), lt: new Date(`${todayStr()}T00:00:00.000Z`) } },
    include: { turma: true },
    orderBy: { data: "desc" },
  })
  const aulas = aulasPassadas.map((a) => ({ id: a.id, nome: `${fmtDateBR(a.data)} ${fmtTime(a.data)} — ${a.turma.nome}` }))
  return (
    <div className="space-y-6">
      <PageHeader title="Solicitar aula extra" description="Peça uma aula complementar ou a reposição de uma falta. O professor analisará o pedido." />
      <SolicitacaoForm professores={professores} aulas={aulas} semTelefone={!aluno?.telefone} />
    </div>
  )
}
