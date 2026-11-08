import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { requireUser, STAFF } from "@/lib/session"
import { fmtDateBR } from "@/lib/dates"
import { PageHeader, DataTable, EmptyRow } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ActionButton } from "@/components/form-bits"
import { Flash } from "@/components/flash"
import { excluirSala } from "./actions"

export default async function SalasPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser(STAFF)
  const { ok } = await searchParams
  const salas = await prisma.sala.findMany({ orderBy: { nome: "asc" }, include: { _count: { select: { turmas: { where: { ativo: true } } } } } })
  return (
    <div className="space-y-6">
      <PageHeader title="Salas" description={`${salas.length} sala(s) cadastrada(s).`} action={{ href: "/salas/nova", label: "Nova sala" }} />
      <Flash msg={ok} />
      <DataTable head={["Sala", "Capacidade", "Recursos", "Turmas", "Situação", ""]}>
        {salas.length === 0 && <EmptyRow colSpan={6}>Nenhuma sala cadastrada.</EmptyRow>}
        {salas.map((s) => (
          <tr key={s.id} className="hover:bg-muted/30">
            <td className="px-4 py-3 font-medium">{s.nome}</td>
            <td className="px-4 py-3">{s.capacidade}</td>
            <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{s.recursos ?? "—"}</td>
            <td className="px-4 py-3">{s._count.turmas}</td>
            <td className="px-4 py-3">
              {s.status === "MANUTENCAO" ? (
                <Badge variant="destructive">Manutenção{s.manutencaoAte ? ` até ${fmtDateBR(s.manutencaoAte)}` : ""}</Badge>
              ) : (
                <Badge variant="secondary">Disponível</Badge>
              )}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-start justify-end gap-2">
                <Button asChild variant="ghost" size="sm"><Link href={`/salas/editar?id=${s.id}`}>Editar</Link></Button>
                <ActionButton variant="ghost" action={excluirSala.bind(null, s.id)} confirmText={`Excluir a sala ${s.nome}? Esta operação é irreversível.`}>Excluir</ActionButton>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  )
}
