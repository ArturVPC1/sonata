import { handlers } from "@/auth"

// Exporta os handlers GET e POST do Auth.js
// Isso substitui a rota fake /api/auth/login anterior
export const { GET, POST } = handlers
