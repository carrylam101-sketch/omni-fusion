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

# 3. gstack
GSTACK_DIR="$HOME/.claude/skills/gstack"
if [ -f "$GSTACK_DIR/SKILL.md" ]; then
  ok "gstack already installed"
else
  info "Installing gstack..."
  mkdir -p "$(dirname "$GSTACK_DIR")"
  if git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git "$GSTACK_DIR"; then
    ok "gstack cloned"
  else
    warn "gstack clone failed — run: git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack"
  fi
  if [ -f "$GSTACK_DIR/setup" ]; then
    if (cd "$GSTACK_DIR" && ./setup); then
      ok "gstack setup complete"
    else
      warn "gstack setup incomplete — run cd ~/.claude/skills/gstack && ./setup"
    fi
  fi
fi

# 4. Verify Understand-Anything
UA_CACHE="$HOME/.claude/plugins/cache/understand-anything"
if [ -d "$UA_CACHE" ]; then
  ok "Understand-Anything plugin cached"
else
  warn "Understand-Anything not installed. In Claude Code: /plugin install understand-anything"
fi

# 5. Karpathy
if grep -q "Think Before Coding" CLAUDE.md 2>/dev/null; then
  ok "Karpathy principles active in CLAUDE.md"
else
  warn "CLAUDE.md not found or missing Karpathy principles"
fi

echo ""
echo -e "${GREEN}Omni-Fusion setup complete!${NC}"
echo -e "Next: copy CLAUDE.md and AGENTS.md to your project root"
echo -e "Then: start a fresh Claude Code session"
echo -e "For Understand-Anything: run in Claude Code → /plugin install understand-anything"
echo ""
