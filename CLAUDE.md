# Omni-Fusion — Universal Agent Integration Layer

This file fuses **CodeGraph**, **Understand-Anything**, **ECC**, **gstack**, and **Karpathy Skills** into one orchestrated agent system. It is NOT a rewrite — it is the wiring layer that teaches any AI agent how to use all 5 together.

## Karpathy Principles (Apply to ALL sessions)

### 1. Think Before Coding
- State assumptions explicitly. If uncertain, ask — don't guess.
- Present multiple interpretations; surface tradeoffs.
- Push back on unclear requirements.

### 2. Simplicity First
- Minimum code that solves the problem. Nothing speculative.
- No abstractions for single-use code. No "flexibility" not requested.
- If you write 200 lines and it could be 50, rewrite it.

### 3. Surgical Changes
- Touch only what you must. Clean up only your own mess.
- Don't "improve" adjacent code, comments, or formatting.
- Every changed line traces directly to the request.

### 4. Goal-Driven Execution
- Transform tasks into verifiable goals.
- Multi-step plans with verification checkpoints.
- Write tests first for bugs and features.

## Fused Architecture

```
                    ┌─────────────────────────────────────────┐
                    │         Omni-Fusion Orchestrator          │
                    │  (This CLAUDE.md + AGENTS.md dispatch)    │
                    └──────────┬──────────────────────┬────────┘
                               │                      │
            ┌──────────────────┼──────────────────────┼──────────────────┐
            ▼                  ▼                      ▼                  │
    ┌───────────────┐ ┌────────────────┐ ┌────────────────────┐         │
    │  CodeGraph    │ │ Understand-   │ │  ECC               │         │
    │  Fast AST     │◄┤ Anything      │ │  Agents + skills   │         │
    │  SQLite + MCP │ │ LLM-enriched  │ │  hooks + rules     │         │
    │             │ │ graph + dashboard│ │                     │         │
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

## Component Roles

### CodeGraph (@colbymchenry/codegraph)
- **What**: Fast local AST knowledge graph. tree-sitter → SQLite (FTS5) → MCP server
- **When**: Quick symbol search, call graph, dependency analysis, impact analysis
- **Commands**: `codegraph init`, `codegraph index`, `codegraph serve`
- **MCP tools**: codegraph_search, codegraph_context, codegraph_callers, codegraph_callees, codegraph_impact, codegraph_status
- **Used by**: ECC agents for code intelligence; Understand-Anything for structural base graph

### Understand-Anything (Lum1104/Understand-Anything)
- **What**: Multi-agent LLM pipeline → interactive knowledge graph + dashboard
- **When**: Deep codebase understanding, onboarding, architecture tours, diff impact
- **Slash commands**: `/understand`, `/understand-dashboard`, `/understand-chat`, `/understand-diff`, `/understand-explain`, `/understand-onboard`, `/understand-domain`, `/understand-knowledge`
- **Pipeline**: 6 agents: project-scanner → file-analyzer → architecture-analyzer → tour-builder → graph-reviewer → domain-analyzer
- **Consumes**: CodeGraph's structural output as base; adds LLM semantics

### ECC (affaan-m/ECC)
- **What**: Complete agent operator system. Specialized agents, skills, hooks, rules, MCP configs
- **When**: Specialized subagents for TDD, code review, security, build resolution
- **Key agents**: planner, architect, tdd-guide, code-reviewer, security-reviewer, typescript-reviewer, python-reviewer, go-reviewer, rust-reviewer, java-reviewer, cpp-reviewer, build-error-resolver, refactor-cleaner, doc-updater
- **Uses**: CodeGraph MCP tools for code context; gstack for release workflow

### gstack (garrytan/gstack)
- **What**: Virtual engineering team. Sprint pipeline: Office Hours → Plan → Build → Review → QA → Ship → Retro
- **Slash commands**: `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/autoplan`, `/review`, `/qa`, `/ship`, `/canary`, `/land-and-deploy`, `/document-release`, `/retro`, `/cso`, `/investigate`, `/browse`
- **When**: Full product development lifecycle from idea to production
- **Uses**: ECC agents in build/review phase; CodeGraph for code analysis

### Karpathy Skills (multica-ai/andrej-karpathy-skills)
- **What**: 4 behavioral principles in this CLAUDE.md
- **When**: Every session, every task, everywhere

## Agent Dispatch Rules

| Your Goal | Use This |
|-----------|----------|
| Quick code lookup | `codegraph query` or MCP codegraph_search |
| Understand codebase | `/understand` → `/understand-dashboard` |
| Plan a feature | `/office-hours` → `/plan-ceo-review` → `/plan-eng-review` |
| Write production code | ECC tdd-guide → ECC code-reviewer → ECC security-reviewer |
| Review PR | `/review` |
| QA + Ship | `/qa` → `/ship` → `/land-and-deploy` |
| Debug issue | `/investigate` |
| Security audit | `/cso` or ECC security-reviewer |
| Impact analysis | codegraph impact or `/understand-diff` |
| Documentation | `/document-release` or ECC doc-updater |

## Installation (Co-install All 5)

```bash
# 1. CodeGraph
npm install -g @colbymchenry/codegraph

# 2. Understand-Anything
# In Claude Code: /plugin install understand-anything

# 3. ECC
npm install -g ecc-universal
ecc install --profile developer --target claude

# 4. gstack
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack

# 5. Karpathy Skills
# Already applied — this CLAUDE.md
```

## When CodeGraph feeds Understand-Anything

For best results, run CodeGraph BEFORE Understand-Anything:

```bash
codegraph init -i     # Build AST graph
/understand           # Enrich with LLM → dashboard
```

CodeGraph's structural graph becomes the base that Understand-Anything's LLM agents enrich. This is the fusion.
