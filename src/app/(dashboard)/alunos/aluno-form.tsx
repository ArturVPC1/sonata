"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Field, FormAlert, SubmitButton } from "@/components/form-bits"
import { salvarAluno } from "./actions"
import { keepValues, type FormState } from "@/lib/form-state"

export type AlunoDefaults = {
  nome?: string; email?: string; telefone?: string; dataNasc?: string; cpf?: string
  responsavelNome?: string; responsavelTelefone?: string; observacoes?: string; temAcesso?: boolean
}

export function AlunoForm({ id, defaults = {} }: { id: string | null; defaults?: AlunoDefaults }) {
  const [state, action] = useActionState<FormState, FormData>(keepValues(salvarAluno, id), {})
  const fe = state.fieldErrors ?? {}
  const d = (k: keyof typeof defaults) => (state.values?.[k as string] ?? (defaults[k] as string | number | undefined)) as string | undefined
  return (
    <form action={action} noValidate className="space-y-6 max-w-3xl">
      <FormAlert state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome completo *" name="nome" error={fe.nome}>
          <Input id="nome" name="nome" defaultValue={d("nome")} required />
        </Field>
        <Field label="E-mail *" name="email" error={fe.email}>
          <Input id="email" name="email" type="email" defaultValue={d("email")} required />
        </Field>
        <Field label="Telefone" name="telefone" error={fe.telefone}>
          <Input id="telefone" name="telefone" defaultValue={d("telefone")} placeholder="(11) 90000-0000" />
        </Field>
        <Field label="Data de nascimento" name="dataNasc" error={fe.dataNasc}>
          <Input id="dataNasc" name="dataNasc" type="date" defaultValue={d("dataNasc")} />
        </Field>
        <Field label="CPF" name="cpf" error={fe.cpf} hint="Com ou sem pontuação">
          <Input id="cpf" name="cpf" defaultValue={d("cpf")} placeholder="000.000.000-00" />
        </Field>
      </div>

      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Responsável (obrigatório para menores de 18 anos)</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome do responsável" name="responsavelNome" error={fe.responsavelNome}>
            <Input id="responsavelNome" name="responsavelNome" defaultValue={d("responsavelNome")} />
          </Field>
          <Field label="Telefone do responsável" name="responsavelTelefone" error={fe.responsavelTelefone}>
            <Input id="responsavelTelefone" name="responsavelTelefone" defaultValue={d("responsavelTelefone")} />
          </Field>
        </div>
      </fieldset>

      <Field label="Observações" name="observacoes" error={fe.observacoes}>
        <Textarea id="observacoes" name="observacoes" defaultValue={d("observacoes")} maxLength={500} />
      </Field>

      {!defaults.temAcesso && (
        <Field label="Senha inicial de acesso (opcional)" name="senha" error={fe.senha} hint="Se preenchida, cria o login do aluno com o e-mail acima.">
          <Input id="senha" name="senha" type="password" autoComplete="new-password" />
        </Field>
      )}
      {defaults.temAcesso && <p className="text-sm text-muted-foreground">Este aluno já possui acesso ao sistema.</p>}

      <div className="flex gap-3">
        <SubmitButton>{id ? "Salvar alterações" : "Cadastrar aluno"}</SubmitButton>
        <Button variant="outline" asChild>
          <Link href="/alunos">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
