#!/usr/bin/env bash
# Instala o "fluxo 1M": as skills/plugins de Claude Code usadas para refinar e construir o app.
# Uso: bash instala-fluxo-1M.sh            (instala para o usuário, em ~/.claude)
#      bash instala-fluxo-1M.sh --project  (instala no projeto atual, em ./.claude)
#
# Cada passo é independente: se um falhar (rede, versão do CLI), os outros continuam
# e o comando manual é mostrado no final.

set -u
SCOPE_FLAG=""
[ "${1:-}" = "--project" ] && SCOPE_FLAG="--project"

ok=(); fail=()
step() {
  local name="$1"; shift
  echo -e "\n\033[1m▶ $name\033[0m"
  if "$@"; then ok+=("$name"); else fail+=("$name :: $*"); fi
}

has() { command -v "$1" >/dev/null 2>&1; }

if ! has npx; then echo "Node.js/npx é necessário: https://nodejs.org"; exit 1; fi

# 1. grill-me (mattpocock/skills) — só para quem SABE o que quer; o builder não entrevista leigos.
step "grill-me" npx -y skills add https://github.com/mattpocock/skills --skill grill-me $SCOPE_FLAG

# 3. frontend-design — skill oficial da Anthropic (baseline de design)
step "frontend-design" npx -y skills add https://github.com/anthropics/skills --skill frontend-design $SCOPE_FLAG

# 4. impeccable — anti "AI slop", construído sobre o frontend-design
step "impeccable" npx -y skills add https://github.com/pbakaus/impeccable $SCOPE_FLAG

# 5. web-design-guidelines (Vercel) — gate de qualidade de UI
step "web-design-guidelines" npx -y skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines $SCOPE_FLAG

# 5b. shadcn/ui — componentes
step "shadcn" npx -y skills add https://github.com/shadcn-ui/ui --skill shadcn $SCOPE_FLAG

# 6. supabase-postgres-best-practices — RLS e schema seguros
step "supabase-postgres-best-practices" npx -y skills add https://github.com/supabase/agent-skills --skill supabase-postgres-best-practices $SCOPE_FLAG

# 2. superpowers (obra/superpowers) — plugin; instalado pelo CLI do Claude Code
if has claude; then
  step "superpowers" bash -c "claude plugin marketplace add obra/superpowers-marketplace >/dev/null 2>&1; claude plugin install superpowers@superpowers-marketplace || claude plugin install superpowers@claude-plugins-official"
else
  fail+=("superpowers :: CLI 'claude' não encontrado — dentro do Claude Code rode: /plugin install superpowers@claude-plugins-official")
fi

echo -e "\n\033[1mResumo\033[0m"
for s in "${ok[@]}"; do echo "  ✔ $s"; done
for s in "${fail[@]}"; do echo "  ✘ $s"; done
[ ${#fail[@]} -eq 0 ] || echo -e "\nRode os itens ✘ manualmente (o comando está ao lado de cada um)."
exit 0
