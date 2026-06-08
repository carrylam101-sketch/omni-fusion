#!/usr/bin/env node
/**
 * Omni-Fusion Co-installer
 *
 * Installs (or verifies) all 5 fused projects in dependency order.
 * Unlike a rewrite, this script uses each project's OWN installer.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function log(label, msg) {
  const prefix = `[${BOLD}${CYAN}Omni-Fusion${RESET}]`;
  console.log(`${prefix} ${label}: ${msg}`);
}

function ok(msg) {
  console.log(`  ${GREEN}✓${RESET} ${msg}`);
}

function warn(msg) {
  console.log(`  ${YELLOW}⚠${RESET} ${msg}`);
}

function fail(msg) {
  console.log(`  ${RED}✗${RESET} ${msg}`);
}

function cmdExists(name) {
  try {
    const isWin = process.platform === 'win32';
    if (isWin) {
      execSync(`where "${name}"`, { stdio: 'pipe', timeout: 3000 });
    } else {
      execSync(`command -v "${name}"`, { stdio: 'pipe', timeout: 3000 });
    }
    return true;
  } catch {
    return false;
  }
}

async function installCodeGraph() {
  log('CodeGraph', 'Installing colbymchenry/codegraph...');
  try {
    if (cmdExists('codegraph')) {
      ok('codegraph already on PATH');
      return true;
    }
    execSync('npm install -g @colbymchenry/codegraph', {
      stdio: 'inherit',
      timeout: 120000,
    });
    ok('CodeGraph installed');
    return true;
  } catch (e) {
    warn(`CodeGraph auto-install failed: ${e.message}. Run manually: npm install -g @colbymchenry/codegraph`);
    return false;
  }
}

async function installECC() {
  log('ECC', 'Installing affaan-m/ECC...');
  try {
    const home = os.homedir();
    const eccSkills = path.join(home, '.claude', 'skills');
    if (fs.existsSync(path.join(eccSkills, 'tdd', 'SKILL.md'))) {
      ok('ECC skills already installed');
      return true;
    }
    // ECC can be installed either via npm global or the @hexmos/ipm method
    if (cmdExists('ecc')) {
      ok('ecc CLI already on PATH');
      try {
        execSync('ecc install --profile developer --target claude', {
          stdio: 'inherit',
          timeout: 120000,
        });
        ok('ECC content installed');
      } catch (e2) {
        warn(`ECC content install failed: ${e2.message}`);
        return false;
      }
      return true;
    }
    try {
      execSync('npm install -g ecc-universal', {
        stdio: 'inherit',
        timeout: 120000,
      });
      ok('ECC installed globally');
      // Now install content
      execSync('ecc install --profile developer --target claude', {
        stdio: 'inherit',
        timeout: 120000,
      });
      ok('ECC content installed');
      return true;
    } catch (e) {
      warn(`ECC install failed: ${e.message}. Run manually: npm install -g ecc-universal && ecc install --profile developer --target claude`);
      return false;
    }
  } catch (e) {
    warn(`ECC auto-install failed: ${e.message}`);
    return false;
  }
}

async function installGStack() {
  log('gstack', 'Installing garrytan/gstack...');
  try {
    const home = os.homedir();
    const gstackDir = path.join(home, '.claude', 'skills', 'gstack');
    if (fs.existsSync(path.join(gstackDir, 'SKILL.md'))) {
      ok('gstack already installed');
      return true;
    }
    if (!cmdExists('git')) {
      fail('git not found');
      return false;
    }
    execSync(`git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git "${gstackDir}"`, {
      stdio: 'inherit',
      timeout: 60000,
    });
    ok('gstack cloned');
    // Run setup
    if (process.platform === 'win32') {
      log('gstack', 'Windows: run setup manually from ~/.claude/skills/gstack');
    } else {
      try {
        execSync('./setup', {
          cwd: gstackDir, stdio: 'inherit', timeout: 60000
        });
        ok('gstack setup complete');
      } catch {
        warn('gstack setup failed — run manually from ~/.claude/skills/gstack');
      }
    }
    return true;
  } catch (e) {
    warn(`gstack install failed: ${e.message}. Clone manually: git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack`);
    return false;
  }
}

async function checkCodeGraph() {
  log('CodeGraph', 'Checking...');
  try {
    execSync('codegraph status', { stdio: 'pipe', timeout: 3000 });
    ok('CodeGraph CLI available');
    return true;
  } catch {
    if (fs.existsSync(path.join(process.cwd(), '.codegraph'))) {
      ok('.codegraph/ directory exists');
      return true;
    }
    warn('Not installed. Run: npm install -g @colbymchenry/codegraph');
    return false;
  }
}

async function checkECC() {
  log('ECC', 'Checking...');
  const eccSkills = path.join(os.homedir(), '.claude', 'skills');
  try {
    const dirs = fs.readdirSync(eccSkills, { withFileTypes: true });
    const count = dirs.filter(d => d.isDirectory() && fs.existsSync(path.join(eccSkills, d.name, 'SKILL.md'))).length;
    if (count > 0) {
      ok(`ECC skills present (${count} skills)`);
      return true;
    }
  } catch {}
  warn('Not installed. Run: npm install -g ecc-universal && ecc install --profile developer --target claude');
  return false;
}

async function checkGStack() {
  log('gstack', 'Checking...');
  const gstackDir = path.join(os.homedir(), '.claude', 'skills', 'gstack');
  if (fs.existsSync(gstackDir) && fs.existsSync(path.join(gstackDir, 'SKILL.md'))) {
    ok('gstack installed at ~/.claude/skills/gstack');
    return true;
  }
  warn('Not installed. Run: git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack');
  return false;
}

async function checkUnderstandAnything() {
  log('Understand-Anything', 'Checking...');
  const home = os.homedir();
  const cacheDir = path.join(home, '.claude', 'plugins', 'cache', 'understand-anything');
  if (fs.existsSync(cacheDir)) {
    ok('Understand-Anything plugin cached');
    return true;
  }
  warn('Not installed. In Claude Code, run: /plugin install understand-anything');
  return false;
}

async function checkKarpathy() {
  log('Karpathy', 'Checking...');
  const rootClaude = fs.existsSync(path.join(process.cwd(), 'CLAUDE.md'));
  if (rootClaude) {
    ok('CLAUDE.md present (Karpathy principles active)');
    return true;
  }
  warn('CLAUDE.md not found at project root');
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const allMode = args.includes('--all') || args.includes('--full');
  const statusOnly = args.includes('--status') || args.includes('--check');

  console.log('');
  console.log(`  ${BOLD}${CYAN}Omni-Fusion Co-install Check${RESET}`);
  console.log('  Wires CodeGraph + Understand-Anything + ECC + gstack + Karpathy');
  console.log('');

  const results = [];

  if (statusOnly) {
    results.push(await checkCodeGraph());
    results.push(await checkECC());
    results.push(await checkGStack());
  } else {
    results.push(await installCodeGraph());
    results.push(await installECC());
    if (allMode) results.push(await installGStack());
  }

  results.push(await checkUnderstandAnything());
  results.push(await checkKarpathy());

  console.log('');
  const okCount = results.filter(Boolean).length;
  const total = results.length;
  if (okCount === total) {
    log('Status', `${GREEN}All ${total} components ready${RESET}`);
  } else {
    log('Status', `${YELLOW}${okCount}/${total} components ready${RESET}`);
  }
  console.log('');
  console.log('  Next: copy CLAUDE.md and AGENTS.md to your project root');
  console.log('  Then start a fresh Claude Code session');
  console.log('');
}

main().catch(e => { console.error(e.message || e); process.exitCode = 1; });
