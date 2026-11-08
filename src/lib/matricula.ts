import { prisma } from "@/lib/prisma"
import { overlaps } from "@/lib/dates"

/**
 * Matricula um aluno em uma turma aplicando as regras de negócio:
 * turma e aluno ativos, vagas disponíveis e sem choque de horário com outra turma do aluno.
 * Lança Error com mensagem amigável quando alguma regra falha.
 */
export async function matricular(alunoId: string, turmaId: string, dataInicio: Date) {
  const [aluno, turma] = await Promise.all([
    prisma.aluno.findUnique({
      where: { id: alunoId },
      include: { matriculas: { where: { ativo: true }, include: { turma: true } } },
    }),
    prisma.turma.findUnique({ where: { id: turmaId }, include: { _count: { select: { matriculas: { where: { ativo: true } } } } } }),
  ])
  if (!aluno) throw new Error("Aluno não encontrado.")
  if (!turma) throw new Error("Turma não encontrada.")
  if (!aluno.ativo) throw new Error("O aluno está inativo.")
  if (!turma.ativo) throw new Error("A turma está inativa.")

  const jaAtiva = aluno.matriculas.some((m) => m.turmaId === turmaId)
  if (jaAtiva) throw new Error("O aluno já está matriculado nesta turma.")

  if (turma._count.matriculas >= turma.vagas) throw new Error("Não há vagas disponíveis nesta turma.")

  const choque = aluno.matriculas.find(
    (m) => m.turma.diaSemana === turma.diaSemana && overlaps(m.turma.horario, m.turma.duracaoMin, turma.horario, turma.duracaoMin)
  )
  if (choque) throw new Error("Conflito de horário: o aluno já está matriculado em outra turma neste horário.")

  // Matrícula encerrada antes? Reativa em vez de criar outra (há índice único aluno+turma).
  return prisma.matricula.upsert({
    where: { alunoId_turmaId: { alunoId, turmaId } },
    update: { ativo: true, dataFim: null, dataInicio },
    create: { alunoId, turmaId, dataInicio },
  })
}
