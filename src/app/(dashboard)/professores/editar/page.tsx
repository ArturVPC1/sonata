import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireUser, STAFF } from "@/lib/session"
import { PageHeader } from "@/components/page-header"
import { ProfessorForm } from "../professor-form"

export default async function EditarProfessorPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requireUser(STAFF)
  const { id } = await searchParams
  if (!id) notFound()
  const p = await prisma.professor.findUnique({ where: { id }, include: { usuario: true } })
  if (!p) notFound()
  return (
    <div className="space-y-6">
      <PageHeader title={p.usuario.nome} description="Editar dados do professor." />
      <ProfessorForm id={p.id} defaults={{ nome: p.usuario.nome, email: p.usuario.email, telefone: p.telefone ?? "", bio: p.bio ?? "" }} />
    </div>
  )
}
