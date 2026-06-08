#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

const BOLD = '\x1b[1m', DIM = '\x1b[2m';
const GREEN = '\x1b[32m', CYAN = '\x1b[36m', YELLOW = '\x1b[33m', RED = '\x1b[31m', RESET = '\x1b[0m';

function print(...a) { console.log(...a); }
function ok(m) { console.log(`  ${GREEN}✓${RESET} ${m}`); }
function warn(m) { console.log(`  ${YELLOW}⚠${RESET} ${m}`); }
function fail(m) { console.log(`  ${RED}✗${RESET} ${m}`); }

function readFile(f) {
  try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch { return null; }
}

function exists(f) { return fs.existsSync(path.join(ROOT, f)); }

function lineCount(content) { return content ? content.split('\n').length : 0; }

function findIssues(files) {
  const issues = [];
  for (const f of files) {
    const content = readFile(f);
    if (!content) { warn(`${f}: could not read`); continue; }
    const lines = content.split('\n');

    // Check for TODO/FIXME/HACK
    lines.forEach((l, i) => {
      if (/TODO|FIXME|HACK|XXX/.test(l) && !l.trim().startsWith('//') && !l.trim().startsWith('#')) {
        issues.push({ file: f, line: i + 1, severity: 'medium', type: 'stale-todo', text: l.trim().slice(0, 80) });
      }
    });

    // Check for console.log in production lib files
    if (f.startsWith('lib/') && !f.endsWith('.json')) {
      lines.forEach((l, i) => {
        if (/console\.(log|debug)/.test(l) && !l.trim().startsWith('//')) {
          issues.push({ file: f, line: i + 1, severity: 'low', type: 'console-log', text: l.trim().slice(0, 80) });
        }
      });
    }

    // Check for hardcoded paths
    if (f.endsWith('.js') || f.endsWith('.ps1') || f.endsWith('.sh')) {
      lines.forEach((l, i) => {
        if (/['"][A-Za-z]:\\/.test(l) && !l.includes('process.env') && !l.includes('path.join')) {
          issues.push({ file: f, line: i + 1, severity: 'low', type: 'hardcoded-path', text: l.trim().slice(0, 80) });
        }
      });
    }

    // Check for long lines (>120 chars)
    lines.forEach((l, i) => {
      if (l.length > 120 && !l.trim().startsWith('//') && !l.trim().startsWith('#')) {
        issues.push({ file: f, line: i + 1, severity: 'info', type: 'long-line', text: l.length + ' chars' });
      }
    });
  }
  return issues;
}

function generateSuggestions(issues) {
  const suggestions = [];
  const types = [...new Set(issues.map(i => i.type))];
  if (types.includes('stale-todo')) {
    suggestions.push('- **Stale TODOs**: Resolve or remove ' + issues.filter(i => i.type === 'stale-todo').length + ' leftover TODO/FIXME markers');
  }
  if (types.includes('console-log')) {
    suggestions.push('- **Console calls**: Replace ' + issues.filter(i => i.type === 'console-log').length + ' console.log/debug in lib/ with structured logging or remove');
  }
  if (types.includes('hardcoded-path')) {
    suggestions.push('- **Hardcoded paths**: Replace absolute Windows paths with path.join + process.env');
  }
  if (types.includes('long-line')) {
    const count = issues.filter(i => i.type === 'long-line').length;
    if (count > 5) suggestions.push('- **Long lines**: ' + count + ' lines exceed 120 chars — consider breaking them up');
  }
  return suggestions;
}

function checkDependencies() {
  const checks = [];
  try {
    const node = execSync('node --version', { encoding: 'utf8', timeout: 3000 }).trim();
    checks.push({ name: 'Node.js', status: 'ok', detail: node });
  } catch { checks.push({ name: 'Node.js', status: 'fail', detail: 'not found' }); }

  try {
    execSync('npm --version', { encoding: 'utf8', timeout: 3000 });
    checks.push({ name: 'npm', status: 'ok', detail: 'available' });
  } catch { checks.push({ name: 'npm', status: 'fail', detail: 'not found' }); }

  try {
    execSync('git --version', { encoding: 'utf8', timeout: 3000 });
    checks.push({ name: 'git', status: 'ok', detail: 'available' });
  } catch { checks.push({ name: 'git', status: 'fail', detail: 'not found' }); }

  try {
    const out = execSync('codegraph --version', { encoding: 'utf8', timeout: 3000 }).trim();
    checks.push({ name: 'CodeGraph', status: 'ok', detail: out });
  } catch { checks.push({ name: 'CodeGraph', status: 'warn', detail: 'not installed' }); }

  const agentsDir = path.join(require('os').homedir(), '.claude', 'agents');
  try {
    const count = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md')).length;
    checks.push({ name: 'ECC agents', status: 'ok', detail: count + ' agents' });
  } catch { checks.push({ name: 'ECC agents', status: 'warn', detail: 'not found' }); }

  return checks;
}

async function main() {
  print(`\n${BOLD}${CYAN}Omni-Fusion Self-Optimization Engine${RESET}\n`);

  // Phase 1: Check environment
  print(`${BOLD}Phase 1: Environment Check${RESET}`);
  const deps = checkDependencies();
  for (const d of deps) {
    if (d.status === 'ok') ok(`${d.name}: ${d.detail}`);
    else if (d.status === 'warn') warn(`${d.name}: ${d.detail}`);
    else fail(`${d.name}: ${d.detail}`);
  }
  print('');

  // Phase 2: Scan source files
  print(`${BOLD}Phase 2: Source Code Audit${RESET}`);
  const sourceFiles = [
    'bin/of.js', 'lib/codegraph.js', 'lib/ecc.js', 'lib/gstack.js',
    'scripts/co-install.js', 'scripts/check-install.js', 'scripts/build-docs.js',
    'scripts/ci-shell-check.js', 'install.ps1', 'install.sh',
    'mcp-bridge/omni-fusion.json', 'fuse.json', 'package.json',
    'CLAUDE.md', 'AGENTS.md', 'FUSION.md'
  ];
  const issues = findIssues(sourceFiles);

  if (issues.length === 0) {
    ok('No issues found in source code scan');
  } else {
    ok(`Found ${issues.length} items`);
    for (const issue of issues.slice(0, 30)) {
      const tag = issue.severity === 'high' ? RED : issue.severity === 'medium' ? YELLOW : DIM;
      print(`  ${tag}[${issue.severity}]${RESET} ${issue.file}:${issue.line} — ${issue.type}: ${issue.text}`);
    }
    if (issues.length > 30) print(`  ${DIM}...and ${issues.length - 30} more${RESET}`);
  }
  print('');

  // Phase 3: File health
  print(`${BOLD}Phase 3: File Health${RESET}`);
  for (const f of sourceFiles) {
    const content = readFile(f);
    if (content) ok(`${f} (${lineCount(content)} lines)`);
    else fail(`${f}: missing or unreadable`);
  }
  print('');

  // Phase 4: Suggestions
  print(`${BOLD}Phase 4: Optimization Suggestions${RESET}`);
  const suggestions = generateSuggestions(issues);
  if (suggestions.length === 0) {
    ok('No optimizations suggested — codebase is clean');
  } else {
    for (const s of suggestions) print(`  ${YELLOW}→${RESET} ${s}`);
  }
  print('');

  // Phase 5: Save report
  const outDir = path.join(ROOT, '.of-optimize');
  try {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const timestamp = Date.now();
    let report = `# Omni-Fusion Optimization Report\n\n*Generated: ${new Date().toISOString()}*\n\n`;
    report += `## Environment\n\n`;
    for (const d of deps) report += `- ${d.name}: ${d.detail}\n`;
    report += `\n## Issues Found: ${issues.length}\n\n`;
    for (const issue of issues) {
      report += `- [${issue.severity}] ${issue.file}:${issue.line} — ${issue.type}: ${issue.text}\n`;
    }
    report += `\n## Suggestions\n\n`;
    for (const s of suggestions) report += `${s}\n`;
    const outFile = path.join(outDir, `report-${timestamp}.md`);
    fs.writeFileSync(outFile, report);
    ok(`Report saved: ${outFile}`);
  } catch (e) {
    warn(`Could not save report: ${e.message}`);
  }

  print(`\n${DIM}Run this periodically to track codebase health.${RESET}\n`);
}

main().catch(e => { console.error(e.message || e); process.exitCode = 1; });
