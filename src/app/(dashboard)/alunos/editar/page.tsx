import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireUser, STAFF } from "@/lib/session"
import { toInputDate, DIA_LABEL } from "@/lib/dates"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActionButton } from "@/components/form-bits"
import { AlunoForm } from "../aluno-form"
import { MatriculaPanel } from "./matricula-panel"
import { alternarAluno } from "../actions"

export default async function AlunoPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requireUser(STAFF)
  const { id } = await searchParams
  if (!id) notFound()
  const aluno = await prisma.aluno.findUnique({
    where: { id },
    include: { matriculas: { where: { ativo: true }, include: { turma: { include: { sala: true } } } } },
  })
  if (!aluno) notFound()

  const turmas = await prisma.turma.findMany({
    where: { ativo: true },
    include: { _count: { select: { matriculas: { where: { ativo: true } } } } },
    orderBy: { nome: "asc" },
  })
  const jaIds = new Set(aluno.matriculas.map((m) => m.turmaId))
  const opcoes = turmas
    .filter((t) => !jaIds.has(t.id))
    .map((t) => {
      const livres = t.vagas - t._count.matriculas
      return { id: t.id, label: `${t.nome} · ${DIA_LABEL[t.diaSemana]} ${t.horario} · ${livres > 0 ? `${livres} vaga(s)` : "lotada"}` }
    })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title={aluno.nome} description={aluno.email} />
        <div className="flex items-center gap-3">
          <Badge variant={aluno.ativo ? "default" : "outline"}>{aluno.ativo ? "Ativo" : "Inativo"}</Badge>
          <ActionButton
            action={alternarAluno.bind(null, aluno.id)}
            confirmText={aluno.ativo ? "Inativar o aluno? As matrículas ativas serão encerradas e o acesso bloqueado." : undefined}
          >
            {aluno.ativo ? "Inativar" : "Reativar"}
          </ActionButton>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Matrículas</CardTitle>
        </CardHeader>
        <CardContent>
          <MatriculaPanel
            alunoId={aluno.id}
            podeMatricular={aluno.ativo}
            opcoes={opcoes}
            atuais={aluno.matriculas.map((m) => ({
              turmaId: m.turmaId,
              nome: m.turma.nome,
              detalhe: `${DIA_LABEL[m.turma.diaSemana]} ${m.turma.horario} · ${m.turma.sala?.nome ?? "Sem sala"}`,
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados cadastrais</CardTitle>
        </CardHeader>
        <CardContent>
          <AlunoForm
            id={aluno.id}
            defaults={{
              nome: aluno.nome, email: aluno.email, telefone: aluno.telefone ?? "", dataNasc: toInputDate(aluno.dataNasc),
              cpf: aluno.cpf ?? "", responsavelNome: aluno.responsavelNome ?? "", responsavelTelefone: aluno.responsavelTelefone ?? "",
              observacoes: aluno.observacoes ?? "", temAcesso: !!aluno.usuarioId,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
