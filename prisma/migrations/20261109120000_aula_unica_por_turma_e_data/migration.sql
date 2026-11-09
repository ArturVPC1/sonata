-- Remove aulas duplicadas (mesma turma e mesmo horário), mantendo a realizada ou, no empate, a mais antiga
DELETE FROM "Aula" a USING "Aula" b
WHERE a."turmaId" = b."turmaId" AND a."data" = b."data" AND a."id" <> b."id"
  AND (a."realizada" < b."realizada" OR (a."realizada" = b."realizada" AND a."id" > b."id"));

-- CreateIndex
CREATE UNIQUE INDEX "Aula_turmaId_data_key" ON "Aula"("turmaId", "data");
