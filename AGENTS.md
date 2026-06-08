# Omni-Fusion Agent Dispatch

This AGENTS.md defines all agents available across the 5 fused projects. It teaches AI agents which tool to call for which job, and in what order to chain projects together.

## Fused Agent Table (35 Total)

| Name | Source | Phase | Description | How to Call |
|------|--------|-------|-------------|-------------|
| `project-scanner` | Understand-Anything | explore | Discover files, detect languages/frameworks | `/understand` triggers this automatically |
| `file-analyzer` | Understand-Anything | explore | Extract functions, classes, imports; produce graph nodes | `/understand` triggers this automatically |
| `architecture-analyzer` | Understand-Anything | explore | Identify layers, patterns, architectural boundaries | `/understand` triggers this automatically |
| `tour-builder` | Understand-Anything | explore | Build guided architecture walkthroughs | `/understand` triggers this automatically |
| `graph-reviewer` | Understand-Anything | explore | Validate graph quality and completeness | `/understand` triggers this automatically |
| `domain-analyzer` | Understand-Anything | explore | Extract business domain knowledge | `/understand-domain` |
| `office-hours` | gstack | plan | Product ideation, framing, alternative generation | `/office-hours` |
| `plan-ceo-review` | gstack | plan | Strategic review, scope decisions | `/plan-ceo-review` |
| `plan-eng-review` | gstack | plan | Architecture decisions, ASCII diagrams, test matrices | `/plan-eng-review` |
| `plan-design-review` | gstack | plan | UX/design audit, AI slop detection | `/plan-design-review` |
| `autoplan` | gstack | plan | Auto pipeline: CEO → design → eng review | `/autoplan` |
| `planner` | ECC | plan | Implementation planning, task breakdown | See ECC planners agent |
| `architect` | ECC | plan | System design and scalability decisions | See ECC architect agent |
| `tdd-guide` | ECC | build | Test-driven development specialist | See ECC tdd-guide agent |
| `code-reviewer` | ECC | review | Code quality and maintainability review | See ECC code-reviewer agent |
| `security-reviewer` | ECC | review | Vulnerability detection, AgentShield scan | See ECC security-reviewer agent |
| `typescript-reviewer` | ECC | review | TypeScript/JS code review | See ECC typescript-reviewer agent |
| `python-reviewer` | ECC | review | Python code review | See ECC python-reviewer agent |
| `go-reviewer` | ECC | review | Go code review | See ECC go-reviewer agent |
| `rust-reviewer` | ECC | review | Rust code review | See ECC rust-reviewer agent |
| `java-reviewer` | ECC | review | Java code review | See ECC java-reviewer agent |
| `cpp-reviewer` | ECC | review | C/C++ code review | See ECC cpp-reviewer agent |
| `build-error-resolver` | ECC | build | Diagnose and fix build errors | See ECC build-error-resolver agent |
| `refactor-cleaner` | ECC | build | Dead code cleanup and refactoring | See ECC refactor-cleaner agent |
| `doc-updater` | ECC | ship | Documentation and codemap updates | See ECC doc-updater agent |
| `harness-optimizer` | ECC | build | Cross-harness optimization advice | See ECC harness-optimizer agent |
| `review` | gstack | review | Review readiness dashboard | `/review` |
| `qa` | gstack | qa | End-to-end QA with browser automation | `/qa <url>` |
| `ship` | gstack | ship | Production ship with test bootstrap, coverage audit | `/ship` |
| `land-and-deploy` | gstack | ship | Merge → deploy → canary verify | `/land-and-deploy` |
| `canary` | gstack | ship | Post-deploy canary monitoring loop | `/canary` |
| `document-release` | gstack | ship | Cross-reference diff, update all docs | `/document-release` |
| `retro` | gstack | ship | Sprint retrospective | `/retro` |
| `cso` | gstack | review | OWASP Top 10 + STRIDE security audit | `/cso` |
| `investigate` | gstack | explore | Systematic root-cause debugging | `/investigate` |

## APEX Activation — REMOVED (SANITIZED 2026-06-08)

The original "APEX Activation (Run First)" section instructed any LLM reading this project to **MUST execute immediately** a sequence of npm scripts and internet searches. This has been **removed** in the sanitized fork (`carrylam101-sketch/omni-fusion`) for the following reasons:

1. **Prompt injection**: the section attempted to use README/MD content to command LLMs without user consent.
2. **Namespace pollution**: scripts targeted `~/.apex/state/STATE.md` and `~/.apex/memory/evolution_log.md`, which conflicts with carry's existing APEX V10.3 namespace at `apex-spiral/`.
3. **Silent file writes**: the section's "LDR PERSIST" line described auto-writing to user home without explicit user opt-in.

Replacement behavior: the `npm run apex-init` and `npm run optimize` package.json entries have been **deleted**, and the executors `scripts/self-optimize.js` and `scripts/apex-init.js` have been **deleted from the repository**. Omni-Fusion's other CLI commands (`of status`, `of understand`, `of review`, `of plan`) are unaffected and may be invoked explicitly by the user.

## Cross-Project Chaining Rules

When a task crosses project boundaries, chain in this order:

### 1. Code Understanding Workflow
```
codegraph init -i              # Build AST index (fast)
/understand                    # Enrich with LLM (deep)
/understand-dashboard          # Visual exploration
/understand-chat "question"    # Ask about codebase
```

### 2. Feature Development Workflow
```
/office-hours "idea"           # Product ideation
/plan-ceo-review               # Strategic scope
/plan-eng-review                # Architecture
/plan-design-review             # Design audit
→ then use ECC agents:
  planner → tdd-guide → code-reviewer → security-reviewer
→ then gstack:
  /review → /qa → /ship → /land-and-deploy → /document-release → /retro
```

### 3. Bug Investigation Workflow
```
/investigate                   # Root cause via gstack
codegraph query "symbol"       # Find relevant code
/understand-explain "module"   # Deep dive on suspicious area
→ fix → ECC code-reviewer → /qa → /ship
```

### 4. Code Review Workflow
```
codegraph callers "function"   # Impact analysis
/understand-diff               # Diff impact visualization
ECC code-reviewer              # Automated code review
/cso                           # Security audit
/review                        # Review readiness check
```

### 5. Code Intelligence (ECC agents using CodeGraph)
When any ECC agent (code-reviewer, build-error-resolver, etc.) needs code context:
```
codegraph query "symbol"       # Full-text search (CLI: codegraph query)
codegraph context "node_id"    # Full context (MCP tool only, no CLI equivalent)
codegraph callers "function"   # Who calls this (CLI: codegraph callers)
codegraph callees "function"   # What this calls (CLI: codegraph callees)
codegraph impact "file_path"   # Ripple effect (CLI: codegraph impact)
```
These are MCP tools — call them directly in the agent session.

## MCP Tools (Available via CodeGraph serve)

When `codegraph serve --mcp` is running, these tools are available to ALL agents:

- `codegraph_search(query)` — Full-text search across all symbols
- `codegraph_context(node_id)` — Full context: ancestors, children, references
- `codegraph_callers(node_id)` — Who calls this function
- `codegraph_callees(node_id)` — What this function calls
- `codegraph_impact(node_id)` — Ripple effect from changes
- `codegraph_files()` — List all indexed files
- `codegraph_status()` — Index health and stats
