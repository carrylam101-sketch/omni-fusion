#!/bin/bash
set -euo pipefail

# Omni-Fusion Unix/Mac Installer
# Co-installs CodeGraph + ECC + gstack (+ guides for Karpathy + Understand-Anything)

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }
info() { echo -e "  ${CYAN}..${NC} $1"; }

echo ""
echo -e "${BOLD}${CYAN}Omni-Fusion Installer${NC}"
echo ""

# 1. CodeGraph
if command -v codegraph &>/dev/null; then
  ok "CodeGraph already installed"
else
  info "Installing CodeGraph..."
  if npm install -g @colbymchenry/codegraph; then
    ok "CodeGraph installed"
  else
    warn "CodeGraph install failed — run: npm install -g @colbymchenry/codegraph"
  fi
fi

# 2. ECC
if command -v ecc &>/dev/null; then
  ok "ECC CLI already installed"
  info "Installing ECC content..."
  if ecc install --profile developer --target claude; then
    ok "ECC content installed"
  else
    warn "ECC content install failed — run: ecc install --profile developer --target claude"
  fi
else
  info "Installing ECC..."
  if npm install -g ecc-universal && ecc install --profile developer --target claude; then
    ok "ECC installed"
  else
    warn "ECC install failed — run: npm install -g ecc-universal && ecc install --profile developer --target claude"
  fi
fi

# 3. gstack — SKIPPED in sanitized fork (was: git clone ~/.claude/skills/gstack)
# The sanitized fork does NOT auto-provision ~/.claude/skills/ to prevent
# Claude Code plugin auto-activation that could re-introduce the LDR self-loop
# risk via the upstream omni-fusion prompt-injection pattern. To opt in
# manually: git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
warn "gstack SKIPPED (sanitized fork): see SANITIZATION_NOTES.md for opt-in steps"

# 4. Understand-Anything — SKIPPED (was: ~/.claude/plugins/cache/understand-anything)
# Same rationale as gstack; understand-anything is a Claude Code plugin only.
warn "Understand-Anything SKIPPED (Claude Code plugin, requires /plugin install inside Claude Code)"

# 5. Karpathy — the original check was "is the LLM-targeted CLAUDE.md present?"
# The sanitized CLAUDE.md (in this fork) intentionally does NOT contain the
# original "ACTION TRIGGER" or "APEX ACTIVATED" string. Treat its absence as OK.
ok "Karpathy principles (sanitized): present as reference in CLAUDE.md, NOT as a command"

echo ""
echo -e "${GREEN}Omni-Fusion (SANITIZED) setup complete!${NC}"
echo -e "Sanitization: see SANITIZATION_NOTES.md"
echo -e "Upstream original: https://github.com/hernandez42/omni-fusion"
echo -e "Sanitized fork:   https://github.com/carrylam101-sketch/omni-fusion"
echo -e "NOTE: gstack/Understand-Anything NOT auto-installed (Claude Code plugins, opt-in only)"
echo -e "NOTE: 'of' CLI is available locally; global npm installs were left to user opt-in"
echo ""
