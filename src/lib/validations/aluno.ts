import { z } from "zod"

export const createAlunoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().optional(),
  dataNasc: z.coerce.date().optional(),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido (formato: 000.000.000-00)")
    .optional(),
})

export type CreateAlunoInput = z.infer<typeof createAlunoSchema>

export const updateAlunoSchema = createAlunoSchema.partial()
export type UpdateAlunoInput = z.infer<typeof updateAlunoSchema>
