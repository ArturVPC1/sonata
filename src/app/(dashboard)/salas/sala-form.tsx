"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, Textarea } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Field, FormAlert, SubmitButton } from "@/components/form-bits"
import { salvarSala } from "./actions"
import { keepValues, type FormState } from "@/lib/form-state"

export type SalaDefaults = { nome?: string; capacidade?: number; recursos?: string; status?: string; manutencaoAte?: string }

export function SalaForm({ id, defaults = {} }: { id: string | null; defaults?: SalaDefaults }) {
  const [state, action] = useActionState<FormState, FormData>(keepValues(salvarSala, id), {})
  const fe = state.fieldErrors ?? {}
  const d = (k: keyof SalaDefaults) => (state.values?.[k] ?? (defaults[k] as string | number | undefined)) as string | undefined
  const [status, setStatus] = useState(d("status") ?? "DISPONIVEL")
  return (
    <form action={action} noValidate className="space-y-6 max-w-2xl">
      <FormAlert state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome da sala *" name="nome" error={fe.nome}>
          <Input id="nome" name="nome" defaultValue={d("nome")} required />
        </Field>
        <Field label="Capacidade máxima *" name="capacidade" error={fe.capacidade}>
          <Input id="capacidade" name="capacidade" type="number" min={1} max={200} defaultValue={d("capacidade") ?? 4} required />
        </Field>
        <Field label="Recursos disponíveis" name="recursos" error={fe.recursos} className="space-y-2 sm:col-span-2" hint="Ex.: piano, bateria, amplificador, espelho">
          <Textarea id="recursos" name="recursos" defaultValue={d("recursos")} maxLength={300} />
        </Field>
        <Field label="Situação" name="status" error={fe.status}>
          <Select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="DISPONIVEL">Disponível</option>
            <option value="MANUTENCAO">Em manutenção</option>
          </Select>
        </Field>
        {status === "MANUTENCAO" && (
          <Field label="Término previsto da manutenção *" name="manutencaoAte" error={fe.manutencaoAte}>
            <Input id="manutencaoAte" name="manutencaoAte" type="date" defaultValue={d("manutencaoAte")} required />
          </Field>
        )}
      </div>
      <div className="flex gap-3">
        <SubmitButton>{id ? "Salvar alterações" : "Cadastrar sala"}</SubmitButton>
        <Button variant="outline" asChild>
          <Link href="/salas">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
