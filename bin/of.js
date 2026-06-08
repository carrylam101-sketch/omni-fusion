#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const codegraph = require('../lib/codegraph');
const ecc = require('../lib/ecc');
const gstack = require('../lib/gstack');

const BOLD = '\x1b[1m', DIM = '\x1b[2m';
const GREEN = '\x1b[32m', CYAN = '\x1b[36m', YELLOW = '\x1b[33m', RESET = '\x1b[0m';

function print(...a) { console.log(...a); }
function ok(m) { console.log(`  ${GREEN}✓${RESET} ${m}`); }
function warn(m) { console.log(`  ${YELLOW}⚠${RESET} ${m}`); }

const LANG_MAP = {
  ts: 'TypeScript', tsx: 'TypeScript/React', mts: 'TypeScript', cts: 'TypeScript',
  js: 'JavaScript', jsx: 'JavaScript/React', mjs: 'JavaScript', cjs: 'JavaScript',
  py: 'Python', go: 'Go', rs: 'Rust', java: 'Java',
  cpp: 'C++', c: 'C', cs: 'C#', kt: 'Kotlin',
  dart: 'Dart', swift: 'Swift', rb: 'Ruby',
  php: 'PHP', vue: 'Vue', svelte: 'Svelte',
  css: 'CSS', scss: 'SCSS', html: 'HTML',
  json: 'JSON', yml: 'YAML', yaml: 'YAML', md: 'Markdown', sql: 'SQL'
};

function detectLanguage(filePath) {
  const ext = path.extname(filePath).replace(/^\./, '');
  if (!ext) return 'Unknown';
  return LANG_MAP[ext] || ext.toUpperCase();
}

function readFileContent(filePath, maxLines) {
  try {
    const buf = fs.readFileSync(filePath);
    const content = buf.toString('utf8').replace(/\r\n/g, '\n');
    const lines = content.split('\n');
    if (!maxLines || lines.length <= maxLines) return content;
    return lines.slice(0, maxLines).join('\n') + `\n... (${lines.length - maxLines} more lines)`;
  } catch {
    return null;
  }
}

function findFirstSymbol(queryOutput) {
  const patterns = [
    /■\s+(\S+)/,
    /\b(const|let|var|function|class)\s+(\w+)/,
    /──\s+(\S+)/
  ];
  for (const p of patterns) {
    const m = queryOutput.match(p);
    if (m) return m[2] || m[1];
  }
  return null;
}

function safeMkdir(dir) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    warn(`Cannot create directory ${dir}: ${e.message}`);
    return false;
  }
  return true;
}

function safeWriteFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    return true;
  } catch (e) {
    warn(`Cannot write file ${filePath}: ${e.message}`);
    return false;
  }
}

async function cmdReview(files) {
  if (!codegraph.isInstalled()) {
    warn('CodeGraph not installed. Run: npm install -g @colbymchenry/codegraph');
    process.exitCode = 1; return;
  }

  if (files.length === 0) {
    warn('Usage: of review <file1> [file2] ...');
    warn('Specify at least one file to review.');
    process.exitCode = 1; return;
  }

  print(`\n${BOLD}${CYAN}Omni-Fusion Code Review${RESET}\n`);

  for (const target of files) {
    const absPath = path.resolve(target);
    let stat;
    try {
      stat = fs.statSync(absPath);
    } catch {
      warn(`File not found: ${target}`); process.exitCode = 1; continue;
    }
    if (stat.isDirectory()) {
      warn(`Skipping directory: ${target} (specify individual files)`);
      continue;
    }

    const lang = detectLanguage(absPath);
    print(`${BOLD}Reviewing:${RESET} ${target} (${lang})`);

    let impactData = '';
    try {
      const baseName = path.basename(absPath).split('.')[0];
      const queryOut = codegraph.query(baseName);
      if (queryOut.trim()) {
        impactData = `[CodeGraph Query: ${path.basename(absPath)}]\n${queryOut}`;
        const lines = queryOut.split('\n').filter(l => l.trim()).slice(0, 15);
        if (lines.length > 0) {
          print(`\n${DIM}CodeGraph:${RESET}`);
          lines.forEach(l => print(`  ${DIM}${l}${RESET}`));
        }
        const firstSymbol = findFirstSymbol(queryOut);
        if (firstSymbol) {
          try {
            const callersOut = codegraph.callers(firstSymbol);
            if (callersOut.trim()) {
              impactData += `\n\n[CodeGraph Callers: ${firstSymbol}]\n${callersOut}`;
              callersOut.split('\n').filter(l => l.trim()).slice(0, 5).forEach(l => print(`  ${DIM}calls: ${l.trim()}${RESET}`));
            }
          } catch (e) { warn(`CodeGraph callers failed: ${e.message}`); }
          try {
            const calleesOut = codegraph.callees(firstSymbol);
            if (calleesOut.trim()) impactData += `\n\n[CodeGraph Callees: ${firstSymbol}]\n${calleesOut}`;
          } catch (e) { warn(`CodeGraph callees failed: ${e.message}`); }
        }
      }
    } catch (e) { warn(`CodeGraph query failed: ${e.message}`); }

    const reviewerName = ecc.findReviewersForLanguage(path.extname(absPath).replace(/^\./, ''));
    let reviewer;
    try { reviewer = ecc.loadAgent(reviewerName); } catch (e) { warn(`ECC agent load failed: ${e.message}`); }
    if (reviewer) {
      print(`\n${BOLD}ECC Agent:${RESET} ${reviewerName}`);
      const purpose = (reviewer.content || '').split('\n').slice(0, 3).map(l => l.replace(/^#+\s*/, '').trim()).filter(Boolean).join(' ');
      if (purpose) print(`  ${DIM}${purpose.slice(0, 120)}${RESET}`);
    }

    const fileContent = readFileContent(absPath);
    const prompt = ecc.buildReviewPrompt(absPath, path.extname(absPath).replace(/^\./, ''), impactData, fileContent);

    const outputDir = path.join(process.cwd(), '.of-reviews');
    if (!safeMkdir(outputDir)) continue;
    const outFile = path.join(outputDir, `review-${path.basename(absPath)}-${Date.now()}.md`);
    if (safeWriteFile(outFile, prompt)) ok(`Review artifact: ${outFile}`);
    print('');
  }
}

async function cmdUnderstand(target) {
  const projectPath = target ? path.resolve(target) : process.cwd();
  if (!fs.existsSync(projectPath)) {
    warn(`Path not found: ${target}`);
    process.exitCode = 1; return;
  }

  print(`\n${BOLD}${CYAN}Omni-Fusion Code Understanding${RESET}`);
  print(`  Project: ${projectPath}\n`);

  if (!codegraph.isInstalled()) {
    print('  CodeGraph not installed. Install first:');
    print('    npm install -g @colbymchenry/codegraph\n');
    process.exitCode = 1; return;
  }

  print(`${DIM}Syncing CodeGraph index...${RESET}`);
  try {
    if (fs.existsSync(path.join(projectPath, '.codegraph'))) {
      codegraph.sync(projectPath);
    } else {
      codegraph.init(projectPath);
    }
    ok('CodeGraph index synced');
  } catch (e) {
    warn(`CodeGraph index failed: ${e.message}`);
    process.exitCode = 1;
  }

  print('');
  try {
    const stats = codegraph.status(projectPath);
    print(`${BOLD}Index:${RESET} ${stats.files} files, ${stats.nodes} nodes, ${stats.edges} edges (${stats.db})`);
  } catch (e) {
    warn(`CodeGraph status failed: ${e.message}`);
    process.exitCode = 1;
  }

  print(`\n${BOLD}Files:${RESET}`);
  try {
    const filesOut = codegraph.files(projectPath);
    filesOut.split('\n').filter(l => l.trim()).slice(0, 30).forEach(l => print(`  ${l}`));
  } catch (e) {
    warn(`File listing unavailable: ${e.message}`);
    process.exitCode = 1;
  }

  const agents = ecc.listAgents();
  if (agents.length > 0) {
    print(`\n${BOLD}ECC Agents (${agents.length}):${RESET}`);
    const byCategory = {};
    for (const a of agents) {
      const cat = a.name.includes('reviewer') ? 'reviewers' :
                  a.name.includes('build') || a.name.includes('resolver') ? 'build' :
                  a.name.includes('planner') || a.name.includes('architect') ? 'planning' :
                  a.name.includes('doc') ? 'docs' : 'other';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(a.name);
    }
    for (const [cat, names] of Object.entries(byCategory)) {
      print(`  ${DIM}${cat}:${RESET} ${names.join(', ')}`);
    }
  }

  if (gstack.isInstalled()) {
    print(`\n${BOLD}gstack:${RESET} ${DIM}Installed. Workflow: Think → Plan → Build → Ship → Reflect${RESET}`);
  }

  print('');
}

async function cmdPlan(feature) {
  if (!feature) {
    warn('Usage: of plan "description of feature"');
    process.exitCode = 1; return;
  }

  print(`\n${BOLD}${CYAN}Omni-Fusion Sprint Plan${RESET}\n`);

  const plan = gstack.generatePlan(feature);
  print(plan);

  try {
    const planner = ecc.loadAgent('planner');
    if (planner) {
      const lines = planner.content.split('\n');
      const implLines = lines.filter(l => {
        const t = l.trim();
        if (!t || t.startsWith('#') || t.startsWith('---')) return false;
        return /step|plan|task|\d+\./i.test(t);
      }).slice(0, 15);
      if (implLines.length > 0) {
        print(`${BOLD}ECC Planner Guide:${RESET}`);
        implLines.forEach(l => print(`  ${l.trim()}`));
        print('');
      }
    }
  } catch (e) { warn(`ECC planner agent load failed: ${e.message}`); }

  const outputDir = path.join(process.cwd(), '.of-plans');
  if (!safeMkdir(outputDir)) return;
  const slug = feature.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40);
  const outFile = path.join(outputDir, `plan-${slug}-${Date.now()}.md`);
  if (safeWriteFile(outFile, plan)) ok(`Plan: ${outFile}`);
  print(`${DIM}Next: share plan with team, then run \`of review\` when code is ready.${RESET}\n`);
}

async function cmdStatus() {
  print(`\n${BOLD}${CYAN}Omni-Fusion Status${RESET}\n`);

  try {
    if (codegraph.isInstalled()) {
      const stats = codegraph.status();
      ok(`CodeGraph: ${stats.files} files, ${stats.nodes} nodes, ${stats.edges} edges`);
    } else {
      warn('CodeGraph: not installed');
    }
  } catch (e) {
    warn(`CodeGraph: error — ${e.message}`);
  }

  const agents = ecc.listAgents();
  ok(`ECC: ${agents.length} agents available`);

  ok(`gstack: ${gstack.isInstalled() ? 'installed' : 'not installed'}`);

  const uaPlugin = path.join(os.homedir(), '.claude', 'plugins', 'cache', 'understand-anything');
  ok(`Understand-Anything: ${fs.existsSync(uaPlugin) ? 'plugin cached' : 'not installed (Claude Code plugin)'}`);

  try {
    const kpFile = path.join(process.cwd(), 'CLAUDE.md');
    const kpExists = fs.existsSync(kpFile);
    const kpActive = kpExists && fs.readFileSync(kpFile, 'utf8').includes('Think Before Coding');
    ok(`Karpathy: ${kpActive ? 'active' : kpExists ? 'present (principles not detected)' : 'CLAUDE.md not found'}`);
  } catch (e) {
    warn(`Karpathy: error reading CLAUDE.md — ${e.message}`);
  }

  print('');
}

function cmdHelp() {
  print(`
${BOLD}Omni-Fusion CLI${RESET} — Fuse CodeGraph + ECC + gstack + Understand-Anything + Karpathy

${BOLD}Usage:${RESET}
  of <command> [options]

${BOLD}Commands:${RESET}
  review <file> [files..]  Code review with CodeGraph context + ECC reviewer
  understand [path]        Analyze codebase: index, stats, structure, agents
  plan "feature"           Generate sprint plan with gstack + ECC agents
  status                   Show installation status of all 5 components
  help                     Show this help

${BOLD}Examples:${RESET}
  of review src/app.ts              Review a single file
  of review lib/util.js src/main.ts Review multiple files
  of understand                     Understand current project
  of understand /some/project       Understand a specific project
  of plan "add user authentication" Generate sprint plan
  of status                         Check all components
`);
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0] || 'help';

  switch (cmd) {
    case 'review': await cmdReview(args.slice(1)); break;
    case 'understand': await cmdUnderstand(args[1]); break;
    case 'plan': await cmdPlan(args.slice(1).join(' ')); break;
    case 'status': case 'check': await cmdStatus(); break;
    case 'help': case '-h': case '--help': cmdHelp(); break;
    default:
      print(`Unknown command: ${cmd}\n`);
      cmdHelp();
      process.exitCode = 1;
  }
}

main().catch(e => { console.error(e.message || e); process.exitCode = 1; });
