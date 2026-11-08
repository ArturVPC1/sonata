"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Field, FormAlert, SubmitButton } from "@/components/form-bits"
import { salvarProfessor } from "./actions"
import { keepValues, type FormState } from "@/lib/form-state"

export function ProfessorForm({ id, defaults = {} }: { id: string | null; defaults?: { nome?: string; email?: string; cpf?: string; telefone?: string; endereco?: string; registroProfissional?: string; bio?: string } }) {
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
        <Field label="CPF *" name="cpf" error={fe.cpf} hint="Com ou sem pontuação">
          <Input id="cpf" name="cpf" defaultValue={d("cpf")} placeholder="000.000.000-00" required />
        </Field>
        <Field label="Telefone *" name="telefone" error={fe.telefone}>
          <Input id="telefone" name="telefone" defaultValue={d("telefone")} required />
        </Field>
        <Field label="Endereço completo *" name="endereco" error={fe.endereco} className="space-y-2 sm:col-span-2">
          <Input id="endereco" name="endereco" defaultValue={d("endereco")} placeholder="Rua, número, bairro, cidade" required />
        </Field>
        <Field label="Registro profissional" name="registroProfissional" error={fe.registroProfissional} hint="Opcional (ex.: OMB)">
          <Input id="registroProfissional" name="registroProfissional" defaultValue={d("registroProfissional")} />
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
      <Field label="Minicurrículo" name="bio" error={fe.bio}>
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
