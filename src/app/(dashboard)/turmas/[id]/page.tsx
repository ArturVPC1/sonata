import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireUser, isStaff } from "@/lib/session"
import { fmtDateBR } from "@/lib/dates"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TurmaForm } from "../turma-form"
import { opcoesTurma } from "../form-data"

export default async function TurmaPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params
  const turma = await prisma.turma.findUnique({
    where: { id },
    include: { professor: true, matriculas: { where: { ativo: true }, include: { aluno: true }, orderBy: { aluno: { nome: "asc" } } } },
  })
  if (!turma) notFound()

  // Escopo: professor só vê as suas; aluno só as que cursa
  if (user.role === "PROFESSOR" && turma.professor.usuarioId !== user.id) notFound()
  if (user.role === "ALUNO" && !turma.matriculas.some((m) => m.aluno.usuarioId === user.id)) notFound()

  const staff = isStaff(user.role)
  const o = staff ? await opcoesTurma() : null
  const verAlunos = user.role !== "ALUNO"

  return (
    <div className="space-y-6">
      <PageHeader title={turma.nome} description={`${turma.matriculas.length}/${turma.vagas} vagas ocupadas`} />
      {verAlunos && (
        <Card>
          <CardHeader><CardTitle className="text-base">Alunos matriculados</CardTitle></CardHeader>
          <CardContent>
            {turma.matriculas.length === 0 && <p className="text-sm text-muted-foreground">Nenhum aluno matriculado.</p>}
            <ul className="divide-y">
              {turma.matriculas.map((m) => (
                <li key={m.id} className="flex justify-between py-2 text-sm">
                  <span className="font-medium">{m.aluno.nome}</span>
                  <span className="text-muted-foreground">desde {fmtDateBR(m.dataInicio)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {staff && o && (
        <Card>
          <CardHeader><CardTitle className="text-base">Dados da turma</CardTitle></CardHeader>
          <CardContent>
            <TurmaForm
              id={turma.id}
              {...o}
              defaults={{ nome: turma.nome, instrumentoId: turma.instrumentoId, professorId: turma.professorId, salaId: turma.salaId ?? "", diaSemana: turma.diaSemana, horario: turma.horario, duracaoMin: turma.duracaoMin, vagas: turma.vagas }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
