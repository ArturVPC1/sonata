"use client"

import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, Textarea } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Field, FormAlert, SubmitButton } from "@/components/form-bits"
import { criarReserva, reagendarReserva, ocupacaoDaSala } from "./actions"
import { keepValues, type FormState } from "@/lib/form-state"
import { TIPO_RESERVA_LABEL } from "@/lib/validations/reserva"

type Opt = { id: string; nome: string }
export type ReservaDefaults = { salaId?: string; data?: string; inicio?: string; fim?: string; tipo?: string; professorId?: string; observacao?: string }

export function ReservaForm({ id, defaults = {}, salas, professores }: { id: string | null; defaults?: ReservaDefaults; salas: Opt[]; professores?: Opt[] }) {
  const fn = id ? keepValues(reagendarReserva, id) : keepValues(criarReserva)
  const [state, action] = useActionState<FormState, FormData>(fn, {})
  const fe = state.fieldErrors ?? {}
  const d = (k: keyof ReservaDefaults) => state.values?.[k] ?? defaults[k]
  const [salaId, setSalaId] = useState(d("salaId") ?? "")
  const [data, setData] = useState(d("data") ?? "")
  const [ocupacao, setOcupacao] = useState<{ inicio: string; fim: string; descricao: string }[] | null>(null)

  useEffect(() => {
    let vivo = true
    if (salaId && data) ocupacaoDaSala(salaId, data).then((r) => vivo && setOcupacao(r)).catch(() => vivo && setOcupacao(null))
    else setOcupacao(null)
    return () => {
      vivo = false
    }
  }, [salaId, data, state])

  return (
    <form action={action} className="space-y-6 max-w-3xl">
      <FormAlert state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Sala *" name="salaId" error={fe.salaId}>
          {id ? (
            <>
              <input type="hidden" name="salaId" value={salaId} />
              <Select id="salaId" value={salaId} disabled>
                {salas.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </Select>
            </>
          ) : (
            <Select id="salaId" name="salaId" value={salaId} onChange={(e) => setSalaId(e.target.value)} required>
              <option value="">Selecione…</option>
              {salas.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </Select>
          )}
        </Field>
        <Field label="Data *" name="data" error={fe.data}>
          <Input id="data" name="data" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
        </Field>
        <Field label="Horário de início *" name="inicio" error={fe.inicio}>
          <Input id="inicio" name="inicio" type="time" defaultValue={d("inicio")} required />
        </Field>
        <Field label="Horário de término *" name="fim" error={fe.fim}>
          <Input id="fim" name="fim" type="time" defaultValue={d("fim")} required />
        </Field>
        {!id && (
          <Field label="Finalidade *" name="tipo" error={fe.tipo}>
            <Select key={d("tipo") ?? ""} id="tipo" name="tipo" defaultValue={d("tipo") ?? ""} required>
              <option value="">Selecione…</option>
              {Object.entries(TIPO_RESERVA_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
        )}
        {!id && professores && (
          <Field label="Professor responsável" name="professorId" error={fe.professorId}>
            <Select key={d("professorId") ?? ""} id="professorId" name="professorId" defaultValue={d("professorId") ?? ""}>
              <option value="">Nenhum</option>
              {professores.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </Select>
          </Field>
        )}
        {!id && (
          <Field label="Observação" name="observacao" error={fe.observacao} className="space-y-2 sm:col-span-2">
            <Textarea id="observacao" name="observacao" defaultValue={d("observacao")} maxLength={200} />
          </Field>
        )}
      </div>

      {salaId && data && (
        <div className="rounded-lg border p-4" aria-live="polite">
          <p className="text-sm font-medium mb-2">Ocupação da sala em {data.split("-").reverse().join("/")}</p>
          {ocupacao === null && <p className="text-sm text-muted-foreground">Carregando…</p>}
          {ocupacao && ocupacao.length === 0 && <p className="text-sm text-muted-foreground">Sala livre durante todo o dia.</p>}
          {ocupacao && ocupacao.length > 0 && (
            <ul className="space-y-1 text-sm">
              {ocupacao.map((o, i) => (
                <li key={i} className="flex gap-3">
                  <span className="tabular-nums text-muted-foreground w-28">{o.inicio} – {o.fim}</span>
                  <span>{o.descricao}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <SubmitButton>{id ? "Salvar" : "Reservar"}</SubmitButton>
        <Button variant="outline" asChild>
          <Link href="/reservas">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
