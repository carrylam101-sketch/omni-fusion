#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const GREEN = '\x1b[32m'; const CYAN = '\x1b[36m'; const YELLOW = '\x1b[33m'; const RED = '\x1b[31m'; const RESET = '\x1b[0m'; const BOLD = '\x1b[1m';
function ok(msg) { console.log(`  ${GREEN}✓${RESET} ${msg}`); }
function warn(msg) { console.log(`  ${YELLOW}⚠${RESET} ${msg}`); }
function fail(msg) { console.log(`  ${RED}✗${RESET} ${msg}`); }

function cmdExists(name) {
  try {
    const isWin = process.platform === 'win32';
    execSync(isWin ? `where "${name}"` : `command -v "${name}"`, { stdio: 'pipe', timeout: 3000 });
    return true;
  } catch { return false; }
}

function getCodeGraphNodeCount() {
  try {
    const out = execSync('codegraph status', { encoding: 'utf8', timeout: 5000, stdio: 'pipe' });
    const match = out.match(/Nodes:\s+(\d+)/i);
    if (match) return match[1];
    return '?';
  } catch { return 'not running'; }
}

const checks = [];

// 1. CodeGraph
if (cmdExists('codegraph')) {
  const nodeCount = getCodeGraphNodeCount();
  ok(`CodeGraph CLI available (nodes: ${nodeCount})`);
  checks.push(true);
} else {
  const cgDir = path.join(process.cwd(), '.codegraph');
  if (fs.existsSync(cgDir)) {
    ok('CodeGraph .codegraph/ directory exists');
    checks.push(true);
  } else {
    warn('CodeGraph not installed. Run: npm install -g @colbymchenry/codegraph');
    checks.push(false);
  }
}

// 2. ECC
const home = os.homedir();
const eccSkills = path.join(home, '.claude', 'skills');
let eccCount = 0;
try {
  const dirs = fs.readdirSync(eccSkills, { withFileTypes: true });
  eccCount = dirs.filter(d => d.isDirectory() && fs.existsSync(path.join(eccSkills, d.name, 'SKILL.md'))).length;
} catch { eccCount = -1; }

const eccAgents = path.join(home, '.claude', 'agents');
let agentCount = 0;
try {
  agentCount = fs.readdirSync(eccAgents).filter(f => f.endsWith('.md')).length;
} catch { agentCount = -1; }

if (eccCount > 0 && agentCount > 0) {
  ok(`ECC: ${eccCount} skills, ${agentCount} agents`);
  checks.push(true);
} else if (eccCount > 0) {
  ok(`ECC: ${eccCount} skills (no agents found)`);
  checks.push(true);
} else if (agentCount > 0) {
  ok(`ECC: ${agentCount} agents (no skills found)`);
  checks.push(true);
} else {
  const localEcc = path.join(process.cwd(), '.claude', 'skills');
  let localCount = 0;
  try { localCount = fs.readdirSync(localEcc).length; } catch {}
  if (localCount > 0) {
    ok(`ECC project-level skills: ${localCount}`);
    checks.push(true);
  } else {
    warn('ECC not installed. Run: npm install -g ecc-universal && ecc install --profile developer --target claude');
    checks.push(false);
  }
}

// 3. gstack
const gstackDir = path.join(home, '.claude', 'skills', 'gstack');
const gstackLocal = path.join(process.cwd(), '.claude', 'skills', 'gstack');
let gstackOk = false;
if (fs.existsSync(gstackDir) && fs.existsSync(path.join(gstackDir, 'SKILL.md'))) {
  ok('gstack installed at ~/.claude/skills/gstack');
  gstackOk = true;
} else if (fs.existsSync(gstackLocal)) {
  ok('gstack installed at project level');
  gstackOk = true;
}
if (!gstackOk) {
  warn('gstack not installed. Run: git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack');
}
checks.push(gstackOk);

// 4. Understand-Anything
const uaPlugin = path.join(home, '.claude', 'plugins', 'cache', 'understand-anything');
const uaDir = path.join(process.cwd(), '.understand-anything');
if (fs.existsSync(uaDir) && fs.existsSync(path.join(uaDir, 'knowledge-graph.json'))) {
  ok(`Understand-Anything graph present at ${uaDir}`);
  checks.push(true);
} else if (fs.existsSync(uaDir)) {
  ok('Understand-Anything .understand-anything/ directory exists');
  checks.push(true);
} else if (fs.existsSync(uaPlugin)) {
  ok('Understand-Anything plugin cached');
  checks.push(true);
} else {
  warn('Understand-Anything not installed. In Claude Code: /plugin install understand-anything');
  checks.push(false);
}

// 5. Karpathy/CLAUDE.md
const rootClaude = path.join(__dirname, '..', 'CLAUDE.md');
if (fs.existsSync(rootClaude)) {
  const content = fs.readFileSync(rootClaude, 'utf8');
  if (content.includes('Karpathy') || content.includes('Think Before Coding')) {
    ok('Karpathy principles embedded in CLAUDE.md');
    checks.push(true);
  } else {
    ok('CLAUDE.md exists');
    checks.push(true);
  }
} else {
  warn('CLAUDE.md not found at project root (Karpathy principles inactive)');
  checks.push(false);
}

// 6. Omni-Fusion files
const hasFusion = fs.existsSync(path.join(process.cwd(), 'FUSION.md'));
const hasAgents = fs.existsSync(path.join(process.cwd(), 'AGENTS.md'));
if (hasFusion && hasAgents) {
  ok('Omni-Fusion wiring files present (FUSION.md + AGENTS.md)');
  checks.push(true);
} else {
  warn('Omni-Fusion files incomplete');
  checks.push(false);
}

// Summary
console.log('');
const okCount = checks.filter(Boolean).length;
const total = checks.length;
if (okCount === total) {
  console.log(`${GREEN}✓ All ${total} checks passed — Omni-Fusion is fully operational${RESET}`);
} else {
  console.log(`${YELLOW}⚠ ${okCount}/${total} components ready.${RESET}`);
  console.log('  Fix warnings above, then re-run: node scripts/check-install.js');
}
