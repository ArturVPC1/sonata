import { prisma } from "@/lib/prisma"

/** Notificações dentro do sistema (sino na barra lateral e painel inicial). */
export async function notificar(usuarioIds: string[], mensagem: string, link?: string) {
  const ids = [...new Set(usuarioIds)]
  if (ids.length === 0) return
  await prisma.notificacao.createMany({ data: ids.map((usuarioId) => ({ usuarioId, mensagem, link: link ?? null })) })
}

export async function idsDaEquipe() {
  const eq = await prisma.usuario.findMany({ where: { role: { in: ["ADMIN", "SECRETARIA"] }, ativo: true }, select: { id: true } })
  return eq.map((u) => u.id)
}
