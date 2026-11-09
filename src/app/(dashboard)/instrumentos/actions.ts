"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { assertRole, STAFF } from "@/lib/session"
import { instrumentoFormSchema } from "@/lib/validations/sala"
import { actionError, formToObject, zodFieldErrors, type FormState, erroValidacao } from "@/lib/form-state"
import { redirectOk } from "@/lib/flash"

export async function salvarInstrumento(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  try {
    await assertRole(STAFF)
    const parsed = instrumentoFormSchema.safeParse(formToObject(fd))
    if (!parsed.success) return erroValidacao(parsed.error)
    if (id) await prisma.instrumento.update({ where: { id }, data: parsed.data })
    else await prisma.instrumento.create({ data: parsed.data })
  } catch (e) {
    return actionError(e, { entity: "instrumento" })
  }
  revalidatePath("/instrumentos")
  redirectOk("/instrumentos", id ? "Instrumento atualizado com sucesso." : "Instrumento cadastrado com sucesso.")
}

export async function excluirInstrumento(id: string): Promise<FormState> {
  try {
    await assertRole(STAFF)
    const turmas = await prisma.turma.count({ where: { instrumentoId: id } })
    if (turmas > 0) return { error: "Não é possível excluir o instrumento. Existem vínculos ativos associados a este registro." }
    await prisma.instrumento.delete({ where: { id } })
  } catch (e) {
    return actionError(e, { entity: "instrumento" })
  }
  revalidatePath("/instrumentos")
  redirectOk("/instrumentos", "Instrumento excluído com sucesso.")
}
