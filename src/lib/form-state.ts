import type { ZodError } from "zod"

export type FormState = {
  ok?: boolean
  message?: string
  error?: string
  fieldErrors?: Record<string, string>
  /** valores enviados, para repovoar o formulário após erro (o React 19 reseta o form) */
  values?: Record<string, string>
}

/** Envolve uma Server Action de formulário para devolver os valores digitados quando houver erro. */
export function keepValues<A extends unknown[]>(
  fn: (...args: [...A, FormState, FormData]) => Promise<FormState>,
  ...bound: A
) {
  return async (prev: FormState, fd: FormData): Promise<FormState> => {
    const r = await fn(...bound, prev, fd)
    if (!r?.error) return r
    const values: Record<string, string> = {}
    for (const [k, v] of fd.entries()) if (typeof v === "string" && !/senha/i.test(k)) values[k] = v
    return { ...r, values }
  }
}

export const MSG_OBRIGATORIOS = "Preencha todos os campos obrigatórios."
const MSG_ZERO = "Informe uma duração e um número de vagas maiores que zero."

const faltando = (i: ZodError["issues"][number]) => i.code === "invalid_type" && (i as { received?: string }).received === "undefined"

export function zodFieldErrors(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_"
    if (!out[key]) out[key] = faltando(issue) && issue.message === "Required" ? "Campo obrigatório" : issue.message
  }
  return out
}

/** Erro de validação com a mensagem geral do Apêndice A (campos vazios) ou a dos campos destacados. */
export function erroValidacao(err: ZodError): FormState {
  const zero = err.issues.find((i) => i.message === MSG_ZERO)
  const vazio = err.issues.some(faltando)
  return { error: vazio ? MSG_OBRIGATORIOS : zero ? MSG_ZERO : "Corrija os campos destacados.", fieldErrors: zodFieldErrors(err) }
}

/** FormData -> objeto simples; strings vazias viram undefined. */
export function formToObject(fd: FormData): Record<string, string | undefined> {
  const o: Record<string, string | undefined> = {}
  for (const [k, v] of fd.entries()) {
    if (typeof v !== "string") continue
    o[k] = v.trim() === "" ? undefined : v.trim()
  }
  return o
}

/** Traduz erros conhecidos do Prisma/aplicação em mensagem para o usuário (textos do Apêndice A da monografia). */
export function actionError(e: unknown, opts: { entity?: "aluno" | "professor" | "sala" | "instrumento"; fallback?: string } = {}): FormState {
  const err = e as { code?: string; message?: string; meta?: unknown }
  if (err?.code === "P2002") {
    const t = `${JSON.stringify(err.meta ?? {})} ${err.message ?? ""}`.toLowerCase()
    if (t.includes("cpf")) {
      const msg = opts.entity === "professor" ? "CPF já vinculado a um professor existente." : "CPF já vinculado a um aluno existente."
      return { error: msg, fieldErrors: { cpf: msg } }
    }
    if (t.includes("email")) return { error: "Este e-mail já está em uso.", fieldErrors: { email: "E-mail já cadastrado" } }
    if (t.includes("nome")) {
      const msg = opts.entity === "instrumento" ? "Já existe um instrumento com este nome." : "Já existe uma sala com este nome."
      return { error: msg, fieldErrors: { nome: msg } }
    }
    return { error: "Já existe um registro com estes dados." }
  }
  if (e instanceof Error && e.message && !err?.code) return { error: e.message }
  return { error: opts.fallback ?? "Não foi possível concluir a operação." }
}
