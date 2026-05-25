// auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Inicializa a instância do Auth
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);