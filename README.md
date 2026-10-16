# Brisa

Plataforma Next.js onde uma pessoa leiga descreve o negócio em 2 linhas (ou sobe um e-book em PDF) e recebe um app com cara de produto de 1 milhão — **sem ser entrevistada**. Todo o trabalho de Product Owner é feito pelo sistema, com base em referências reais.

## O que ele entrega

| Fase | Motor | Saída (`data/projects/{id}/`) |
|---|---|---|
| 1. Input leigo | tela simples: o que faz / onde / quem paga / e-book | `input.json`, `ebook.json` |
| 2. Reference Engine | Google Play (`google-play-scraper`), Apple App Store (API oficial da Apple), GitHub (Octokit), Behance (Puppeteer) | `references.md`, `references.json` |
| 3. PM Engine | PM sênior: 10 must-have, 5 luxo, 3 planos, sem perguntar nada | `PRD.md`, `PRODUCT.md`, `DESIGN.md` |
| 4. Design Engine | direção de arte por nicho (paleta, tipografia, princípios anti-“AI slop”) | `design.json`, `DESIGN.md` |
| 5. Build Engine | telas do app + starter kit Next.js 14 + Supabase (RLS) + Prisma | `app-spec.json`, `.zip` para download |

O usuário acompanha as fases ao vivo, navega no protótipo dentro de um celular, compartilha o link `/preview/{id}` com o cliente e baixa o starter kit.

## Rodar

```bash
pnpm install
cp .env.example .env.local   # ANTHROPIC_API_KEY recomendado
pnpm dev                     # http://localhost:3000
```

### Dois motores
- **Motor Claude** (com `ANTHROPIC_API_KEY`): extração do e-book lendo o PDF inteiro, termos de busca por nicho, PRD escrito por um "PM sênior" a partir das referências e telas desenhadas sob medida. Modelo padrão `claude-opus-5-5` (configurável em `CLAUDE_MODEL`), com saída estruturada validada por Zod e fallback automático do servidor em caso de recusa.
- **Motor offline** (sem chave): biblioteca curada de 10 nichos (finanças, serviços em campo/piscinas, fitness, saúde, beleza, alimentação, educação, imóveis, pets, varejo + genérico) com apps, repos e features reais. O builder nunca quebra por falta de IA ou de rede.

Cada fonte do Reference Engine tenta ao vivo primeiro e cai para a biblioteca curada se a fonte estiver bloqueada; o `references.md` marca cada item como 🟢 ao vivo ou 📚 curado e registra o motivo no "Log do motor".

## Estrutura

```
app/(builder)/page.tsx                 input leigo + landing de vendas
app/projects/[id]/page.tsx             workspace (pipeline ao vivo, produto, referências, design, docs, export)
app/preview/[id]/                      protótipo em tela cheia (link para o cliente)
app/api/upload-ebook | fetch-references | generate-prd | generate-design | build-app
app/api/projects/[id]/download         starter kit .zip
lib/reference-engine/playstore.ts | github.ts | behance.ts | index.ts
lib/extraction/ebook-parser.ts         pdf-parse + Claude (PDF nativo) + heurística
lib/pm-engine/prd-generator.ts
lib/design-engine/design-system.ts
lib/build-engine/app-spec.ts | schema.ts (SQL+RLS, Prisma) | exporter.ts
components/preview/app-renderer.tsx    renderer do app (o mesmo vai dentro do starter kit)
instala-fluxo-1M.sh                    instala as 7 skills do fluxo no Claude Code
```

## Produção (Vercel)

1. Crie um projeto Supabase e um bucket **privado** `builder-projects`.
2. Configure na Vercel: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e, opcionalmente, `GITHUB_TOKEN` e `BUILDER_ACCESS_CODE` (protege o custo de IA com um código de acesso).
3. `vercel --prod`. As rotas de geração têm `maxDuration = 300` (plano Pro da Vercel para durações acima de 60s).

Sem Supabase, os projetos são salvos em disco (`DATA_DIR`, padrão `./data/projects`) — ótimo para rodar em VPS/Docker, mas **não** na Vercel, onde `/tmp` não é compartilhado entre funções. Puppeteer não roda na Vercel: lá o Behance usa o fallback por HTTP e a biblioteca curada.

## Testes

```bash
pnpm test:pipeline [ebook.pdf]   # pipeline completo em 4 nichos: 10/5/3, telas, RLS e zip
pnpm test:rls                    # Postgres real: isolamento entre usuários em todos os nichos
pnpm typecheck && pnpm lint && pnpm build
```

## Skills do fluxo 1M

`bash instala-fluxo-1M.sh` (ou `--project`) instala: grill-me, superpowers, frontend-design, impeccable, web-design-guidelines, shadcn e supabase-postgres-best-practices. O starter kit exportado traz o mesmo script e um `CLAUDE.md` com a ordem de uso (`/impeccable init`, `/frontend-design`, `/superpowers:plan`, `/superpowers:build`).

## Próximos passos para vender
- Cobrança dos planos da landing (Stripe/Mercado Pago) — hoje os botões levam ao formulário.
- Login de usuários (Supabase Auth) para separar os projetos por conta; hoje todos os projetos ficam visíveis em `/projects` (use `BUILDER_ACCESS_CODE` até lá).
