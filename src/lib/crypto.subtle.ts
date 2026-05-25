// lib/crypto.ts
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(hash).toString('hex');
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === hashed;
}