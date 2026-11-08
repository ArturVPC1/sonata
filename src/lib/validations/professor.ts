import { z } from "zod"
import { cpfSchema } from "./aluno"

export const professorFormSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: cpfSchema,
  email: z.string().email("E-mail inválido").transform((v) => v.toLowerCase()),
  telefone: z.string({ required_error: "Informe o telefone" }).min(8, "Informe o telefone"),
  endereco: z.string({ required_error: "Informe o endereço completo" }).min(5, "Informe o endereço completo"),
  registroProfissional: z.string().optional(),
  bio: z.string().max(500, "Máximo de 500 caracteres").optional(),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").optional(),
})

export type ProfessorFormInput = z.infer<typeof professorFormSchema>
