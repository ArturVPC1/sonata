"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { ActionButton } from "@/components/form-bits"
import { alternarRealizada, excluirAula } from "./actions"

export function AulaActions({ id, realizada, podeMarcar, podeExcluir }: { id: string; realizada: boolean; podeMarcar: boolean; podeExcluir: boolean }) {
  const [abrindo, setAbrindo] = useState(false)
  const [obs, setObs] = useState("")
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-start justify-end gap-2">
        {podeMarcar && realizada && <ActionButton action={() => alternarRealizada(id)}>Desfazer</ActionButton>}
        {podeMarcar && !realizada && !abrindo && <ActionButton action={async () => { setAbrindo(true) }}>Marcar realizada</ActionButton>}
        {podeExcluir && <ActionButton variant="ghost" action={() => excluirAula(id)} confirmText="Excluir esta aula?">Excluir</ActionButton>}
      </div>
      {podeMarcar && !realizada && abrindo && (
        <div className="flex flex-wrap items-start justify-end gap-2">
          <Input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observação (opcional)" aria-label="Observação da aula" maxLength={300} className="w-56" />
          <ActionButton variant="default" action={() => alternarRealizada(id, obs)}>Confirmar</ActionButton>
          <ActionButton variant="ghost" action={async () => { setAbrindo(false); setObs("") }}>Cancelar</ActionButton>
        </div>
      )}
    </div>
  )
}
