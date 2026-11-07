-- CreateEnum
CREATE TYPE "SalaStatus" AS ENUM ('DISPONIVEL', 'MANUTENCAO');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ALUNO';

-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "responsavelNome" TEXT,
ADD COLUMN     "responsavelTelefone" TEXT,
ADD COLUMN     "usuarioId" TEXT;

-- AlterTable
ALTER TABLE "Professor" ADD COLUMN     "telefone" TEXT;

-- AlterTable
ALTER TABLE "Turma" ADD COLUMN     "salaId" TEXT;

-- CreateTable
CREATE TABLE "Sala" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL DEFAULT 4,
    "status" "SalaStatus" NOT NULL DEFAULT 'DISPONIVEL',
    "manutencaoAte" TIMESTAMP(3),

    CONSTRAINT "Sala_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sala_nome_key" ON "Sala"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_usuarioId_key" ON "Aluno"("usuarioId");

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE SET NULL ON UPDATE CASCADE;
