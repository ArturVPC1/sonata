# SONATA — Gestão para escolas de música

Aplicação web (TCC) para administrar alunos, professores, turmas e agenda de uma escola de música. Possui áreas por perfil: **Administrador/Secretaria** (funcionário), **Professor** e **Aluno**, todas no mesmo login.

## Stack

- Next.js 16 (App Router, `src/proxy.ts` no lugar do antigo middleware) e React 19
- Tailwind CSS 3 + componentes no estilo shadcn/ui
- Server Actions para as operações de escrita e Route Handlers (previstos para o app mobile)
- Prisma 6 + PostgreSQL (Neon em produção)
- Auth.js v5 (Credentials + JWT), senhas com bcrypt
- Zod para validação
- Deploy: Vercel + Neon

## Perfis e permissões

| Área | Admin / Secretaria | Professor | Aluno |
|---|---|---|---|
| Dashboard | Visão geral da escola | Suas turmas e aulas de hoje | Suas turmas e aulas de hoje |
| Alunos | Listar, cadastrar, editar, inativar, matricular | Somente os alunos das suas turmas (leitura) | — |
| Professores | Listar, cadastrar, editar, inativar | — | — |
| Turmas | Criar, editar, inativar | Suas turmas | Turmas em que está matriculado |
| Agenda | Agendar, gerar semana, marcar realizada, excluir | Suas aulas; marca como realizada | Suas aulas (leitura) |

O `role` fica no JWT; o `src/auth.ts` (callback `authorized`) bloqueia rotas por perfil e cada página/Server Action confere o perfil de novo (`requireUser` / `assertRole`). Usuários inativos não conseguem entrar.

Regras de negócio: choque de horário de professor e de sala, sala em manutenção, vagas da turma, matrícula única por aluno/turma, responsável obrigatório para menores de 18 anos, CPF único.

## Primeiros passos

```bash
npm install                    # também gera o Prisma Client (postinstall)
cp .env.example .env           # preencha DATABASE_URL e AUTH_SECRET
npx prisma migrate deploy      # aplica as migrações (inclui a de perfis/salas)
npx prisma db seed             # dados de demonstração (idempotente)
npm run dev                    # http://localhost:3000
```

Para um banco que já tem dados (backup do Neon), rode apenas `npx prisma migrate deploy` e depois o seed: ele não apaga nada, só cria o que falta.

### Data de referência da demonstração

O seed gera aulas de 21 dias antes a 14 dias depois de uma data de referência (padrão **30/11/2026**, dia da apresentação), com 4 aulas nessa segunda-feira. Para outra data: `SEED_DATE=2026-12-07 npx prisma db seed`.

### Contas de demonstração (senha `123456`)

| Perfil | E-mail |
|---|---|
| Administrador | admin@exemplo.com |
| Secretaria | secretaria@exemplo.com |
| Professor | mariana.costa@exemplo.com, rafael.mendes@exemplo.com, camila.oliveira@exemplo.com |
| Aluno | lucas.ferreira@exemplo.com, beatriz.santos@exemplo.com, pedro.almeida@exemplo.com |

Com `NEXT_PUBLIC_DEMO_LOGINS="true"` a tela de login mostra botões que preenchem essas credenciais. **Troque as senhas antes de qualquer uso real.**

## Estrutura

```
src/
├── auth.ts                  # Auth.js: Credentials, JWT com role, rotas por perfil
├── proxy.ts                 # Proteção de rotas (Next 16)
├── app/
│   ├── (auth)/login/        # Login único
│   └── (dashboard)/         # Área autenticada
│       ├── dashboard/       # Dashboard por perfil
│       ├── alunos/          # Lista, cadastro/edição, matrículas
│       ├── professores/     # Lista, cadastro/edição
│       ├── turmas/          # Lista, cadastro/edição, alunos da turma
│       └── agenda/          # Agenda diária/semanal, salas ocupadas/livres
├── components/              # Sidebar, cabeçalho de página, formulários, ui/
└── lib/
    ├── password.ts          # bcrypt (aceita SHA-256 legado e migra no 1º login)
    ├── session.ts           # requireUser / assertRole
    ├── dates.ts             # Datas em America/Sao_Paulo
    ├── matricula.ts         # Regras de matrícula
    └── validations/         # Schemas Zod
prisma/
├── schema.prisma            # Usuario, Aluno, Professor, Instrumento, Sala, Turma, Matricula, Aula, Pagamento
├── migrations/              # Histórico versionado
└── seed.ts                  # Dados de demonstração
```

## Observações

- O módulo **Pagamentos** existe no schema, mas a tela foi adiada e o link está oculto.
- Datas de aula são gravadas como horário de parede de São Paulo (sem fuso); os helpers em `lib/dates.ts` cuidam disso.
- Nunca versione o `.env`. Se uma credencial vazar, troque a senha do banco e o `AUTH_SECRET`.
