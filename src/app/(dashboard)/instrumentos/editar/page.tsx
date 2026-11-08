import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireUser, STAFF } from "@/lib/session"
import { PageHeader } from "@/components/page-header"
import { InstrumentoForm } from "../instrumento-form"

export default async function EditarInstrumentoPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requireUser(STAFF)
  const { id } = await searchParams
  if (!id) notFound()
  const i = await prisma.instrumento.findUnique({ where: { id } })
  if (!i) notFound()
  return (
    <div className="space-y-6">
      <PageHeader title={i.nome} description="Editar instrumento." />
      <InstrumentoForm id={i.id} nome={i.nome} />
    </div>
  )
}
