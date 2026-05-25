# ERP Escola de Música

Sistema de gerenciamento para escolas de música construído com Next.js 15, Auth.js v5, Prisma e PostgreSQL.

## Stack

- **Frontend**: Next.js 15, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes + Server Actions
- **ORM**: Prisma
- **Banco**: PostgreSQL (Neon em produção)
- **Auth**: Auth.js v5 (Credentials + JWT)
- **Validação**: Zod
- **Deploy**: Vercel + Neon

## Primeiros passos

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` e preencha:
- `DATABASE_URL` — string de conexão do Neon ou PostgreSQL local
- `AUTH_SECRET` — gere com `openssl rand -base64 32`

### 3. Gerar o banco e o cliente Prisma

```bash
npm run db:push      # aplica o schema (dev/staging)
# ou
npm run db:migrate   # cria uma migration versionada
```

```bash
npm run db:generate  # gera o Prisma Client
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Estrutura do projeto

```
src/
├── auth.ts                          # Config do Auth.js (Credentials + callbacks)
├── middleware.ts                    # Proteção de rotas via Auth.js
├── types/
│   └── next-auth.d.ts               # Augmentação de tipos da sessão
├── app/
│   ├── (auth)/login/                # Rota pública — sem sidebar
│   ├── (dashboard)/                 # Rotas privadas — com sidebar
│   │   ├── layout.tsx               # Layout com sidebar + verificação de sessão
│   │   └── dashboard/page.tsx
│   ├── api/auth/[...nextauth]/      # Handlers do Auth.js
│   ├── layout.tsx                   # Root layout (SessionProvider)
│   └── globals.css
├── components/
│   ├── sidebar.tsx
│   └── ui/                          # Componentes shadcn/ui
└── lib/
    ├── prisma.ts
    ├── utils.ts
    └── validations/
        ├── auth.ts
        └── aluno.ts
prisma/
└── schema.prisma                    # Modelos: Usuario, Aluno, Professor,
                                     # Instrumento, Turma, Matricula, Aula, Pagamento
```

## Criando o primeiro usuário admin

Por enquanto não há tela de cadastro de admin. Crie via Prisma Studio:

```bash
npm run db:studio
```

Ou via script Node (lembre de fazer hash da senha com bcrypt):

```js
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash("suasenha", 12)
  await prisma.usuario.create({
    data: { nome: "Admin", email: "admin@escola.com", senhaHash: hash, role: "ADMIN" }
  })
}

main()
```
