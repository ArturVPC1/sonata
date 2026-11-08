import Link from "next/link"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireUser, isStaff } from "@/lib/session"
import { DIA_LABEL } from "@/lib/dates"
import { PageHeader, DataTable, EmptyRow } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ActionButton } from "@/components/form-bits"
import { alternarTurma } from "./actions"
import { Flash } from "@/components/flash"

export default async function TurmasPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const user = await requireUser()
  const { ok } = await searchParams
  const staff = isStaff(user.role)
  const where: Prisma.TurmaWhereInput = {}
  if (user.role === "PROFESSOR") {
    const p = await prisma.professor.findUnique({ where: { usuarioId: user.id } })
    where.professorId = p?.id ?? "__none__"
  } else if (user.role === "ALUNO") {
    const a = await prisma.aluno.findUnique({ where: { usuarioId: user.id } })
    where.ativo = true
    where.matriculas = { some: { alunoId: a?.id ?? "__none__", ativo: true } }
  }
  const turmas = await prisma.turma.findMany({
    where,
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
    include: { instrumento: true, sala: true, professor: { include: { usuario: true } }, _count: { select: { matriculas: { where: { ativo: true } } } } },
  })
  return (
    <div className="space-y-6">
      <PageHeader title="Turmas" description={`${turmas.length} turma(s).`} action={staff ? { href: "/turmas/nova", label: "Nova turma" } : undefined} />
      <Flash msg={ok} />
      <DataTable head={["Turma", "Professor", "Horário", "Sala", "Vagas", "Status", ""]}>
        {turmas.length === 0 && <EmptyRow colSpan={7}>Nenhuma turma encontrada.</EmptyRow>}
        {turmas.map((t) => (
          <tr key={t.id} className="hover:bg-muted/30">
            <td className="px-4 py-3">
              <p className="font-medium">{t.nome}</p>
              <p className="text-xs text-muted-foreground">{t.instrumento.nome}</p>
            </td>
            <td className="px-4 py-3 text-muted-foreground">{t.professor.usuario.nome}</td>
            <td className="px-4 py-3">
              {DIA_LABEL[t.diaSemana]} <span className="tabular-nums">{t.horario}</span>
              <span className="block text-xs text-muted-foreground">{t.duracaoMin} min</span>
            </td>
            <td className="px-4 py-3 text-muted-foreground">{t.sala?.nome ?? "—"}</td>
            <td className="px-4 py-3 tabular-nums">{t._count.matriculas}/{t.vagas}</td>
            <td className="px-4 py-3"><Badge variant={t.ativo ? "default" : "outline"}>{t.ativo ? "Ativa" : "Inativa"}</Badge></td>
            <td className="px-4 py-3">
              <div className="flex items-start justify-end gap-2">
                <Button asChild variant="ghost" size="sm"><Link href={`/turmas/detalhe?id=${t.id}`}>Abrir</Link></Button>
                {staff && <ActionButton action={alternarTurma.bind(null, t.id)}>{t.ativo ? "Inativar" : "Reativar"}</ActionButton>}
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  )
}
