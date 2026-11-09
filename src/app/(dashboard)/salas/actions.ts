"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { assertRole, STAFF } from "@/lib/session"
import { salaFormSchema } from "@/lib/validations/sala"
import { actionError, formToObject, zodFieldErrors, type FormState, erroValidacao } from "@/lib/form-state"
import { redirectOk } from "@/lib/flash"

export async function salvarSala(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  try {
    await assertRole(STAFF)
    const parsed = salaFormSchema.safeParse(formToObject(fd))
    if (!parsed.success) return erroValidacao(parsed.error)
    const v = parsed.data
    const data = {
      nome: v.nome,
      capacidade: v.capacidade,
      recursos: v.recursos ?? null,
      status: v.status,
      manutencaoAte: v.status === "MANUTENCAO" && v.manutencaoAte ? new Date(`${v.manutencaoAte}T00:00:00.000Z`) : null,
    }
    if (id) await prisma.sala.update({ where: { id }, data })
    else await prisma.sala.create({ data })
  } catch (e) {
    return actionError(e, { entity: "sala" })
  }
  revalidatePath("/salas")
  redirectOk("/salas", id ? "Dados da sala atualizados com sucesso." : "Sala cadastrada com sucesso.")
}

/** RF016 — exclui a sala se não houver turmas ativas nem reservas ativas futuras. */
export async function excluirSala(id: string): Promise<FormState> {
  try {
    await assertRole(STAFF)
    const [turmas, reservas] = await Promise.all([
      prisma.turma.count({ where: { salaId: id, ativo: true } }),
      prisma.reserva.count({ where: { salaId: id, status: "ATIVA", data: { gte: new Date() } } }),
    ])
    if (turmas > 0 || reservas > 0) return { error: "Não é possível excluir a sala. Existem vínculos ativos associados a este registro." }
    await prisma.$transaction(async (tx) => {
      await tx.reserva.deleteMany({ where: { salaId: id } })
      await tx.sala.delete({ where: { id } })
    })
  } catch (e) {
    return actionError(e, { entity: "sala" })
  }
  revalidatePath("/salas")
  redirectOk("/salas", "Sala excluída com sucesso.")
}
