import { prisma } from "@/lib/prisma"
import { addDays, dayRange, proximaDataDoDia, todayStr, toDbDateTime, type DiaSemanaKey } from "@/lib/dates"

/**
 * Mantém a agenda em dia: apaga as aulas futuras ainda não realizadas da turma e gera as das próximas semanas
 * (hoje em diante) no dia e horário atuais. Assim a grade e a ocupação das salas refletem a turma assim que ela é salva.
 */
export async function sincronizarAulasDaTurma(turma: { id: string; ativo: boolean; diaSemana: DiaSemanaKey; horario: string }, semanas = 4) {
  const hoje = todayStr()
  await prisma.aula.deleteMany({ where: { turmaId: turma.id, realizada: false, data: { gte: dayRange(hoje).gte } } })
  if (!turma.ativo) return
  let d = proximaDataDoDia(turma.diaSemana, hoje)
  for (let i = 0; i < semanas; i++, d = addDays(d, 7)) {
    const ja = await prisma.aula.findFirst({ where: { turmaId: turma.id, data: dayRange(d) } })
    if (!ja) await prisma.aula.create({ data: { turmaId: turma.id, data: toDbDateTime(d, turma.horario) } })
  }
}
