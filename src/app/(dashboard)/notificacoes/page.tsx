import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { ActionButton } from "@/components/form-bits"
import { marcarNotificacoesLidas } from "../solicitacoes/actions"
import Link from "next/link"

export default async function NotificacoesPage() {
  const user = await requireUser()
  const lista = await prisma.notificacao.findMany({ where: { usuarioId: user.id }, orderBy: { createdAt: "desc" }, take: 30 })
  const naoLidas = lista.filter((n) => !n.lida).length
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Notificações" description={naoLidas ? `${naoLidas} não lida(s).` : "Tudo em dia."} />
        {naoLidas > 0 && <ActionButton action={marcarNotificacoesLidas}>Marcar todas como lidas</ActionButton>}
      </div>
      <Card>
        <CardContent className="divide-y p-0">
          {lista.length === 0 && <p className="p-6 text-sm text-muted-foreground">Nenhuma notificação.</p>}
          {lista.map((n) => (
            <div key={n.id} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
              <div>
                <p className={n.lida ? "text-muted-foreground" : "font-medium"}>{n.mensagem}</p>
                <p className="text-xs text-muted-foreground">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(n.createdAt)}</p>
              </div>
              {n.link && <Link href={n.link} className="text-primary hover:underline whitespace-nowrap">Abrir</Link>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
