import { redirect } from "next/navigation"
import { auth } from "@/auth"

// Rota raiz: redireciona autenticados ao dashboard, outros ao login
export default async function HomePage() {
  const session = await auth()
  if (session) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}
