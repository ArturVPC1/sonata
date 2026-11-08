import { z } from "zod"
import { diffMin } from "@/lib/dates"
import { MSG_HORARIO_INVALIDO } from "@/lib/mensagens"

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido (HH:mm)")

export const reservaFormSchema = z
  .object({
    salaId: z.string().min(1, "Selecione a sala"),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data"),
    inicio: hhmm,
    fim: hhmm,
    tipo: z.enum(["AULA", "ENSAIO_INDIVIDUAL", "ENSAIO_COLETIVO"], { errorMap: () => ({ message: "Selecione a finalidade" }) }),
    professorId: z.string().optional(),
    observacao: z.string().max(200, "Máximo de 200 caracteres").optional(),
  })
  .superRefine((v, ctx) => {
    if (diffMin(v.inicio, v.fim) <= 0) ctx.addIssue({ code: "custom", path: ["fim"], message: MSG_HORARIO_INVALIDO })
  })

export const TIPO_RESERVA_LABEL = { AULA: "Aula", ENSAIO_INDIVIDUAL: "Ensaio individual", ENSAIO_COLETIVO: "Ensaio coletivo" } as const

export const solicitacaoFormSchema = z.object({
  professorId: z.string().min(1, "Selecione o professor"),
  tipo: z.enum(["EXTRA", "REPOSICAO"], { errorMap: () => ({ message: "Selecione o motivo" }) }),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data"),
  inicio: hhmm,
  duracaoMin: z.coerce.number().int().min(15, "Mínimo de 15 minutos").max(180, "Máximo de 180 minutos").default(60),
  aulaPerdidaId: z.string().optional(),
  motivo: z.string().min(5, "Descreva o motivo (mínimo de 5 caracteres)").max(300, "Máximo de 300 caracteres"),
})

/** Máximo de solicitações pendentes por aluno (RF031). */
export const LIMITE_PENDENTES = 3
