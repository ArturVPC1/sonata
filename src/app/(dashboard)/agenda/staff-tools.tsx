"use client"

import { useState } from "react"
import { Select } from "@/components/ui/select"
import { ActionButton } from "@/components/form-bits"
import { criarAula, gerarSemana } from "./actions"

export function StaffTools({ data, turmas }: { data: string; turmas: { id: string; label: string }[] }) {
  const [turmaId, setTurmaId] = useState("")
  return (
    <div className="flex flex-wrap items-start gap-2">
      <Select value={turmaId} onChange={(e) => setTurmaId(e.target.value)} className="max-w-xs" aria-label="Turma para agendar aula">
        <option value="">Agendar aula de…</option>
        {turmas.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
      </Select>
      <ActionButton variant="default" size="default" action={() => criarAula(data, turmaId)}>Agendar neste dia</ActionButton>
      <ActionButton variant="outline" size="default" action={() => gerarSemana(data)} confirmText="Gerar as aulas que faltam para todas as turmas ativas nesta semana?">
        Gerar aulas da semana
      </ActionButton>
    </div>
  )
}
