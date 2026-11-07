import { prisma } from "@/lib/prisma"

export async function opcoesTurma() {
  const [instrumentos, profs, salas] = await Promise.all([
    prisma.instrumento.findMany({ orderBy: { nome: "asc" } }),
    prisma.professor.findMany({ where: { usuario: { ativo: true } }, include: { usuario: true }, orderBy: { usuario: { nome: "asc" } } }),
    prisma.sala.findMany({ orderBy: { nome: "asc" } }),
  ])
  return {
    instrumentos: instrumentos.map((i) => ({ id: i.id, nome: i.nome })),
    professores: profs.map((p) => ({ id: p.id, nome: p.usuario.nome })),
    salas: salas.map((s) => ({ id: s.id, nome: s.nome, manutencao: s.status === "MANUTENCAO" })),
  }
}
