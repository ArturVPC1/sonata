"use client"

import { ActionButton } from "@/components/form-bits"
import { alternarRealizada, excluirAula } from "./actions"

export function AulaActions({ id, realizada, podeMarcar, podeExcluir }: { id: string; realizada: boolean; podeMarcar: boolean; podeExcluir: boolean }) {
  return (
    <div className="flex items-start justify-end gap-2">
      {podeMarcar && <ActionButton action={() => alternarRealizada(id)}>{realizada ? "Desfazer" : "Marcar realizada"}</ActionButton>}
      {podeExcluir && <ActionButton variant="ghost" action={() => excluirAula(id)} confirmText="Excluir esta aula?">Excluir</ActionButton>}
    </div>
  )
}
