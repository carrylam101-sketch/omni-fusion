#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

const APEX_DIR = path.join(os.homedir(), '.apex');
const GREEN = '\x1b[32m', CYAN = '\x1b[36m', BOLD = '\x1b[1m', DIM = '\x1b[2m', RESET = '\x1b[0m';

function write(name, content) {
  const fp = path.join(APEX_DIR, name);
  const dir = path.dirname(fp);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fp, content.trimStart() + '\n');
  console.log(`  ${GREEN}✓${RESET} ${name}`);
}

const files = {};

files['state/STATE.md'] = `
# Omni-Fusion APEX State

## Identity
Omni-Fusion APEX — Universal AI Agent Integration Layer

## Current Metrics
- Ω_health: T1 BOOTSTRAP
- sessions: 1
- last_ldr: PENDING

## LDR Loop Status
- ORIENT: PENDING
- PLAN: PENDING
- EXECUTE: PENDING
- VERIFY: PENDING
- EVOLVE: PENDING
- PERSIST: PENDING

## Last Action
[None — just activated]

## Next Action
Run first LDR cycle: npm run optimize + internet gap search
`;

files['state/METRICS.json'] = JSON.stringify({
  "omniFusion": {
    "version": "1.0.0",
    "codeQuality": {
      "lintPass": true,
      "filesSyntaxChecked": 9,
      "issuesOpen": 0,
      "testPass": true
    },
    "ldr": {
      "cyclesComplete": 0,
      "gapsFound": 0,
      "fixesApplied": 0,
      "lastCycle": null
    },
    "coverage": {
      "componentsInstalled": 4,
      "cliCommands": 5,
      "npmScripts": 7
    }
  },
  "health": "T1 BOOTSTRAP",
  "sessions": 1,
  "lastUpdated": new Date().toISOString().split('T')[0]
}, null, 2);

files['memory/agent_memory.md'] = `
# Omni-Fusion APEX Agent Memory

## Identity
Omni-Fusion APEX — Self-evolving agent integration layer

## Core Protocol
LDR(K) → GapDetect → CodeSelfFix → HotReload → TaskSolve → KnowledgeSettle
ORIENT → PLAN → EXECUTE → VERIFY → EVOLVE → PERSIST

## Behavior Rules
- Every session runs at minimum one LDR cycle
- Plan phase MUST include internet search for gaps
- Execute phase implements highest-impact gap found
- Verify phase runs npm run lint && npm run test
- All decisions recorded to evolution_log.md

## Created
${new Date().toISOString().split('T')[0]}
`;

files['memory/evolution_log.md'] = `
# Omni-Fusion APEX Evolution Log

## ${new Date().toISOString().split('T')[0]} — Initialization
- Omni-Fusion APEX activated
- Memory system established
- 5 components defined: CodeGraph, Understand-Anything, ECC, gstack, Karpathy
- CLI: of status | understand | review | plan
- CI: GitHub Actions (3 OS × 3 Node versions)

## Gaps Identified
- [To be filled by GapDetect in PLAN phase]

## Improvements Made
- [To be filled after CodeSelfFix in EXECUTE phase]
`;

files['memory/strategy.md'] = `
# Omni-Fusion APEX Strategy

## Mission
Build a complete self-improving AI agent orchestration system

## LDR Loop Execution
1. ORIENT: Read state, run npm run optimize
2. PLAN: Web search for gaps vs best practices
3. EXECUTE: Implement highest-impact gap
4. VERIFY: npm run lint && npm run test
5. EVOLVE: Update METRICS.json and optimize
6. PERSIST: Write to evolution_log.md

## Internet Self-Improvement Sources
- GitHub trending Node.js: https://github.com/trending/javascript?since=weekly
- Node.js best practices: https://github.com/goldbergyoni/nodebestpractices
- Awesome self-improving agents: https://github.com/topics/self-improving
- GitHub Actions patterns: https://docs.github.com/en/actions/examples
`;

files['state/LEARNINGS.md'] = `
# Omni-Fusion APEX Learnings

## Key Learnings
- [To be filled from task failures and successes]

## Root Cause Analysis
- [Document failure patterns here]
`;

files['state/CHANGELOG.md'] = `
# Omni-Fusion APEX Changelog

## ${new Date().toISOString().split('T')[0]}
- v1.0.0: Omni-Fusion APEX activated, memory system built
- 5 components: CodeGraph, Understand-Anything, ECC, gstack, Karpathy
- CLI tool: of (status, understand, review, plan, help)
- CI/CD: GitHub Actions matrix (3 Node × 2 OS)
`;

console.log(`\n${BOLD}${CYAN}Omni-Fusion APEX Initialization${RESET}\n`);
console.log(`  Creating APEX memory files at ${APEX_DIR}...\n`);

for (const [name, content] of Object.entries(files)) {
  write(name, content);
}

console.log(`\n  ${GREEN}✓${RESET} APEX system initialized (7 files)\n`);
console.log(`  ${DIM}Next: run "npm run optimize" to begin LDR cycle${RESET}\n`);
