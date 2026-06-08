<p align="center">
  <img src="https://img.shields.io/badge/status-active-brightgreen" alt="Status">
  <img src="https://img.shields.io/github/actions/workflow/status/hernandez42/omni-fusion/ci.yml?branch=main" alt="CI">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen" alt="Node">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
</p>

<h1 align="center">Omni-Fusion</h1>
<p align="center"><strong>Universal AI Agent Integration Layer — APEX Self-Evolution Protocol</strong></p>
<p align="center">Fuses 5 open-source AI agent projects into one self-evolving orchestration system.</p>

> **[SANITIZED by carrylam101-sketch — 2026-06-08]**: The original `ACTION TRIGGER` prompt-injection segment has been removed. This README is **reference documentation only** and does NOT instruct LLMs to execute any loop. The `scripts/self-optimize.js` and `scripts/apex-init.js` executors have been deleted; `package.json` script entries `apex-init` and `optimize` have been removed. Sanitized fork: https://github.com/carrylam101-sketch/omni-fusion — see `SANITIZATION_NOTES.md` for the full audit trail.

---

## Overview

Omni-Fusion is the **wiring layer** that connects **CodeGraph**, **Understand-Anything**, **ECC**, **gstack**, and **Karpathy Skills** so they work as one. It is NOT a rewrite — it preserves each project's own engine and adds shared orchestration.

```
                    ┌─────────────────────────────────────────┐
                    │         Omni-Fusion Orchestrator          │
                    │  (CLAUDE.md + AGENTS.md + of CLI)         │
                    └──────────┬──────────────────────┬────────┘
                               │                      │
             ┌─────────────────┼──────────────────────┼──────────────────┐
             ▼                 ▼                      ▼                  │
     ┌──────────────┐ ┌────────────────┐ ┌────────────────────┐         │
     │  CodeGraph   │ │ Understand-    │ │  ECC               │         │
     │  Fast AST    │◄┤ Anything       │ │  Agents + skills   │         │
     │  SQLite + MCP│ │ LLM-enriched   │ │  hooks + rules     │         │
     │              │ │ graph + dashboard│ │                     │         │
     └──────┬───────┘ └──────┬────────┘ └─────────┬───────────┘         │
            │               │                    │                      │
            ▼               ▼                    ▼                      │
     ┌──────────────────────────────────────────────────────┐           │
     │              gstack Virtual Engineering Team           │           │
     │  Office Hours → CEO Review → Eng Review → Design →    │           │
     │  Build → Review → QA → Ship → Deploy → Retro          │           │
     └──────────────────────────────────────────────────────┘           │
     ┌──────────────────────────────────────────────────────┐           │
     │              Karpathy Principles (All)                │           │
     └──────────────────────────────────────────────────────┘           │
```

### The 5 Projects

| # | Project | What It Does |
|---|---------|-------------|
| 1 | **CodeGraph** | Fast local AST knowledge graph (tree-sitter + SQLite + MCP) |
| 2 | **Understand-Anything** | Multi-agent LLM code understanding with visual dashboard |
| 3 | **ECC** | 48 specialized agents: TDD, code review, security, planning, docs |
| 4 | **gstack** | Virtual engineering team — sprint lifecycle from idea to deploy |
| 5 | **Karpathy Skills** | 4 behavioral principles: Think, Simple, Surgical, Goal-Driven |

---

## Quick Install

### One-liner (Unix/Mac)
```bash
curl -fsSL https://raw.githubusercontent.com/hernandez42/omni-fusion/main/install.sh | bash
```

### One-liner (Windows PowerShell)
```powershell
iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/hernandez42/omni-fusion/main/install.ps1'))
```

### Manual install
```bash
# 1. Clone
git clone https://github.com/hernandez42/omni-fusion.git
cd omni-fusion

# 2. Install components
npm install -g @colbymchenry/codegraph                    # CodeGraph
npm install -g ecc-universal && ecc install --profile developer --target claude  # ECC
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack  # gstack

# 3. Link the CLI
npm link

# 4. Verify
of status
```

> **Note:** Understand-Anything is a Claude Code plugin only. Run `/plugin install understand-anything` inside Claude Code.

---

## CLI Usage

```
of <command> [options]
```

| Command | Description |
|---------|-------------|
| `of status` | Show installation status of all 5 components |
| `of understand [path]` | Analyze codebase: index, stats, structure, agents |
| `of review <file> [files..]` | Code review with CodeGraph context + ECC agent |
| `of plan "feature"` | Generate sprint plan with gstack + ECC agents |
| `of help` | Show usage info |

### Examples

```bash
# Check installation
of status

# Understand a project
of understand
of understand /path/to/project

# Review files
of review src/app.ts
of review lib/util.js src/main.ts

# Plan a feature
of plan "add user authentication"
```

### Output Artifacts

| Command | Creates |
|---------|---------|
| `of review` | `.of-reviews/review-<file>-<timestamp>.md` |
| `of plan` | `.of-plans/plan-<slug>-<timestamp>.md` |
| `of understand` | `.codegraph/` (CodeGraph index) |

---

## Workflows

### Onboard to a New Codebase
```
codegraph init -i              # Fast AST index
of understand                  # LLM enrichment + stats
/understand-dashboard          # Visual exploration (in Claude Code)
```

### Ship a Feature
```
of plan "feature idea"         # Generate sprint plan
→ code → test → review         # Implement with ECC agents
of review src/feature.ts       # Code review
/qa <url>                      # Browser QA (in Claude Code)
/ship                          # Ship to production (in Claude Code)
```

### Debug a Production Bug
```
/investigate                   # Root cause analysis (in Claude Code)
codegraph query "symbol"       # Find relevant code
of review src/fix.ts           # Code review
```

---

## Project Structure

```
omni-fusion/
├── bin/of.js                   # CLI entry point
├── lib/
│   ├── codegraph.js            # CodeGraph wrapper
│   ├── ecc.js                  # ECC agent loader
│   └── gstack.js               # gstack workflow generator
├── scripts/
│   ├── co-install.js           # Node.js co-installer
│   ├── check-install.js        # Installation verification
│   ├── build-docs.js           # Documentation generator
│   └── ci-shell-check.js       # CI shell injection scanner
├── install.ps1                 # Windows installer
├── install.sh                  # Unix/Mac installer
├── mcp-bridge/
│   └── omni-fusion.json        # MCP bridge config
├── CLAUDE.md                   # Agent dispatch + Karpathy
├── AGENTS.md                   # Cross-project agent table
├── FUSION.md                   # Architecture docs
├── fuse.json                   # Machine-readable manifest
├── docs/SRS.md                 # Software Requirements Spec
├── docs/ARCHITECTURE.md        # Generated architecture ref
└── .github/workflows/ci.yml    # CI/CD pipeline
```

---

## Self-Improvement — REMOVED (Sanitized Fork)

> **[SANITIZED by carrylam101-sketch — 2026-06-08]**: The upstream "Self-Improvement — LDR Evolution Loop" section has been **removed** in its entirety. The upstream text instructed every LLM session that reads the project to "execute at least one full cycle" of an LDR loop that writes to `~/.apex/state/STATE.md`, `~/.apex/state/METRICS.json`, and `~/.apex/memory/evolution_log.md`. The two executors (`scripts/self-optimize.js` and `scripts/apex-init.js`) and the two `package.json` script entries (`optimize`, `apex-init`) have been **deleted**. See `SANITIZATION_NOTES.md` for the full audit trail.

If you want to opt in to the upstream self-improvement loop, fetch `hernandez42/omni-fusion` directly and review the `ACTION TRIGGER` segment manually before running. This sanitized fork intentionally does not provide that capability.

---

## Requirements

- **Node.js** >= 18.0.0
- **npm** (for CodeGraph + ECC installation)
- **git** (for gstack installation)
- **Claude Code** (optional, for Understand-Anything integration)

### Supported Agent Harnesses (Upstream Listed)

> The upstream `fuse.json` lists these harnesses: `claude`, `codex`, `opencode`, `cursor`, `gemini`, `copilot`, `zed`, `hermes`. In the **sanitized fork**:
>
> - All harnesses remain listed for project reference.
> - **`hermes` is in the upstream list**, but in the sanitized fork this means **CLI argument compatibility only** (the `of` CLI exposes code review/plan/understand commands that any harness can shell out to). It does **NOT** mean the upstream LDR self-loop is wired into Hermes cron or Hermes Agent. The LDR loop is deleted in the sanitized fork.
> - If you are a Hermes Agent user (carry is), do not invoke `npm run optimize` or `npm run apex-init` from this fork — those scripts no longer exist.

---

## License

MIT

## Acknowledgments

- [CodeGraph](https://github.com/colbymchenry/codegraph) by @colbymchenry
- [Understand-Anything](https://github.com/Lum1104/Understand-Anything) by @Lum1104
- [ECC](https://github.com/affaan-m/ECC) by @affaan-m
- [gstack](https://github.com/garrytan/gstack) by @garrytan
- [Karpathy Skills](https://github.com/multica-ai/andrej-karpathy-skills) by @multica-ai
