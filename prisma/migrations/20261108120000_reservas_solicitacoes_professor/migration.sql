-- CreateEnum
CREATE TYPE "TipoReserva" AS ENUM ('AULA', 'ENSAIO_INDIVIDUAL', 'ENSAIO_COLETIVO');

-- CreateEnum
CREATE TYPE "StatusReserva" AS ENUM ('ATIVA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoSolicitacao" AS ENUM ('EXTRA', 'REPOSICAO');

-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE', 'APROVADA', 'REJEITADA');

-- AlterTable
ALTER TABLE "Professor" ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "endereco" TEXT,
ADD COLUMN     "registroProfissional" TEXT;

-- AlterTable
ALTER TABLE "Sala" ADD COLUMN     "recursos" TEXT;

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,
    "criadoPorId" TEXT NOT NULL,
    "professorId" TEXT,
    "tipo" "TipoReserva" NOT NULL,
    "observacao" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "duracaoMin" INTEGER NOT NULL DEFAULT 60,
    "status" "StatusReserva" NOT NULL DEFAULT 'ATIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitacaoAula" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "tipo" "TipoSolicitacao" NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "duracaoMin" INTEGER NOT NULL DEFAULT 60,
    "motivo" TEXT NOT NULL,
    "aulaPerdidaId" TEXT,
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE',
    "decididoPorId" TEXT,
    "decididoEm" TIMESTAMP(3),
    "justificativa" TEXT,
    "reservaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolicitacaoAula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "link" TEXT,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SolicitacaoAula_reservaId_key" ON "SolicitacaoAula"("reservaId");

-- CreateIndex
CREATE UNIQUE INDEX "Professor_cpf_key" ON "Professor"("cpf");

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoAula" ADD CONSTRAINT "SolicitacaoAula_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoAula" ADD CONSTRAINT "SolicitacaoAula_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoAula" ADD CONSTRAINT "SolicitacaoAula_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoAula" ADD CONSTRAINT "SolicitacaoAula_aulaPerdidaId_fkey" FOREIGN KEY ("aulaPerdidaId") REFERENCES "Aula"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
