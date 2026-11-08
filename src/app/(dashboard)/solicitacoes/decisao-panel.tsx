"use client"

import { useState } from "react"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ActionButton } from "@/components/form-bits"
import { aprovarSolicitacao, rejeitarSolicitacao } from "./actions"

export function DecisaoPanel({ id, salas }: { id: string; salas: { id: string; nome: string }[] }) {
  const [salaId, setSalaId] = useState("")
  const [motivo, setMotivo] = useState("")
  const [rejeitando, setRejeitando] = useState(false)
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start gap-2">
        <Select value={salaId} onChange={(e) => setSalaId(e.target.value)} className="w-44" aria-label="Sala da aula">
          <option value="">Sala…</option>
          {salas.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </Select>
        <ActionButton variant="default" action={() => aprovarSolicitacao(id, salaId)}>Aprovar</ActionButton>
        <ActionButton variant="outline" action={async () => { if (!rejeitando) { setRejeitando(true); return { error: "Informe o motivo da rejeição abaixo e clique em Rejeitar novamente." } } return rejeitarSolicitacao(id, motivo) }}>
          Rejeitar
        </ActionButton>
      </div>
      {rejeitando && <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo da rejeição" aria-label="Motivo da rejeição" />}
    </div>
  )
}
