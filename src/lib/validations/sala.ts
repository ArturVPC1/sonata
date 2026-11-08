import { z } from "zod"

export const salaFormSchema = z
  .object({
    nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(60, "Máximo de 60 caracteres"),
    capacidade: z.coerce.number({ invalid_type_error: "Informe a capacidade" }).int().min(1, "Mínimo de 1 pessoa").max(200, "Máximo de 200 pessoas"),
    recursos: z.string().max(300, "Máximo de 300 caracteres").optional(),
    status: z.enum(["DISPONIVEL", "MANUTENCAO"]).default("DISPONIVEL"),
    manutencaoAte: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida").optional(),
  })
  .superRefine((v, ctx) => {
    if (v.status === "MANUTENCAO" && !v.manutencaoAte) {
      ctx.addIssue({ code: "custom", path: ["manutencaoAte"], message: "Informe a data prevista de término da manutenção" })
    }
  })

export const instrumentoFormSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(60, "Máximo de 60 caracteres"),
})
