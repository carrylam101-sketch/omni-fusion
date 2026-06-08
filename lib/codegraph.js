const { execSync } = require('child_process');

function cg(opts = {}) {
  const args = opts.args || [];
  const cwd = opts.cwd || undefined;
  try {
    const cmd = ['codegraph', ...args].map(a => `"${a}"`).join(' ');
    const stdout = execSync(cmd, { encoding: 'utf8', timeout: 30000, stdio: 'pipe', cwd });
    return stdout;
  } catch (e) {
    throw new Error(`codegraph ${args[0] || '?'} failed: ${e.message}`);
  }
}

function numFromMatch(match) {
  if (!match) return '?';
  const digits = match.replace(/[.,\s]/g, '').replace(/\D/g, '');
  return digits || '?';
}

function status(projectPath) {
  const out = cg({ args: ['status'], cwd: projectPath });
  return {
    files: numFromMatch((out.match(/Files:\s+[\d,.\s]+/) || [])[0]),
    nodes: numFromMatch((out.match(/Nodes:\s+[\d,.\s]+/) || [])[0]),
    edges: numFromMatch((out.match(/Edges:\s+[\d,.\s]+/) || [])[0]),
    db: (out.match(/DB Size:\s+([\d.]+\s*\w+)/) || [])[1] || '?',
    raw: out
  };
}

function query(searchTerm) {
  return cg({ args: ['query', searchTerm] });
}

function callers(symbol) {
  return cg({ args: ['callers', symbol] });
}

function callees(symbol) {
  return cg({ args: ['callees', symbol] });
}

function impact(nodeId) {
  return cg({ args: ['impact', nodeId] });
}

function files(projectPath) {
  return cg({ args: ['files'], cwd: projectPath });
}

function init(projectPath) {
  const args = ['init', '-i'];
  const opts = {};
  if (projectPath) {
    args.push(projectPath);
    opts.cwd = projectPath;
  }
  return cg({ args, ...opts });
}

function sync(projectPath) {
  const args = ['sync'];
  const opts = {};
  if (projectPath) {
    args.push(projectPath);
    opts.cwd = projectPath;
  }
  return cg({ args, ...opts });
}

function isInstalled() {
  try {
    execSync('codegraph --version', { stdio: 'pipe', timeout: 3000 });
    return true;
  } catch { return false; }
}

module.exports = { status, query, callers, callees, impact, files, init, sync, isInstalled };
