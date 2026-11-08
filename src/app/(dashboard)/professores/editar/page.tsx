import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireUser, STAFF } from "@/lib/session"
import { PageHeader } from "@/components/page-header"
import { ProfessorForm } from "../professor-form"
import { ActionButton } from "@/components/form-bits"
import { excluirProfessor } from "../actions"

export default async function EditarProfessorPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requireUser(STAFF)
  const { id } = await searchParams
  if (!id) notFound()
  const p = await prisma.professor.findUnique({ where: { id }, include: { usuario: true } })
  if (!p) notFound()
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title={p.usuario.nome} description="Editar dados do professor." />
        <ActionButton variant="destructive" action={excluirProfessor.bind(null, p.id)} confirmText={`Excluir o professor ${p.usuario.nome}? Esta operação é irreversível.`}>
          Excluir
        </ActionButton>
      </div>
      <ProfessorForm id={p.id} defaults={{ nome: p.usuario.nome, email: p.usuario.email, cpf: p.cpf ?? "", telefone: p.telefone ?? "", endereco: p.endereco ?? "", registroProfissional: p.registroProfissional ?? "", bio: p.bio ?? "" }} />
    </div>
  )
}
