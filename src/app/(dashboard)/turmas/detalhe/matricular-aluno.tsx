"use client"

import { useState } from "react"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ActionButton } from "@/components/form-bits"
import { matricularAluno, desmatricularAluno } from "../../alunos/actions"

type Opcao = { id: string; nome: string }

export function MatricularAluno({ turmaId, hoje, opcoes, cheia }: { turmaId: string; hoje: string; opcoes: Opcao[]; cheia: boolean }) {
  const [alunoId, setAlunoId] = useState("")
  const [data, setData] = useState(hoje)
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="aluno-matricula">Aluno</Label>
        <Select id="aluno-matricula" value={alunoId} onChange={(e) => setAlunoId(e.target.value)} className="min-w-56" disabled={cheia}>
          <option value="">Selecione um aluno…</option>
          {opcoes.map((o) => (
            <option key={o.id} value={o.id}>{o.nome}</option>
          ))}
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="data-matricula">Data de início</Label>
        <Input id="data-matricula" type="date" value={data} onChange={(e) => setData(e.target.value)} />
      </div>
      <ActionButton variant="default" size="default" action={() => matricularAluno(alunoId, turmaId, data)}>
        Matricular
      </ActionButton>
      {cheia && <p className="w-full text-xs text-destructive">Não há vagas disponíveis nesta turma.</p>}
    </div>
  )
}

export function DesmatricularBotao({ alunoId, turmaId, nome }: { alunoId: string; turmaId: string; nome: string }) {
  return (
    <ActionButton action={() => desmatricularAluno(alunoId, turmaId)} confirmText={`Encerrar a matrícula de "${nome}"?`}>
      Desmatricular
    </ActionButton>
  )
}
