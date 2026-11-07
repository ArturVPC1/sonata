import { requireUser, STAFF } from "@/lib/session"
import { PageHeader } from "@/components/page-header"
import { TurmaForm } from "../turma-form"
import { opcoesTurma } from "../form-data"

export default async function NovaTurmaPage() {
  await requireUser(STAFF)
  const o = await opcoesTurma()
  return (
    <div className="space-y-6">
      <PageHeader title="Nova turma" description="O sistema impede conflitos de horário de professor e sala." />
      <TurmaForm id={null} {...o} />
    </div>
  )
}
