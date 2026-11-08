import { requireUser, STAFF } from "@/lib/session"
import { PageHeader } from "@/components/page-header"
import { SalaForm } from "../sala-form"

export default async function NovaSalaPage() {
  await requireUser(STAFF)
  return (
    <div className="space-y-6">
      <PageHeader title="Nova sala" description="Cadastre o espaço físico, sua capacidade e os recursos disponíveis." />
      <SalaForm id={null} />
    </div>
  )
}
