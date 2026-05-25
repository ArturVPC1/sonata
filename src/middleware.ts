export { auth as middleware } from "@/auth"

export const config = {
  /*
   * Rotas protegidas: tudo EXCETO:
   * - /api/auth/* (handlers do Auth.js)
   * - /_next/* (assets internos do Next.js)
   * - /favicon.ico, /sitemap.xml, /robots.txt
   * - /login (página pública)
   */
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|login).*)",
  ],
}
