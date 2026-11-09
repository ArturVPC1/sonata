import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { requireUser, isStaff } from "@/lib/session"
import { fmtDateBR, fmtTime } from "@/lib/dates"
import { salaEmManutencao } from "@/lib/conflitos"
import { PageHeader, DataTable, EmptyRow } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Flash } from "@/components/flash"
import { DecisaoPanel } from "./decisao-panel"
import { LIMITE_PENDENTES } from "@/lib/validations/reserva"

const STATUS = { PENDENTE: "Pendente", APROVADA: "Aprovada", REJEITADA: "Rejeitada" } as const

export default async function SolicitacoesPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const user = await requireUser()
  const { ok } = await searchParams
  const staff = isStaff(user.role)
  let where = {}
  if (user.role === "ALUNO") {
    const a = await prisma.aluno.findUnique({ where: { usuarioId: user.id } })
    where = { alunoId: a?.id ?? "__none__" }
  } else if (user.role === "PROFESSOR") {
    const p = await prisma.professor.findUnique({ where: { usuarioId: user.id } })
    where = { professorId: p?.id ?? "__none__" }
  }
  const [lista, salas] = await Promise.all([
    prisma.solicitacaoAula.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { aluno: true, professor: { include: { usuario: true } }, reserva: { include: { sala: true } } },
      take: 100,
    }),
    user.role === "ALUNO" ? Promise.resolve([]) : prisma.sala.findMany({ orderBy: { nome: "asc" } }),
  ])
  const pendentesAluno = user.role === "ALUNO" ? lista.filter((s) => s.status === "PENDENTE").length : 0
  return (
    <div className="space-y-6">
      <PageHeader
        title={user.role === "ALUNO" ? "Aulas extras" : "Solicitações de aula"}
        description={user.role === "ALUNO" ? `Pendentes: ${pendentesAluno} de ${LIMITE_PENDENTES} permitidas.` : "Aprove ou rejeite as solicitações de aula extra e reposição."}
        action={user.role === "ALUNO" ? { href: "/solicitacoes/nova", label: "Solicitar aula extra" } : undefined}
      />
      <Flash msg={ok} />
      <DataTable head={user.role === "ALUNO" ? ["Data e horário", "Tipo", "Professor", "Motivo", "Situação"] : ["Aluno", "Data e horário", "Tipo", "Motivo", "Situação", "Decisão"]}>
        {lista.length === 0 && <EmptyRow colSpan={6}>Nenhuma solicitação encontrada.</EmptyRow>}
        {lista.map((s) => {
          const quando = `${fmtDateBR(s.data)} às ${fmtTime(s.data)} (${s.duracaoMin} min)`
          const situacao = (
            <>
              <Badge variant={s.status === "PENDENTE" ? "outline" : s.status === "APROVADA" ? "default" : "destructive"}>{STATUS[s.status]}</Badge>
              {s.status === "APROVADA" && s.reserva && <span className="block text-xs text-muted-foreground mt-1">{s.reserva.sala.nome}</span>}
              {s.status === "REJEITADA" && s.justificativa && <span className="block text-xs text-muted-foreground mt-1">{s.justificativa}</span>}
            </>
          )
          return user.role === "ALUNO" ? (
            <tr key={s.id}>
              <td className="px-4 py-3">{quando}</td>
              <td className="px-4 py-3">{s.tipo === "REPOSICAO" ? "Reposição" : "Aula extra"}</td>
              <td className="px-4 py-3 text-muted-foreground">{s.professor.usuario.nome}</td>
              <td className="px-4 py-3 max-w-xs">{s.motivo}</td>
              <td className="px-4 py-3">{situacao}</td>
            </tr>
          ) : (
            <tr key={s.id}>
              <td className="px-4 py-3 font-medium">{s.aluno.nome}{staff && <span className="block text-xs font-normal text-muted-foreground">Prof. {s.professor.usuario.nome}</span>}</td>
              <td className="px-4 py-3">{quando}</td>
              <td className="px-4 py-3">{s.tipo === "REPOSICAO" ? "Reposição" : "Aula extra"}</td>
              <td className="px-4 py-3 max-w-xs">{s.motivo}</td>
              <td className="px-4 py-3">{situacao}</td>
              <td className="px-4 py-3">{s.status === "PENDENTE" ? <DecisaoPanel id={s.id} salas={salas.filter((x) => !salaEmManutencao(x, s.data.toISOString().slice(0, 10))).map((x) => ({ id: x.id, nome: x.nome }))} /> : <span className="text-muted-foreground">—</span>}</td>
            </tr>
          )
        })}
      </DataTable>
      {user.role === "ALUNO" && lista.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Precisa repor uma falta? <Link className="text-primary hover:underline" href="/solicitacoes/nova">Faça uma solicitação</Link>.
        </p>
      )}
    </div>
  )
}
