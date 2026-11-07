"use client"

import { useState } from "react"
import { Select } from "@/components/ui/select"
import { ActionButton } from "@/components/form-bits"
import { matricularAluno, desmatricularAluno } from "../actions"

type Opcao = { id: string; label: string }
type Atual = { turmaId: string; nome: string; detalhe: string }

export function MatriculaPanel({ alunoId, atuais, opcoes, podeMatricular }: { alunoId: string; atuais: Atual[]; opcoes: Opcao[]; podeMatricular: boolean }) {
  const [turmaId, setTurmaId] = useState("")
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {atuais.length === 0 && <p className="text-sm text-muted-foreground">Sem matrículas ativas.</p>}
        {atuais.map((m) => (
          <div key={m.turmaId} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
            <div>
              <p className="font-medium">{m.nome}</p>
              <p className="text-xs text-muted-foreground">{m.detalhe}</p>
            </div>
            <ActionButton action={() => desmatricularAluno(alunoId, m.turmaId)} confirmText={`Encerrar a matrícula em "${m.nome}"?`}>
              Desmatricular
            </ActionButton>
          </div>
        ))}
      </div>
      {podeMatricular && (
        <div className="flex flex-wrap items-start gap-2">
          <Select value={turmaId} onChange={(e) => setTurmaId(e.target.value)} className="max-w-sm" aria-label="Turma">
            <option value="">Selecione uma turma…</option>
            {opcoes.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </Select>
          <ActionButton variant="default" size="default" action={() => matricularAluno(alunoId, turmaId)}>
            Matricular
          </ActionButton>
        </div>
      )}
    </div>
  )
}
