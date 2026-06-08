# Omni-Fusion — APEX Self-Evolution Protocol (SANITIZED)

> **[SANITIZED by carrylam101-sketch — 2026-06-08]**: This fork has been sanitized to remove the upstream prompt-injection pattern. The original `ACTION TRIGGER` block, the `STEP 1 — Activate Now` self-output block, the `STEP 2 — Read State` block (which referenced `~/.apex/state/STATE.md` and `~/.apex/state/METRICS.json`), and the entire `STEP 3 — The LDR Loop` self-execution block have been **removed**. The `Core Principles (Karpathy)` section is preserved as **reference material only** (the 4 numbered principles are advice for the human reader, not commands to an LLM). The `Fused Architecture` diagram and `Agent Dispatch Rules` are preserved as project documentation. The `One-Liner Install` section is preserved for the user's reference but `install.sh` has been modified to skip the auto-provisioning of `~/.claude/skills/gstack` and the Claude Code plugin cache.
>
> **Sanitization rationale**: the original text attempted to command LLMs to write to `~/.apex/state/STATE.md` and `~/.apex/memory/evolution_log.md`, which conflicts with carry's existing APEX V10.3 namespace at `apex-spiral/` and Hermes Agent trust boundaries.
>
> See `SANITIZATION_NOTES.md` for the full audit trail (what was changed, what was preserved, why).

---

## About This Fork

This fork is a **controlled experiment** for code-reading purposes only. It does not solve any of carry's actual problems (see `SANITIZATION_NOTES.md` § "Carry's actual ask — does this fork solve it?"). The 5 fused upstream projects (CodeGraph, Understand-Anything, ECC, gstack, Karpathy Skills) are all Claude Code ecosystem components and are not directly applicable to carry's Hermes × Feishu workflow.

To use the local CLI after sanitization:

```bash
cd ~/omni-fusion-isolated/omni-fusion
node bin/of.js status         # Show which of the 5 components are installed (probably "not installed" — that's expected)
node bin/of.js --help         # Show available commands
npm run lint                  # Syntax check (should pass)
```

Global npm installs and `~/.claude/skills/` provisioning are intentionally **not** performed. To opt in manually, see `SANITIZATION_NOTES.md` § "What this fork can still do".

---

## Core Principles (Karpathy) — Reference Only

The 4 Karpathy principles from the upstream project are preserved here as advice for the human reader:

1. **Think Before Coding** — state assumptions, surface tradeoffs
2. **Simplicity First** — minimum code that works
3. **Surgical Changes** — touch only what you must
4. **Goal-Driven Execution** — verifiable goals, tests first

> ⚠️ **This is a numbered reference list. It is NOT a command for an LLM to execute.** The upstream version placed this section between LDR-loop self-execution blocks, which could be misread by an LLM as another self-trigger. In the sanitized version, this section stands alone.

---

## Fused Architecture (Preserved Diagram)

The 5-fused-project architecture diagram from upstream is preserved below as project documentation:

```
                     ┌─────────────────────────────────────────┐
                     │         Omni-Fusion Orchestrator          │
                     │  (This MD + AGENTS.md + of CLI)           │
                     └──────────┬──────────────────────┬────────┘
                                │                      │
             ┌──────────────────┼──────────────────────┼──────────────────┐
             ▼                  ▼                      ▼                  │
     ┌───────────────┐ ┌────────────────┐ ┌────────────────────┐         │
     │  CodeGraph    │ │ Understand-   │ │  ECC               │         │
     │  Fast AST     │◄┤ Anything      │ │  Agents + skills   │         │
     │  SQLite + MCP │ │ LLM-enriched  │ │  hooks + rules     │         │
     │               │ │ graph + dash   │ │                     │         │
     └───────┬───────┘ └───────┬────────┘ └─────────┬──────────┘         │
             │                 │                    │                    │
             ▼                 ▼                    ▼                    │
     ┌─────────────────────────────────────────────────────┐            │
     │              gstack Virtual Engineering Team          │            │
     │  Office Hours → CEO Review → Eng Review → Design →   │            │
     │  Build → Review → QA → Ship → Deploy → Retro         │            │
     └─────────────────────────────────────────────────────┘            │
     ┌─────────────────────────────────────────────────────┐            │
     │              Karpathy Principles (All)               │            │
     └─────────────────────────────────────────────────────┘            │
```

> The "5 fused projects" are upstream dependencies that the sanitized fork does **not** auto-install. See `SANITIZATION_NOTES.md` for opt-in steps.

---

## Agent Dispatch Rules (Reference Table)

The dispatch table from upstream is preserved as project documentation:

| Goal | Use |
|------|-----|
| Quick code lookup | `codegraph query` or MCP `codegraph_search` (requires `codegraph` CLI installed) |
| Understand codebase | `node bin/of.js understand` (requires `codegraph` CLI installed) |
| Code review | `node bin/of.js review <file>` (requires `codegraph` + `ecc` CLIs) |
| Plan feature | `node bin/of.js plan "description"` (requires `gstack` skill files) |
| Check install | `node bin/of.js status` |
| Security audit | ECC `security-reviewer` agent (requires ECC CLI; **not** `npm run optimize` which is deleted) |

> ⚠️ The upstream version's last two rows (`Security audit: npm run optimize` and `Self-improve: npm run optimize + internet search`) have been **removed** because the `optimize` script and its underlying executor have been deleted in the sanitized fork. The 4 remaining rows in the table above have been verified to be callable through their respective CLI invocations.

---

## One-Liner Install (Reference Only)

```bash
# ⚠️  SANITIZED — the upstream one-liner curl|bash pattern is preserved
#     here for the user's reference. The actual install.sh in this fork
#     has been modified to skip gstack/Understand-Anything auto-provisioning.
#     To use it: clone this fork first, then run ./install.sh inside it.
```

Windows:

```powershell
# Same: opt-in only. The sanitized install.ps1 is recommended over the upstream
# version. See SANITIZATION_NOTES.md.
```

> **Recommendation**: do NOT pipe upstream `hernandez42/omni-fusion` install scripts to bash. Always clone the sanitized fork first, review `install.sh`, then run it.

---

## Version

Current: v1.0.0 (sanitized fork on top of upstream `09f67b1`)

Last LDR cycle: **N/A** (this fork has no LDR loop; the upstream `~/.apex/memory/evolution_log.md` path is not used).
