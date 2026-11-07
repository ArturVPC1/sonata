import bcrypt from "bcryptjs"

const BCRYPT_ROUNDS = 12

/** Gera o hash (bcrypt) de uma senha. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/** Hash antigo do projeto: SHA-256 puro, sem sal (64 caracteres hexadecimais). */
export function isLegacyHash(hashed: string): boolean {
  return /^[0-9a-f]{64}$/i.test(hashed)
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return Buffer.from(digest).toString("hex")
}

/**
 * Confere a senha. Aceita bcrypt (atual) e SHA-256 (legado), para que contas
 * criadas antes da troca continuem entrando. No login, quem usa o hash legado
 * é migrado para bcrypt automaticamente (ver auth.ts).
 */
export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  if (isLegacyHash(hashed)) return (await sha256Hex(password)) === hashed.toLowerCase()
  if (!hashed.startsWith("$2")) return false
  return bcrypt.compare(password, hashed)
}
