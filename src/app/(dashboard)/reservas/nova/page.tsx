import { prisma } from "@/lib/prisma"
import { requireUser, isStaff } from "@/lib/session"
import { PageHeader } from "@/components/page-header"
import { ReservaForm } from "../reserva-form"

export default async function NovaReservaPage() {
  const user = await requireUser(["ADMIN", "SECRETARIA", "PROFESSOR"])
  const [salas, profs] = await Promise.all([
    prisma.sala.findMany({ orderBy: { nome: "asc" } }),
    isStaff(user.role) ? prisma.professor.findMany({ where: { usuario: { ativo: true } }, include: { usuario: true }, orderBy: { usuario: { nome: "asc" } } }) : Promise.resolve([]),
  ])
  return (
    <div className="space-y-6">
      <PageHeader title="Nova reserva" description="Reserve uma sala para aula ou ensaio. O sistema verifica conflitos de horário." />
      <ReservaForm id={null} salas={salas.map((s) => ({ id: s.id, nome: s.status === "MANUTENCAO" ? `${s.nome} (manutenção)` : s.nome }))} professores={isStaff(user.role) ? profs.map((p) => ({ id: p.id, nome: p.usuario.nome })) : undefined} />
    </div>
  )
}
