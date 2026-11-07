import { requireUser, STAFF } from "@/lib/session"
import { PageHeader } from "@/components/page-header"
import { ProfessorForm } from "../professor-form"

export default async function NovoProfessorPage() {
  await requireUser(STAFF)
  return (
    <div className="space-y-6">
      <PageHeader title="Novo professor" description="Cria também o login do professor." />
      <ProfessorForm id={null} />
    </div>
  )
}
