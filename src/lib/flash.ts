import { redirect } from "next/navigation"

/** Redireciona para a lista exibindo uma mensagem de sucesso (lida pelo componente <Flash />). */
export function redirectOk(path: string, msg: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}ok=${encodeURIComponent(msg)}`)
}
