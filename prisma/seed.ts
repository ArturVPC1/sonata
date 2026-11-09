/**
 * Seed idempotente (pode rodar várias vezes): usa upsert por id/e-mail e não apaga nada.
 *
 *   npx prisma db seed
 *   SEED_DATE=2026-11-30 npx prisma db seed   # data de referência da apresentação
 *
 * Todas as contas de demonstração usam a senha 123456 (apenas para a apresentação).
 * Aulas são geradas de 3 semanas antes até 2 semanas depois de SEED_DATE; "realizada" vale só para datas anteriores a hoje.
 */
import type { DiaSemana } from "@prisma/client"
import { prisma } from "../src/lib/prisma"
import { hashPassword } from "../src/lib/password"
import { addDays, diaSemanaOf, toDbDateTime, todayStr } from "../src/lib/dates"

const SENHA_DEMO = "123456"
const REF = process.env.SEED_DATE ?? "2026-11-30"

async function main() {
  const senhaHash = await hashPassword(SENHA_DEMO)

  // ---------- Usuários de apoio ----------
  // Admin: cria se não existir; só regrava a senha se ela ainda não estiver em bcrypt (hash legado do SQL de seed)
  const admin = await prisma.usuario.findUnique({ where: { email: "admin@exemplo.com" } })
  if (!admin) {
    await prisma.usuario.create({ data: { nome: "Administrador", email: "admin@exemplo.com", senhaHash, role: "ADMIN" } })
  } else if (!admin.senhaHash.startsWith("$2")) {
    await prisma.usuario.update({ where: { id: admin.id }, data: { senhaHash } })
  }
  await prisma.usuario.upsert({
    where: { email: "secretaria@exemplo.com" },
    update: { senhaHash, ativo: true },
    create: { nome: "Secretaria", email: "secretaria@exemplo.com", senhaHash, role: "SECRETARIA" },
  })

  // ---------- Professores (usuário + professor) ----------
  const professores = [
    { id: "seed_prof_001", usuarioId: "seed_usr_prof_001", nome: "Mariana Costa", email: "mariana.costa@exemplo.com", telefone: "(11) 98100-0001", cpf: "52998224725", endereco: "Rua das Acácias, 120 - São Paulo/SP", registro: "OMB-SP 10231", bio: "Professora de piano e teoria musical. Atua com alunos iniciantes e intermediários." },
    { id: "seed_prof_002", usuarioId: "seed_usr_prof_002", nome: "Rafael Mendes", email: "rafael.mendes@exemplo.com", telefone: "(11) 98100-0002", cpf: "11144477735", endereco: "Av. Brasil, 455 - São Paulo/SP", registro: "OMB-SP 10232", bio: "Professor de violão e guitarra, com foco em prática e repertório." },
    { id: "seed_prof_003", usuarioId: "seed_usr_prof_003", nome: "Camila Oliveira", email: "camila.oliveira@exemplo.com", telefone: "(11) 98100-0003", cpf: "39053344705", endereco: "Rua do Conservatório, 78 - São Paulo/SP", registro: null as string | null, bio: "Professora de canto e técnica vocal." },
  ]
  for (const p of professores) {
    await prisma.usuario.upsert({
      where: { id: p.usuarioId },
      update: { senhaHash, ativo: true },
      create: { id: p.usuarioId, nome: p.nome, email: p.email, senhaHash, role: "PROFESSOR" },
    })
    await prisma.professor.upsert({
      where: { id: p.id },
      update: { telefone: p.telefone, cpf: p.cpf, endereco: p.endereco, registroProfissional: p.registro },
      create: { id: p.id, usuarioId: p.usuarioId, telefone: p.telefone, bio: p.bio, cpf: p.cpf, endereco: p.endereco, registroProfissional: p.registro },
    })
  }

  // ---------- Instrumentos ----------
  const instrumentos: [string, string, string][] = [
    ["seed_inst_001", "Piano", "piano"], ["seed_inst_002", "Violão", "guitar"],
    ["seed_inst_003", "Guitarra", "electric-guitar"], ["seed_inst_004", "Bateria", "drum"],
    ["seed_inst_005", "Canto", "mic"], ["seed_inst_006", "Teclado", "keyboard"],
    ["seed_inst_007", "Flauta", "flute"], ["seed_inst_008", "Violino", "violin"],
  ]
  for (const [id, nome, icone] of instrumentos) {
    await prisma.instrumento.upsert({ where: { nome }, update: {}, create: { id, nome, icone } })
  }
  const inst = async (nome: string) => (await prisma.instrumento.findUniqueOrThrow({ where: { nome } })).id

  // ---------- Salas ----------
  const salas = [
    { id: "seed_sala_1", nome: "Sala 1", capacidade: 4, status: "DISPONIVEL" as const, recursos: "Piano de armário, estantes de partitura" },
    { id: "seed_sala_2", nome: "Sala 2", capacidade: 4, status: "DISPONIVEL" as const, recursos: "Violões, amplificador, estantes" },
    { id: "seed_sala_3", nome: "Sala 3", capacidade: 3, status: "DISPONIVEL" as const, recursos: "Teclado, espelho, caixa de som" },
    { id: "seed_sala_4", nome: "Sala 4", capacidade: 6, status: "MANUTENCAO" as const, recursos: "Bateria acústica, isolamento acústico", manutencaoAte: toDbDateTime(addDays(REF, 7), "00:00") },
    { id: "seed_sala_5", nome: "Sala 5", capacidade: 4, status: "DISPONIVEL" as const, recursos: "Amplificadores, pedais, guitarras" },
    { id: "seed_sala_6", nome: "Auditório", capacidade: 40, status: "DISPONIVEL" as const, recursos: "Piano de cauda, palco, 40 lugares" },
  ]
  for (const s of salas) {
    await prisma.sala.upsert({ where: { nome: s.nome }, update: { capacidade: s.capacidade, status: s.status, recursos: s.recursos, manutencaoAte: s.manutencaoAte ?? null }, create: s })
  }
  const sala = async (nome: string) => (await prisma.sala.findUniqueOrThrow({ where: { nome } })).id

  // ---------- Alunos ----------
  const alunos = [
    { id: "seed_aluno_001", nome: "Lucas Ferreira", email: "lucas.ferreira@exemplo.com", telefone: "(11) 90000-1001", dataNasc: "2010-03-14", cpf: "00000000101", resp: ["Marta Ferreira", "(11) 98800-1001"], login: true },
    { id: "seed_aluno_002", nome: "Beatriz Santos", email: "beatriz.santos@exemplo.com", telefone: "(11) 90000-1002", dataNasc: "2008-07-22", cpf: "00000000102", login: true },
    { id: "seed_aluno_003", nome: "Pedro Almeida", email: "pedro.almeida@exemplo.com", telefone: "(11) 90000-1003", dataNasc: "1998-11-05", cpf: "00000000103", login: true },
    { id: "seed_aluno_004", nome: "Isabela Rocha", email: "isabela.rocha@exemplo.com", telefone: "(11) 90000-1004", dataNasc: "2001-01-18", cpf: "00000000104" },
    { id: "seed_aluno_005", nome: "Gabriel Lima", email: "gabriel.lima@exemplo.com", telefone: "(11) 90000-1005", dataNasc: "2012-09-30", cpf: "00000000105", resp: ["Paulo Lima", "(11) 98800-1005"] },
    { id: "seed_aluno_006", nome: "Sofia Martins", email: "sofia.martins@exemplo.com", telefone: "(11) 90000-1006", dataNasc: "1995-05-11", cpf: "00000000106" },
    { id: "seed_aluno_007", nome: "Enzo Ribeiro", email: "enzo.ribeiro@exemplo.com", telefone: "(11) 90000-1007", dataNasc: "2006-12-02", cpf: "00000000107" },
    { id: "seed_aluno_008", nome: "Valentina Gomes", email: "valentina.gomes@exemplo.com", telefone: "(11) 90000-1008", dataNasc: "2014-04-09", cpf: "00000000108", resp: ["Carla Gomes", "(11) 98800-1008"] },
  ]
  for (const a of alunos) {
    let usuarioId: string | undefined
    if (a.login) {
      const u = await prisma.usuario.upsert({
        where: { email: a.email },
        update: { senhaHash, ativo: true, role: "ALUNO" },
        create: { nome: a.nome, email: a.email, senhaHash, role: "ALUNO" },
      })
      usuarioId = u.id
    }
    const dados = {
      telefone: a.telefone, responsavelNome: a.resp?.[0] ?? null, responsavelTelefone: a.resp?.[1] ?? null,
      ...(usuarioId ? { usuarioId } : {}),
    }
    await prisma.aluno.upsert({
      where: { id: a.id },
      update: dados,
      create: { id: a.id, nome: a.nome, email: a.email, dataNasc: new Date(`${a.dataNasc}T00:00:00.000Z`), cpf: a.cpf, ...dados },
    })
  }

  // ---------- Turmas ----------
  type T = { id: string; nome: string; inst: string; prof: string; dia: DiaSemana; horario: string; dur: number; vagas: number; sala: string }
  const turmas: T[] = [
    { id: "seed_turma_001", nome: "Piano Iniciante - Manhã", inst: "Piano", prof: "seed_prof_001", dia: "SEGUNDA", horario: "09:00", dur: 60, vagas: 8, sala: "Sala 1" },
    { id: "seed_turma_002", nome: "Violão Intermediário", inst: "Violão", prof: "seed_prof_002", dia: "TERCA", horario: "14:00", dur: 60, vagas: 8, sala: "Sala 2" },
    { id: "seed_turma_003", nome: "Canto - Prática Vocal", inst: "Canto", prof: "seed_prof_003", dia: "QUARTA", horario: "16:00", dur: 50, vagas: 6, sala: "Sala 3" },
    { id: "seed_turma_004", nome: "Guitarra para Iniciantes", inst: "Guitarra", prof: "seed_prof_002", dia: "QUINTA", horario: "18:00", dur: 60, vagas: 8, sala: "Sala 5" },
    { id: "seed_turma_005", nome: "Piano - Intermediário", inst: "Piano", prof: "seed_prof_001", dia: "SEXTA", horario: "10:00", dur: 60, vagas: 6, sala: "Sala 1" },
    { id: "seed_turma_006", nome: "Bateria - Fundamentos", inst: "Bateria", prof: "seed_prof_003", dia: "SABADO", horario: "11:00", dur: 50, vagas: 5, sala: "Sala 2" },
    // Segunda-feira (dia da apresentação): mais aulas para a agenda ficar cheia
    { id: "seed_turma_007", nome: "Violão Iniciante", inst: "Violão", prof: "seed_prof_002", dia: "SEGUNDA", horario: "11:00", dur: 60, vagas: 8, sala: "Sala 3" },
    { id: "seed_turma_008", nome: "Canto Coral", inst: "Canto", prof: "seed_prof_003", dia: "SEGUNDA", horario: "14:30", dur: 50, vagas: 12, sala: "Auditório" },
    { id: "seed_turma_009", nome: "Guitarra - Intermediário", inst: "Guitarra", prof: "seed_prof_002", dia: "SEGUNDA", horario: "16:00", dur: 60, vagas: 6, sala: "Sala 5" },
  ]
  for (const t of turmas) {
    const dados = {
      nome: t.nome, instrumentoId: await inst(t.inst), professorId: t.prof, salaId: await sala(t.sala),
      diaSemana: t.dia, horario: t.horario, duracaoMin: t.dur, vagas: t.vagas, ativo: true,
    }
    await prisma.turma.upsert({ where: { id: t.id }, update: dados, create: { id: t.id, ...dados } })
  }

  // ---------- Matrículas ----------
  const matriculas: [string, string][] = [
    ["seed_aluno_001", "seed_turma_001"], ["seed_aluno_002", "seed_turma_001"], ["seed_aluno_003", "seed_turma_002"],
    ["seed_aluno_004", "seed_turma_003"], ["seed_aluno_005", "seed_turma_001"], ["seed_aluno_006", "seed_turma_004"],
    ["seed_aluno_007", "seed_turma_005"], ["seed_aluno_008", "seed_turma_006"], ["seed_aluno_003", "seed_turma_004"],
    // novas (turmas de segunda)
    ["seed_aluno_005", "seed_turma_007"], ["seed_aluno_008", "seed_turma_007"], ["seed_aluno_002", "seed_turma_008"],
    ["seed_aluno_004", "seed_turma_008"], ["seed_aluno_006", "seed_turma_008"], ["seed_aluno_007", "seed_turma_009"],
    ["seed_aluno_003", "seed_turma_009"],
  ]
  for (const [alunoId, turmaId] of matriculas) {
    await prisma.matricula.upsert({
      where: { alunoId_turmaId: { alunoId, turmaId } },
      update: { ativo: true, dataFim: null },
      create: { alunoId, turmaId, dataInicio: new Date("2026-10-05T00:00:00.000Z") },
    })
  }

  // ---------- Aulas (3 semanas antes até 2 semanas depois da data de referência) ----------
  let criadas = 0
  for (let d = addDays(REF, -21); d <= addDays(REF, 14); d = addDays(d, 1)) {
    const dia = diaSemanaOf(d)
    for (const t of turmas.filter((x) => x.dia === dia)) {
      const id = `aula_${t.id}_${d.replace(/-/g, "")}`
      const data = toDbDateTime(d, t.horario)
      // Não duplica: se já existe aula da turma nesse horário (com qualquer id), mantém a existente
      const ja = await prisma.aula.findFirst({ where: { turmaId: t.id, data } })
      if (!ja) await prisma.aula.create({ data: { id, turmaId: t.id, data, realizada: d < todayStr() } })
      criadas++
    }
  }

  // ---------- Reservas, solicitações e notificações de exemplo ----------
  const adminId = (await prisma.usuario.findUniqueOrThrow({ where: { email: "admin@exemplo.com" } })).id
  const dRes = addDays(REF, 2)
  const reservas = [
    { id: "seed_res_001", sala: "Sala 3", tipo: "ENSAIO_INDIVIDUAL" as const, prof: "seed_prof_001", obs: "Ensaio para recital", hora: "10:00", dur: 60, dia: dRes },
    { id: "seed_res_002", sala: "Auditório", tipo: "ENSAIO_COLETIVO" as const, prof: "seed_prof_003", obs: "Ensaio geral do coral", hora: "18:00", dur: 90, dia: dRes },
    { id: "seed_res_003", sala: "Sala 2", tipo: "AULA" as const, prof: "seed_prof_002", obs: "Aula avulsa", hora: "15:00", dur: 60, dia: addDays(REF, 1) },
  ]
  for (const r of reservas) {
    const dados = { salaId: await sala(r.sala), criadoPorId: adminId, professorId: r.prof, tipo: r.tipo, observacao: r.obs, data: toDbDateTime(r.dia, r.hora), duracaoMin: r.dur, status: "ATIVA" as const }
    await prisma.reserva.upsert({ where: { id: r.id }, update: dados, create: { id: r.id, ...dados } })
  }
  await prisma.solicitacaoAula.upsert({
    where: { id: "seed_sol_001" },
    update: {},
    create: { id: "seed_sol_001", alunoId: "seed_aluno_003", professorId: "seed_prof_002", tipo: "EXTRA", data: toDbDateTime(addDays(REF, 3), "17:00"), duracaoMin: 60, motivo: "Preparação para apresentação da escola", status: "PENDENTE" },
  })
  await prisma.notificacao.upsert({
    where: { id: "seed_not_001" },
    update: {},
    create: { id: "seed_not_001", usuarioId: "seed_usr_prof_002", mensagem: "Nova solicitação de aula extra de Pedro Almeida.", link: "/solicitacoes" },
  })

  console.log(`Seed concluído (referência ${REF}). Aulas verificadas/criadas: ${criadas}.`)
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1 })
  .finally(() => prisma.$disconnect())
