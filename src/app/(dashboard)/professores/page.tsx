import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { requireUser, STAFF } from "@/lib/session"
import { PageHeader, DataTable, EmptyRow } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ActionButton } from "@/components/form-bits"
import { alternarProfessor, excluirProfessor } from "./actions"
import { Flash } from "@/components/flash"

export default async function ProfessoresPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser(STAFF)
  const { ok } = await searchParams
  const professores = await prisma.professor.findMany({
    orderBy: { usuario: { nome: "asc" } },
    include: { usuario: true, turmas: { where: { ativo: true }, include: { instrumento: true } } },
  })
  return (
    <div className="space-y-6">
      <PageHeader title="Professores" description={`${professores.length} professor(es) cadastrado(s).`} action={{ href: "/professores/novo", label: "Novo professor" }} />
      <Flash msg={ok} />
      <DataTable head={["Professor", "Telefone", "Instrumentos", "Turmas ativas", "Status", ""]}>
        {professores.length === 0 && <EmptyRow colSpan={6}>Nenhum professor cadastrado.</EmptyRow>}
        {professores.map((p) => {
          const instrumentos = [...new Set(p.turmas.map((t) => t.instrumento.nome))]
          return (
            <tr key={p.id} className="hover:bg-muted/30">
              <td className="px-4 py-3">
                <p className="font-medium">{p.usuario.nome}</p>
                <p className="text-xs text-muted-foreground">{p.usuario.email}</p>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{p.telefone ?? "—"}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {instrumentos.length === 0 && <span className="text-muted-foreground">—</span>}
                  {instrumentos.map((i) => (
                    <Badge key={i} variant="secondary">{i}</Badge>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3">{p.turmas.length}</td>
              <td className="px-4 py-3">
                <Badge variant={p.usuario.ativo ? "default" : "outline"}>{p.usuario.ativo ? "Ativo" : "Inativo"}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-start justify-end gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/professores/editar?id=${p.id}`}>Editar</Link>
                  </Button>
                  <ActionButton action={alternarProfessor.bind(null, p.id)}>{p.usuario.ativo ? "Inativar" : "Reativar"}</ActionButton>
                  <ActionButton variant="ghost" action={excluirProfessor.bind(null, p.id)} confirmText={`Excluir o professor ${p.usuario.nome}? Esta operação é irreversível.`}>Excluir</ActionButton>
                </div>
              </td>
            </tr>
          )
        })}
      </DataTable>
    </div>
  )
}
