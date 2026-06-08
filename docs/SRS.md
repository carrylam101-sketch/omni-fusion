# Omni-Fusion Software Requirements Specification v1.0

Derived from CLAUDE.md, FUSION.md, AGENTS.md, fuse.json, and source code.

## 1. Overview

Omni-Fusion is a **wiring layer** (not a rewrite) that fuses 5 independent open-source projects — CodeGraph, Understand-Anything, ECC, gstack, Karpathy Skills — into one orchestrated AI agent system.

## 2. Functional Requirements

### FR1: CLI Tool (`of`)

| ID | Requirement | Priority |
|----|------------|----------|
| FR1.1 | `of status` — Show installation status of all 5 components | P0 |
| FR1.2 | `of understand [path]` — Analyze codebase: index, stats, structure, agents | P0 |
| FR1.3 | `of review <file> [files...]` — Code review with CodeGraph context + ECC reviewer | P0 |
| FR1.4 | `of plan "feature"` — Generate sprint plan with gstack + ECC agents | P0 |
| FR1.5 | `of help` — Show usage and examples | P1 |
| FR1.6 | All commands handle errors gracefully (no stack traces to user) | P0 |
| FR1.7 | Exit code 0 on success, non-zero on failure | P0 |

### FR2: CodeGraph Integration

| ID | Requirement | Priority |
|----|------------|----------|
| FR2.1 | Wrap `codegraph status/query/callers/callees/impact/files/init/sync` via safe spawn | P0 |
| FR2.2 | Detect installation status (isInstalled) with < 3s timeout | P0 |
| FR2.3 | Cross-platform: Windows (spawn .cmd via execSync) and Unix/Mac (spawnSync) | P0 |
| FR2.4 | No shell injection via args array or safe escaping | P0 |

### FR3: ECC Integration

| ID | Requirement | Priority |
|----|------------|----------|
| FR3.1 | List all ECC agents from `~/.claude/agents/` | P0 |
| FR3.2 | Load individual agent by name (purpose + content) | P0 |
| FR3.3 | Map file extensions to language-specific reviewers (ts→typescript-reviewer, py→python-reviewer, etc.) | P0 |
| FR3.4 | Build review prompt: source code + CodeGraph context + agent instructions | P0 |
| FR3.5 | Output review artifact to `.of-reviews/` directory | P1 |

### FR4: gstack Integration

| ID | Requirement | Priority |
|----|------------|----------|
| FR4.1 | Generate sprint plan following Think→Plan→Build→Ship→Reflect phases | P0 |
| FR4.2 | Map each step to ECC agents where applicable (planner, tdd-guide, code-reviewer, etc.) | P0 |
| FR4.3 | Save plan to `.of-plans/` directory | P1 |
| FR4.4 | Detect gstack installation at `~/.claude/skills/gstack` | P1 |

### FR5: Installation Scripts

| ID | Requirement | Priority |
|----|------------|----------|
| FR5.1 | `install.ps1` — Windows PowerShell installer for all 5 components | P0 |
| FR5.2 | `install.sh` — Unix/Mac bash installer for all 5 components | P0 |
| FR5.3 | `co-install.js` — Node.js co-installer with --status and --all modes | P0 |
| FR5.4 | `check-install.js` — Verify all 5 components are installed | P0 |
| FR5.5 | `build-docs.js` — Generate ARCHITECTURE.md from fuse.json | P1 |
| FR5.6 | All installers are cross-platform (no Unix-only syntax on Windows) | P0 |

### FR6: Configuration

| ID | Requirement | Priority |
|----|------------|----------|
| FR6.1 | `fuse.json` — Machine-readable manifest with install commands and fusion points | P0 |
| FR6.2 | `mcp-bridge/omni-fusion.json` — MCP server config for CodeGraph | P1 |
| FR6.3 | `CLAUDE.md` — Agent dispatch + Karpathy principles | P0 |
| FR6.4 | `AGENTS.md` — Cross-project agent dispatch table | P0 |

## 3. Non-Functional Requirements

### NFR1: Security

| ID | Requirement | Priority |
|----|------------|----------|
| NFR1.1 | No shell injection via CLI args or CodeGraph queries | P0 |
| NFR1.2 | No hardcoded secrets, tokens, or keys | P0 |
| NFR1.3 | No path traversal vulnerabilities | P0 |
| NFR1.4 | Child process timeouts prevent hanging | P0 |
| NFR1.5 | All file operations wrapped in try/catch | P1 |

### NFR2: Reliability

| ID | Requirement | Priority |
|----|------------|----------|
| NFR2.1 | Graceful degradation when components missing (informative warnings) | P0 |
| NFR2.2 | Non-zero exit code on any failure | P0 |
| NFR2.3 | UTF-8 safe string handling throughout | P0 |
| NFR2.4 | All spawned processes have timeouts | P0 |

### NFR3: Maintainability

| ID | Requirement | Priority |
|----|------------|----------|
| NFR3.1 | No fake data, hardcoded counts, or mock algorithms | P0 |
| NFR3.2 | Dead code removed | P1 |
| NFR3.3 | Consistent error handling pattern (try/catch with informative messages) | P1 |
| NFR3.4 | Cross-platform compatible (Windows PowerShell + Unix bash) | P0 |

### NFR4: Compatibility

| ID | Requirement | Priority |
|----|------------|----------|
| NFR4.1 | Node.js ≥ 18.0.0 | P0 |
| NFR4.2 | Works with Claude Code, Codex, OpenCode, Cursor, Gemini CLI, Copilot, Zed, Hermes | P1 |
| NFR4.3 | No dependencies beyond Node.js stdlib + npm packages for components | P0 |

## 4. Data Requirements

| ID | Requirement | Priority |
|----|------------|----------|
| DR1 | Review artifacts stored in `.of-reviews/` (gitignored) | P1 |
| DR2 | Sprint plans stored in `.of-plans/` (gitignored) | P1 |
| DR3 | CodeGraph index stored in `.codegraph/` (gitignored) | P0 |
| DR4 | ECC agents read-only from `~/.claude/agents/` | P0 |
