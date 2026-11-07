import { z } from "zod"
import { ageFrom } from "@/lib/dates"

const onlyDigits = (s: string) => s.replace(/\D/g, "")

/** CPF: aceita com ou sem máscara e grava só os 11 dígitos. */
const cpf = z
  .string()
  .transform(onlyDigits)
  .refine((v) => v.length === 11, "CPF inválido (11 dígitos)")

const dataISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")

export const alunoFormSchema = z
  .object({
    nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("E-mail inválido").transform((v) => v.toLowerCase()),
    telefone: z.string().optional(),
    dataNasc: dataISO.optional(),
    cpf: cpf.optional(),
    responsavelNome: z.string().optional(),
    responsavelTelefone: z.string().optional(),
    observacoes: z.string().max(500, "Máximo de 500 caracteres").optional(),
    senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").optional(),
  })
  .superRefine((v, ctx) => {
    if (v.dataNasc) {
      const d = new Date(`${v.dataNasc}T00:00:00.000Z`)
      if (d > new Date()) ctx.addIssue({ code: "custom", path: ["dataNasc"], message: "A data não pode ser futura" })
      else if (ageFrom(d) < 18 && !v.responsavelNome?.trim()) {
        ctx.addIssue({ code: "custom", path: ["responsavelNome"], message: "Informe o responsável (aluno menor de 18 anos)" })
      }
    }
  })

export type AlunoFormInput = z.infer<typeof alunoFormSchema>

// Compatibilidade com o código anterior
export const createAlunoSchema = alunoFormSchema
export type CreateAlunoInput = AlunoFormInput
export const updateAlunoSchema = alunoFormSchema
export type UpdateAlunoInput = AlunoFormInput
