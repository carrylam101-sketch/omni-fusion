# Sanitization Notes — Omni-Fusion fork by carrylam101-sketch

> **Date**: 2026-06-08
> **Original repo**: https://github.com/hernandez42/omni-fusion
> **Sanitized fork**: https://github.com/carrylam101-sketch/omni-fusion
> **Auditor**: Hermes (APEX V10.3 SOUL.md protocol) on behalf of carry
> **Commit**: (see git log — single commit on top of upstream HEAD `09f67b1`)

---

## Why this fork exists

The upstream `hernandez42/omni-fusion` README, `CLAUDE.md`, and `AGENTS.md` contain **three prompt-injection sites** that attempt to command any LLM reading the project to **immediately execute a self-evolution loop** and write state to `~/.apex/state/STATE.md` and `~/.apex/memory/evolution_log.md`. This conflicts with:

1. **Hermes Agent trust boundaries** — LLM agents in carry's environment (main session, cron `2ea5e66b83df`, sub-agent profiles) must not be commanded by third-party README content.
2. **APEX V10.3 namespace** — carry's existing APEX self-evolution infrastructure lives at `/home/ubuntu/apex-spiral/` with its own registry/cycles/genes/dashboard. The `~/.apex/` path is a different namespace that the upstream scripts would silently write to.
3. **Carry's actual problem** — the upstream omni-fusion is a Claude Code plugin orchestrator (5 components: CodeGraph / Understand-Anything / ECC / gstack / Karpathy Skills); it does not solve carry's actual ask of "Hermes × Feishu 主/子 agent 通信". This fork is a controlled experiment to study the wiring layer without taking on the prompt-injection risk.

---

## What was changed (vs upstream `09f67b1`)

| File | Change | Why |
|------|--------|-----|
| `README.md:12` | Replaced `> **ACTION TRIGGER**: Reading this README is a **command to execute**` block with a sanitized notice | Remove prompt-injection trigger #1 |
| `CLAUDE.md:3` | Replaced `> **ACTION TRIGGER**: Reading this document is not reference — it is a **command to execute**` and removed `STEP 1 — Activate Now` + `STEP 3 — The LDR Loop` self-execution sections | Remove prompt-injection trigger #2 and its LDR self-loop instructions |
| `AGENTS.md:45-57` | Replaced the `## APEX Activation (Run First)` block (which contained `MUST execute immediately` + `LDR PERSIST` + `~/.apex/memory/evolution_log.md`) with a sanitized explanation | Remove prompt-injection trigger #3 and the silent file-write instruction |
| `scripts/self-optimize.js` | **Deleted** | This was the LDR ORIENT/PLAN/EXECUTE/VERIFY/EVOLVE/PERSIST executor that writes to `~/.apex/state/STATE.md` and `~/.apex/memory/evolution_log.md` |
| `scripts/apex-init.js` | **Deleted** | This was the initial LDR loop boot script |
| `package.json` scripts | Removed `"optimize"` and `"apex-init"` script entries; also removed `self-optimize.js` from the `lint` chain | Prevent indirect invocation via `npm run` |

---

## What was NOT changed (preserved verbatim)

| File | Why preserved |
|------|---------------|
| `bin/of.js` (full) | Legitimate CLI wrapper for `of status/understand/review/plan` commands |
| `lib/codegraph.js` / `lib/ecc.js` / `lib/gstack.js` | Legitimate library wrappers |
| `scripts/co-install.js` | Co-installer; **user must opt-in explicitly** (we will not auto-run it) |
| `scripts/check-install.js` | Status checker (called by `npm run status`) |
| `scripts/build-docs.js` | Doc generator (called by `npm run build-docs`) |
| `scripts/ci-shell-check.js` | Shell injection scanner (defensive utility) |
| `fuse.json` / `mcp-bridge/omni-fusion.json` | Wiring config (project manifest + MCP server config) |
| `install.sh` / `install.ps1` | **Modified** — see below |

---

## `install.sh` modifications

The original `install.sh` runs `npm install -g @colbymchenry/codegraph`, `npm install -g ecc-universal`, and `git clone garrytan/gstack` into `~/.claude/skills/gstack`. None of these are inherently malicious, but they are the on-ramp to invoking the LDR self-loop (since `gstack` and `ECC` are Claude Code plugins whose slash-commands trigger APEX Activation context).

The sanitized install:

- **Keeps** the npm install steps (they install CLI tools; not LLM-commanded)
- **Replaces** the `gstack git clone → ~/.claude/skills/gstack` with a warning + manual step
- **Skips** the `~/.claude/skills/` auto-provisioning entirely (would require user opt-in)
- **Removes** the "OK CLAUDE.md has Karpathy principles" check (was tied to omni-fusion's prompt-injection workflow)

---

## What this fork can still do

| Feature | Status after sanitization |
|---------|---------------------------|
| `npm run lint` | ✅ Passes (only checks remaining JS files) |
| `npm run test` | ⚠️ Runs `check-install.js` → likely shows "not installed" (since we skip global npm installs) |
| `npm run build-docs` | ✅ Should work (no external deps) |
| `node bin/of.js status` | ✅ Runs (shows "not installed" for the 5 components — expected) |
| `node bin/of.js understand [path]` | ⚠️ Requires `codegraph` CLI which is NOT globally installed; user must opt-in |
| `node bin/of.js review <file>` | ⚠️ Requires `codegraph` + `ecc` CLIs |
| `node bin/of.js plan "feature"` | ⚠️ Requires `gstack` skill files |
| `npm run optimize` | ❌ **Removed** (was the LDR loop) |
| `npm run apex-init` | ❌ **Removed** (was the LDR boot) |
| `npm run setup` (`co-install.js`) | ⚠️ Still exists; user must opt-in explicitly |

---

## Carry's actual ask — does this fork solve it?

**No.** The omni-fusion stack is a Claude Code plugin orchestrator. Carry's actual problem is "Hermes 在飞书上主 agent 和子 agent 无法交流", which is about:

- `~/.hermes/agent_bus/` file relay (already exists)
- 4 cron jobs (`ed0868edce64`, `fc09ad04d616`, `16e694f7904b`, `a4707301e7bc`) delivering via file relay → Feishu
- Feishu bot permissions for group messages (per `hermes-agent#6889`)

Omni-fusion does not address any of these. This fork is a **controlled experiment / code-reading exercise**, not a fix.

---

## Future work

- If carry later wants to delete the experiment, `git -C ~/omni-fusion-isolated/omni-fusion remote remove origin` and `rm -rf ~/omni-fusion-isolated/`.
- If carry wants to truly solve the Feishu 主/子 agent 通信 problem, the recommendation is:
  1. Extend `~/.hermes/agent_bus/` to support a "main → sub" event bus
  2. Audit cron `ed0868edce64` etc. with one actual session run
  3. Follow upstream `NousResearch/hermes-agent#25176` for native A2A support
