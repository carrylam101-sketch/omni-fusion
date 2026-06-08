# Omni-Fusion Architecture

This document explains how 5 independent open-source projects wire together into one unified agent operating system.

## What Omni-Fusion Is

Omni-Fusion is **NOT a rewrite** of any project. It is the **wiring layer** — a shared CLAUDE.md, shared AGENTS.md, shared installer, and shared configuration that teaches any AI agent how to use all 5 projects as one system.

## The 5 Projects

| # | Project | Creator | Core Tech | What It Does |
|---|---------|---------|-----------|-------------|
| 1 | **CodeGraph** | colbymchenry | tree-sitter + SQLite + MCP | Fast local AST knowledge graph |
| 2 | **Understand-Anything** | Lum1104 | LLM agents + React dashboard | Multi-agent code understanding with visual graph |
| 3 | **ECC** | affaan-m | Markdown agents + skills + hooks | Complete agent operator system |
| 4 | **gstack** | garrytan | Bun + SKILL.md templates | Virtual engineering team sprint |
| 5 | **Karpathy Skills** | multica-ai | Single CLAUDE.md | 4 behavioral principles |

## Fusion Points

### Point 1: CodeGraph → Understand-Anything (Structural → Semantic)
```
CodeGraph Index (.codegraph/)  ──►  Understand-Anything knowledge-graph.json
      │                                    │
      ▼                                    ▼
  AST nodes (deterministic)          LLM summaries (semantic)
  SQLite FTS5 search                 Plain-English explanations
  Callers/callees/impact             Domain tours + arch layers
```
**How**: Run `codegraph init -i` first for fast AST indexing, then `/understand` for LLM enrichment. The two graphs complement each other — CodeGraph gives you precision, Understand-Anything gives you meaning.

### Point 2: CodeGraph → ECC Agents (Code Intelligence)
```
ECC agent needs code context
        │
        ▼
  codegraph query "symbol"     ──►  ECC agent uses results
  codegraph callers "func"          in code review, planning,
  codegraph callees "func"          build resolution, etc.
```
**How**: ECC agents call CodeGraph's MCP tools as their source of code intelligence instead of using grep/glob.

### Point 3: ECC Agents → gstack Workflow (Implementation → Release)
```
gstack office-hours "idea"
gstack plan-ceo-review
gstack plan-eng-review
        │
        ▼  (pushes implementation to ECC)
ECC planner → tdd-guide → code-reviewer → security-reviewer
        │
        ▼  (pushes back to gstack for release)
gstack /review → /qa → /ship → /land-and-deploy → /retro
```
**How**: gstack owns the product workflow; ECC owns the technical implementation. gstack dispatches to ECC agents during the build phase.

### Point 4: Karpathy Principles → All Agents
```
Every session starts with:
  1. Think Before Coding  (assumptions → questions → tradeoffs)
  2. Simplicity First      (minimum viable code)
  3. Surgical Changes      (touch only what you must)
  4. Goal-Driven           (tests → verify → loop)
```
**How**: The CLAUDE.md applies these principles universally. Every project's own CLAUDE.md rules layer on top.

## Installation Matrix

| Project | Install Command | Creates |
|---------|---------------|---------|
| CodeGraph | `npm install -g @colbymchenry/codegraph` | `.codegraph/` + MCP server |
| Understand-Anything | `/plugin install understand-anything` (in Claude Code) | Plugin cache |
| ECC | `npm install -g ecc-universal && ecc install --profile developer --target claude` | `~/.claude/agents/`, `~/.claude/skills/`, `~/.claude/rules/`, `~/.claude/hooks/` |
| gstack | `git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack` | `~/.claude/skills/gstack/` |
| Karpathy | Already applied — this PROJECT's CLAUDE.md | `CLAUDE.md` |

One-liner for all:
```bash
npm install -g @colbymchenry/codegraph && \
npm install -g ecc-universal && \
ecc install --profile developer --target claude && \
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
# Then in Claude Code: /plugin install understand-anything
```

## File Layout After Fusion

```
project/
├── CLAUDE.md                      # Omni-Fusion (Karpathy + orchestration)
├── AGENTS.md                      # Omni-Fusion agent dispatch
├── fuse.json                      # Machine-readable fusion manifest
├── package.json                   # Meta-package metadata
├── install.ps1                    # Windows installer
├── install.sh                     # Unix/Mac installer
├── mcp-bridge/
│   └── omni-fusion.json           # MCP bridge config
├── scripts/
│   ├── co-install.js              # Node.js co-installer
│   ├── check-install.js           # Installation verification
│   └── build-docs.js              # Documentation generator
└── .codegraph/                    # CodeGraph index
    └── codegraph.db               # SQLite AST database
```

## Running Order for Common Scenarios

### Onboard to a new codebase
```
1. codegraph init -i                    # Fast AST index (2-30s)
2. /understand                          # LLM enrichment (30-120s)
3. /understand-dashboard                # Interactive visual exploration
4. /understand-chat "explain arch"      # Ask questions
5. codegraph query "auth"               # Quick symbol lookup
```

### Ship a new feature
```
1. /office-hours "idea"                 # Product ideation
2. /plan-ceo-review                     # Strategic scope
3. /plan-eng-review                     # Architecture + test matrix
4. /plan-design-review                  # Design audit
5. ECC: planner → tdd-guide → code-reviewer → security-reviewer
6. /review                              # Review readiness
7. /qa <url>                            # QA with browser automation
8. /ship                                # Test bootstrap + coverage + ship
9. /land-and-deploy                     # Deploy to production
10. /document-release                   # Update all docs
11. /retro                              # Reflect on what shipped
```

### Debug a production bug
```
1. /investigate                         # Systematic root-cause
2. codegraph query "suspicious_fn"      # Find relevant code
3. /understand-explain "module"         # Deep dive
4. codegraph callees "suspicious_fn"    # Trace calls
5. ECC: tdd-guide → code-reviewer → security-reviewer
6. /qa <url>                            # Regression test
7. /ship                                # Deploy fix
```

## MCP Tool Sharing

CodeGraph's MCP server makes these tools available to ALL MCP-capable agents:
- `codegraph_search` — Symbol search
- `codegraph_context` — Node details
- `codegraph_callers` — Who calls
- `codegraph_callees` — What it calls
- `codegraph_impact` — Change impact
- `codegraph_files` — All indexed files
- `codegraph_status` — Index stats

ECC agents, gstack skills, and any MCP-aware tool can use these directly.
