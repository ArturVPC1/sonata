import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { requireUser, STAFF } from "@/lib/session"
import { PageHeader, DataTable, EmptyRow } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { ActionButton } from "@/components/form-bits"
import { Flash } from "@/components/flash"
import { InstrumentoForm } from "./instrumento-form"
import { excluirInstrumento } from "./actions"

export default async function InstrumentosPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser(STAFF)
  const { ok } = await searchParams
  const instrumentos = await prisma.instrumento.findMany({ orderBy: { nome: "asc" }, include: { _count: { select: { turmas: true } } } })
  return (
    <div className="space-y-6">
      <PageHeader title="Instrumentos" description="Instrumentos oferecidos pela escola." />
      <Flash msg={ok} />
      <InstrumentoForm id={null} compact />
      <DataTable head={["Instrumento", "Turmas", ""]}>
        {instrumentos.length === 0 && <EmptyRow colSpan={3}>Nenhum instrumento cadastrado.</EmptyRow>}
        {instrumentos.map((i) => (
          <tr key={i.id} className="hover:bg-muted/30">
            <td className="px-4 py-3 font-medium">{i.nome}</td>
            <td className="px-4 py-3">{i._count.turmas}</td>
            <td className="px-4 py-3">
              <div className="flex items-start justify-end gap-2">
                <Button asChild variant="ghost" size="sm"><Link href={`/instrumentos/editar?id=${i.id}`}>Editar</Link></Button>
                <ActionButton variant="ghost" action={excluirInstrumento.bind(null, i.id)} confirmText={`Excluir o instrumento ${i.nome}?`}>Excluir</ActionButton>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  )
}
