# Omni-Fusion v1.0.0 — Architecture Reference

*Generated from fuse.json | 2026-06-08*

## Projects

| Project | Version | Install |
|---------|---------|---------|
| **colbymchenry/codegraph** | 0.9.9 | `npm install -g @colbymchenry/codegraph` |
| **Lum1104/Understand-Anything** | latest | `/plugin install understand-anything` |
| **affaan-m/ECC** | 1.10.0 | `npm install -g ecc-universal && ecc install --profile developer --target claude` |
| **garrytan/gstack** | latest | `git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack` |
| **karpathy-skills** | latest | `Already applied — CLAUDE.md ships with this project` |

## Fusion Points

### structural_to_semantic
- From: `codegraph` → To: `understand-anything`
- How: codegraph init -i builds AST base then /understand adds LLM enrichment

### code_intelligence_for_agents
- From: `codegraph` → To: `ecc`
- How: ECC agents call codegraph MCP tools instead of grep/glob

### plan_to_build_to_ship
- From: `gstack` → To: `gstack`
- How: gstack plans, ECC implements, gstack ships

### behavioral_guardrails
- From: `karpathy-skills` → To: `all`
- How: 4 principles in CLAUDE.md apply to every agent session


## Pipelines

### onboarding
```
codegraph → understand-anything
```

### feature
```
gstack:office-hours → gstack:plan-ceo-review → gstack:plan-eng-review → ecc:planner → ecc:tdd-guide → ecc:code-reviewer → gstack:qa → gstack:ship → gstack:retro
```

### debug
```
gstack:investigate → codegraph → understand-anything → ecc:tdd-guide → gstack:qa → gstack:ship
```

### review
```
codegraph → understand-anything → ecc:code-reviewer → ecc:security-reviewer → gstack:review
```

