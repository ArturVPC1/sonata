import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireUser, STAFF } from "@/lib/session"
import { toInputDate } from "@/lib/dates"
import { PageHeader } from "@/components/page-header"
import { SalaForm } from "../sala-form"

export default async function EditarSalaPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requireUser(STAFF)
  const { id } = await searchParams
  if (!id) notFound()
  const s = await prisma.sala.findUnique({ where: { id } })
  if (!s) notFound()
  return (
    <div className="space-y-6">
      <PageHeader title={s.nome} description="Editar dados da sala e indicar manutenção." />
      <SalaForm id={s.id} defaults={{ nome: s.nome, capacidade: s.capacidade, recursos: s.recursos ?? "", status: s.status, manutencaoAte: toInputDate(s.manutencaoAte) }} />
    </div>
  )
}
