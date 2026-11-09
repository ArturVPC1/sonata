"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FormAlert, SubmitButton } from "@/components/form-bits"
import { salvarInstrumento } from "./actions"
import { keepValues, type FormState } from "@/lib/form-state"

export function InstrumentoForm({ id, nome, compact }: { id: string | null; nome?: string; compact?: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(keepValues(salvarInstrumento, id), {})
  const fe = state.fieldErrors ?? {}
  return (
    <form action={action} noValidate className="space-y-3 max-w-xl">
      <FormAlert state={state} />
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Nome do instrumento *" name="nome" error={fe.nome} className="space-y-2 flex-1 min-w-[200px]">
          <Input id="nome" name="nome" defaultValue={state.values?.nome ?? nome} required />
        </Field>
        <SubmitButton>{id ? "Salvar" : "Adicionar"}</SubmitButton>
        {!compact && (
          <Button variant="outline" asChild>
            <Link href="/instrumentos">Cancelar</Link>
          </Button>
        )}
      </div>
    </form>
  )
}
