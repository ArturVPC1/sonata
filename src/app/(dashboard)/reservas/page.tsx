import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { requireUser, isStaff } from "@/lib/session"
import { fmtDateBR, fmtTime, fromMin, toMin, todayStr } from "@/lib/dates"
import { PageHeader, DataTable, EmptyRow } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ActionButton } from "@/components/form-bits"
import { Flash } from "@/components/flash"
import { cancelarReserva } from "./actions"
import { TIPO_RESERVA_LABEL } from "@/lib/validations/reserva"

export default async function ReservasPage({ searchParams }: { searchParams: Promise<{ ok?: string; historico?: string }> }) {
  const user = await requireUser(["ADMIN", "SECRETARIA", "PROFESSOR"])
  const { ok, historico } = await searchParams
  const staff = isStaff(user.role)
  const hoje = new Date(`${todayStr()}T00:00:00.000Z`)
  const reservas = await prisma.reserva.findMany({
    where: { ...(staff ? {} : { criadoPorId: user.id }), ...(historico ? {} : { data: { gte: hoje }, status: "ATIVA" }) },
    orderBy: { data: historico ? "desc" : "asc" },
    include: { sala: true, criadoPor: true, professor: { include: { usuario: true } } },
    take: 100,
  })
  return (
    <div className="space-y-6">
      <PageHeader title="Reservas" description={historico ? "Histórico de reservas." : "Reservas ativas a partir de hoje."} action={{ href: "/reservas/nova", label: "Nova reserva" }} />
      <Flash msg={ok} />
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href={historico ? "/reservas" : "/reservas?historico=1"}>{historico ? "Ver ativas" : "Ver histórico"}</Link>
        </Button>
      </div>
      <DataTable head={["Data", "Horário", "Sala", "Finalidade", "Responsável", "Situação", ""]}>
        {reservas.length === 0 && <EmptyRow colSpan={7}>Nenhuma reserva encontrada.</EmptyRow>}
        {reservas.map((r) => {
          const ini = fmtTime(r.data)
          return (
            <tr key={r.id} className="hover:bg-muted/30">
              <td className="px-4 py-3">{fmtDateBR(r.data)}</td>
              <td className="px-4 py-3 tabular-nums">{ini} – {fromMin(toMin(ini) + r.duracaoMin)}</td>
              <td className="px-4 py-3 font-medium">{r.sala.nome}</td>
              <td className="px-4 py-3">
                {TIPO_RESERVA_LABEL[r.tipo]}
                {r.observacao && <span className="block text-xs text-muted-foreground">{r.observacao}</span>}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{r.professor?.usuario.nome ?? r.criadoPor.nome}</td>
              <td className="px-4 py-3"><Badge variant={r.status === "ATIVA" ? "default" : "outline"}>{r.status === "ATIVA" ? "Ativa" : "Cancelada"}</Badge></td>
              <td className="px-4 py-3">
                {r.status === "ATIVA" && (
                  <div className="flex items-start justify-end gap-2">
                    {staff && <Button asChild variant="ghost" size="sm"><Link href={`/reservas/editar?id=${r.id}`}>Reagendar</Link></Button>}
                    <ActionButton action={cancelarReserva.bind(null, r.id)} confirmText="Cancelar esta reserva? O horário ficará livre para novos agendamentos.">Cancelar</ActionButton>
                  </div>
                )}
              </td>
            </tr>
          )
        })}
      </DataTable>
    </div>
  )
}
