"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, Textarea } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Field, FormAlert, SubmitButton } from "@/components/form-bits"
import { solicitarAula, type SolicitacaoState } from "./actions"
import { keepValues } from "@/lib/form-state"

type Opt = { id: string; nome: string }

export function SolicitacaoForm({ professores, aulas, semTelefone }: { professores: Opt[]; aulas: Opt[]; semTelefone: boolean }) {
  const [state, action] = useActionState<SolicitacaoState, FormData>(keepValues(solicitarAula) as never, {})
  const fe = state.fieldErrors ?? {}
  const v = (k: string) => state.values?.[k]
  const [tipo, setTipo] = useState(v("tipo") ?? "")
  const [inicio, setInicio] = useState(v("inicio") ?? "")
  const sugestoes = (state as SolicitacaoState).sugestoes ?? []

  return (
    <form action={action} noValidate className="space-y-6 max-w-3xl">
      {semTelefone && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-800" role="status">
          Atenção: você não possui telefone cadastrado. Atualize seus dados para que a escola possa contatá-lo sobre sua solicitação.
        </div>
      )}
      <FormAlert state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Professor *" name="professorId" error={fe.professorId}>
          <Select key={v("professorId") ?? ""} id="professorId" name="professorId" defaultValue={v("professorId") ?? ""} required>
            <option value="">Selecione…</option>
            {professores.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </Select>
        </Field>
        <Field label="Motivo da solicitação *" name="tipo" error={fe.tipo}>
          <Select id="tipo" name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} required>
            <option value="">Selecione…</option>
            <option value="REPOSICAO">Reposição de falta</option>
            <option value="EXTRA">Aula complementar</option>
          </Select>
        </Field>
        {tipo === "REPOSICAO" && (
          <Field label="Aula perdida" name="aulaPerdidaId" error={fe.aulaPerdidaId} className="space-y-2 sm:col-span-2">
            <Select key={v("aulaPerdidaId") ?? ""} id="aulaPerdidaId" name="aulaPerdidaId" defaultValue={v("aulaPerdidaId") ?? ""}>
              <option value="">Selecione a aula perdida…</option>
              {aulas.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </Select>
          </Field>
        )}
        <Field label="Data desejada *" name="data" error={fe.data}>
          <Input id="data" name="data" type="date" defaultValue={v("data")} required />
        </Field>
        <Field label="Horário desejado *" name="inicio" error={fe.inicio}>
          <Input id="inicio" name="inicio" type="time" value={inicio} onChange={(e) => setInicio(e.target.value)} required />
        </Field>
        <Field label="Duração (min) *" name="duracaoMin" error={fe.duracaoMin}>
          <Input id="duracaoMin" name="duracaoMin" type="number" min={15} max={180} step={5} defaultValue={v("duracaoMin") ?? 60} required />
        </Field>
        <Field label="Descrição do motivo *" name="motivo" error={fe.motivo} className="space-y-2 sm:col-span-2">
          <Textarea id="motivo" name="motivo" defaultValue={v("motivo")} maxLength={300} required />
        </Field>
      </div>

      {sugestoes.length > 0 && (
        <div className="rounded-lg border p-4 space-y-2">
          <p className="text-sm font-medium">Horários alternativos disponíveis nesse dia</p>
          <div className="flex flex-wrap gap-2">
            {sugestoes.map((h) => (
              <Button key={h} type="button" variant="outline" size="sm" onClick={() => setInicio(h)}>
                {h}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <SubmitButton pendingText="Enviando…">Enviar solicitação</SubmitButton>
        <Button variant="outline" asChild>
          <Link href="/solicitacoes">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
