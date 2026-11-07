import { z } from "zod"

export const professorFormSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido").transform((v) => v.toLowerCase()),
  telefone: z.string().optional(),
  bio: z.string().max(500, "Máximo de 500 caracteres").optional(),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").optional(),
})

export type ProfessorFormInput = z.infer<typeof professorFormSchema>
