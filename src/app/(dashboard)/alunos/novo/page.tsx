import { requireUser, STAFF } from "@/lib/session"
import { PageHeader } from "@/components/page-header"
import { AlunoForm } from "../aluno-form"

export default async function NovoAlunoPage() {
  await requireUser(STAFF)
  return (
    <div className="space-y-6">
      <PageHeader title="Novo aluno" description="Cadastre os dados do aluno e, se quiser, o acesso ao sistema." />
      <AlunoForm id={null} />
    </div>
  )
}
