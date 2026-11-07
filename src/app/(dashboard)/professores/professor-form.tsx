"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Field, FormAlert, SubmitButton } from "@/components/form-bits"
import { salvarProfessor } from "./actions"
import { keepValues, type FormState } from "@/lib/form-state"

export function ProfessorForm({ id, defaults = {} }: { id: string | null; defaults?: { nome?: string; email?: string; telefone?: string; bio?: string } }) {
  const [state, action] = useActionState<FormState, FormData>(keepValues(salvarProfessor, id), {})
  const fe = state.fieldErrors ?? {}
  const d = (k: keyof typeof defaults) => (state.values?.[k as string] ?? (defaults[k] as string | number | undefined)) as string | undefined
  return (
    <form action={action} className="space-y-6 max-w-3xl">
      <FormAlert state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome completo *" name="nome" error={fe.nome}>
          <Input id="nome" name="nome" defaultValue={d("nome")} required />
        </Field>
        <Field label="E-mail (login) *" name="email" error={fe.email}>
          <Input id="email" name="email" type="email" defaultValue={d("email")} required />
        </Field>
        <Field label="Telefone" name="telefone" error={fe.telefone}>
          <Input id="telefone" name="telefone" defaultValue={d("telefone")} />
        </Field>
        <Field
          label={id ? "Nova senha (opcional)" : "Senha inicial *"}
          name="senha"
          error={fe.senha}
          hint={id ? "Preencha apenas para redefinir a senha." : "Mínimo de 6 caracteres."}
        >
          <Input id="senha" name="senha" type="password" autoComplete="new-password" required={!id} />
        </Field>
      </div>
      <Field label="Minibiografia" name="bio" error={fe.bio}>
        <Textarea id="bio" name="bio" defaultValue={d("bio")} maxLength={500} />
      </Field>
      <div className="flex gap-3">
        <SubmitButton>{id ? "Salvar alterações" : "Cadastrar professor"}</SubmitButton>
        <Button variant="outline" asChild>
          <Link href="/professores">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
