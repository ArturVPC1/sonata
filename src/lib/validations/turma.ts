import { z } from "zod"

export const DIAS = ["DOMINGO", "SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"] as const

export const turmaFormSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  instrumentoId: z.string().min(1, "Selecione o instrumento"),
  professorId: z.string().min(1, "Selecione o professor"),
  salaId: z.string().optional(),
  diaSemana: z.enum(DIAS, { errorMap: () => ({ message: "Selecione o dia da semana" }) }),
  horario: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido (HH:mm)"),
  duracaoMin: z.coerce.number().int().min(15, "Mínimo de 15 minutos").max(240, "Máximo de 240 minutos"),
  vagas: z.coerce.number().int().min(1, "Mínimo de 1 vaga").max(100, "Máximo de 100 vagas"),
})

export type TurmaFormInput = z.infer<typeof turmaFormSchema>
