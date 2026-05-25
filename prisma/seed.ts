<<<<<<< HEAD
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hash).toString("hex");
}

async function main() {
  const adminEmail = "admin@exemplo.com";
  const existing = await prisma.usuario.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.usuario.create({
      data: {
        nome: "Administrador",
        email: adminEmail,
        senhaHash: await hashPassword("123456"),
        role: "ADMIN",
        ativo: true,
      },
    });
    console.log("✅ Usuário admin criado com sucesso!");
  } else {
    console.log("⚠️ Usuário admin já existe.");
  }
}

main()
  .catch((e) => console.error(e))
=======
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hash).toString("hex");
}

async function main() {
  const adminEmail = "admin@exemplo.com";
  const existing = await prisma.usuario.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.usuario.create({
      data: {
        nome: "Administrador",
        email: adminEmail,
        senhaHash: await hashPassword("123456"),
        role: "ADMIN",
        ativo: true,
      },
    });
    console.log("✅ Usuário admin criado com sucesso!");
  } else {
    console.log("⚠️ Usuário admin já existe.");
  }
}

main()
  .catch((e) => console.error(e))
>>>>>>> 5bd562c607a2882af623702cc2f994257bf9c4e2
  .finally(async () => await prisma.$disconnect());