import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireUser, STAFF } from "@/lib/session"
import { fmtTime, fromMin, toInputDate, toMin } from "@/lib/dates"
import { PageHeader } from "@/components/page-header"
import { ReservaForm } from "../reserva-form"

export default async function ReagendarReservaPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requireUser(STAFF)
  const { id } = await searchParams
  if (!id) notFound()
  const r = await prisma.reserva.findUnique({ where: { id }, include: { sala: true } })
  if (!r || r.status !== "ATIVA") notFound()
  const inicio = fmtTime(r.data)
  return (
    <div className="space-y-6">
      <PageHeader title="Reagendar reserva" description={`Sala ${r.sala.nome}. Altere a data ou o horário.`} />
      <ReservaForm id={r.id} salas={[{ id: r.salaId, nome: r.sala.nome }]} defaults={{ salaId: r.salaId, data: toInputDate(r.data), inicio, fim: fromMin(toMin(inicio) + r.duracaoMin) }} />
    </div>
  )
}
