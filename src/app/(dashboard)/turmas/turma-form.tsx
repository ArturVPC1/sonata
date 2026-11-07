"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Field, FormAlert, SubmitButton } from "@/components/form-bits"
import { salvarTurma } from "./actions"
import { DIAS_UTEIS_E_SABADO, DIA_LABEL } from "@/lib/dates"
import { keepValues, type FormState } from "@/lib/form-state"

type Opt = { id: string; nome: string }
export type TurmaDefaults = { nome?: string; instrumentoId?: string; professorId?: string; salaId?: string; diaSemana?: string; horario?: string; duracaoMin?: number; vagas?: number }

export function TurmaForm({ id, defaults = {}, instrumentos, professores, salas }: { id: string | null; defaults?: TurmaDefaults; instrumentos: Opt[]; professores: Opt[]; salas: (Opt & { manutencao: boolean })[] }) {
  const [state, action] = useActionState<FormState, FormData>(keepValues(salvarTurma, id), {})
  const fe = state.fieldErrors ?? {}
  const d = (k: keyof typeof defaults) => (state.values?.[k as string] ?? (defaults[k] as string | number | undefined)) as string | undefined
  return (
    <form action={action} className="space-y-6 max-w-3xl">
      <FormAlert state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome da turma *" name="nome" error={fe.nome} className="space-y-2 sm:col-span-2">
          <Input id="nome" name="nome" defaultValue={d("nome")} required />
        </Field>
        <Field label="Instrumento *" name="instrumentoId" error={fe.instrumentoId}>
          <Select id="instrumentoId" name="instrumentoId" defaultValue={d("instrumentoId") ?? ""} required>
            <option value="">Selecione…</option>
            {instrumentos.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </Select>
        </Field>
        <Field label="Professor *" name="professorId" error={fe.professorId}>
          <Select id="professorId" name="professorId" defaultValue={d("professorId") ?? ""} required>
            <option value="">Selecione…</option>
            {professores.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </Select>
        </Field>
        <Field label="Sala" name="salaId" error={fe.salaId}>
          <Select id="salaId" name="salaId" defaultValue={d("salaId") ?? ""}>
            <option value="">Sem sala definida</option>
            {salas.map((s) => <option key={s.id} value={s.id} disabled={s.manutencao}>{s.nome}{s.manutencao ? " (manutenção)" : ""}</option>)}
          </Select>
        </Field>
        <Field label="Dia da semana *" name="diaSemana" error={fe.diaSemana}>
          <Select id="diaSemana" name="diaSemana" defaultValue={d("diaSemana") ?? ""} required>
            <option value="">Selecione…</option>
            {DIAS_UTEIS_E_SABADO.map((d) => <option key={d} value={d}>{DIA_LABEL[d]}</option>)}
          </Select>
        </Field>
        <Field label="Horário *" name="horario" error={fe.horario}>
          <Input id="horario" name="horario" type="time" defaultValue={d("horario")} required />
        </Field>
        <Field label="Duração (min) *" name="duracaoMin" error={fe.duracaoMin}>
          <Input id="duracaoMin" name="duracaoMin" type="number" min={15} max={240} step={5} defaultValue={d("duracaoMin") ?? 60} required />
        </Field>
        <Field label="Vagas *" name="vagas" error={fe.vagas}>
          <Input id="vagas" name="vagas" type="number" min={1} max={100} defaultValue={d("vagas") ?? 10} required />
        </Field>
      </div>
      <div className="flex gap-3">
        <SubmitButton>{id ? "Salvar alterações" : "Criar turma"}</SubmitButton>
        <Button variant="outline" asChild>
          <Link href="/turmas">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
