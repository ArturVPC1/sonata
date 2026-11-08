import Link from "next/link"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireUser, isStaff } from "@/lib/session"
import { ageFrom, fmtDateBR } from "@/lib/dates"
import { PageHeader, DataTable, EmptyRow } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Flash } from "@/components/flash"

export default async function AlunosPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; ok?: string }> }) {
  const user = await requireUser(["ADMIN", "SECRETARIA", "PROFESSOR"])
  const { q = "", status = "ativo", ok } = await searchParams
  const staff = isStaff(user.role)

  const where: Prisma.AlunoWhereInput = {}
  if (status === "ativo") where.ativo = true
  if (status === "inativo") where.ativo = false
  if (q.trim()) where.OR = [{ nome: { contains: q.trim(), mode: "insensitive" } }, { email: { contains: q.trim(), mode: "insensitive" } }]
  if (user.role === "PROFESSOR") {
    const prof = await prisma.professor.findUnique({ where: { usuarioId: user.id } })
    where.matriculas = { some: { ativo: true, turma: { professorId: prof?.id ?? "__none__" } } }
  }

  const alunos = await prisma.aluno.findMany({
    where,
    orderBy: { nome: "asc" },
    include: { matriculas: { where: { ativo: true }, include: { turma: { select: { nome: true } } } } },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alunos"
        description={user.role === "PROFESSOR" ? "Alunos matriculados nas suas turmas." : `${alunos.length} aluno(s) encontrado(s).`}
        action={staff ? { href: "/alunos/novo", label: "Novo aluno" } : undefined}
      />
      <Flash msg={ok} />
      <form className="flex flex-wrap gap-2" role="search">
        <Input name="q" defaultValue={q} placeholder="Buscar por nome ou e-mail" className="max-w-xs" />
        <Select name="status" defaultValue={status} className="w-40">
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
          <option value="todos">Todos</option>
        </Select>
        <Button type="submit" variant="secondary">Filtrar</Button>
      </form>

      <DataTable head={["Aluno", "Contato", "Idade", "Turmas", "Status", ""]}>
        {alunos.length === 0 && <EmptyRow colSpan={6}>Nenhum aluno encontrado.</EmptyRow>}
        {alunos.map((a) => (
          <tr key={a.id} className="hover:bg-muted/30">
            <td className="px-4 py-3">
              <p className="font-medium">{a.nome}</p>
              <p className="text-xs text-muted-foreground">{a.email}</p>
            </td>
            <td className="px-4 py-3 text-muted-foreground">{a.telefone ?? "—"}</td>
            <td className="px-4 py-3 text-muted-foreground">
              {a.dataNasc ? `${ageFrom(a.dataNasc)} anos` : "—"}
              {a.dataNasc && <span className="block text-xs">{fmtDateBR(a.dataNasc)}</span>}
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-1">
                {a.matriculas.length === 0 && <span className="text-muted-foreground">—</span>}
                {a.matriculas.map((m) => (
                  <Badge key={m.id} variant="secondary">{m.turma.nome}</Badge>
                ))}
              </div>
            </td>
            <td className="px-4 py-3">
              <Badge variant={a.ativo ? "default" : "outline"}>{a.ativo ? "Ativo" : "Inativo"}</Badge>
            </td>
            <td className="px-4 py-3 text-right">
              {staff && (
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/alunos/editar?id=${a.id}`}>Abrir</Link>
                </Button>
              )}
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  )
}
