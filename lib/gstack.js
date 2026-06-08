const fs = require('fs');
const path = require('path');
const os = require('os');

const GSTACK_DIR = path.join(os.homedir(), '.claude', 'skills', 'gstack');

const WORKFLOW = {
  think: { phase: 'Think', steps: [
    { command: '/office-hours', description: 'Product ideation, reframe ideas, YC-style interrogation', agent: null }
  ]},
  plan: { phase: 'Plan', steps: [
    { command: '/plan-ceo-review', description: 'CEO-level strategy/scope review', agent: 'architect' },
    { command: '/plan-eng-review', description: 'Architecture review, data flow, edge cases, test matrix', agent: 'architect' },
    { command: '/plan-design-review', description: 'Design audit of plan, rate dimensions 0-10', agent: null }
  ]},
  build: { phase: 'Build', steps: [
    { command: 'ECC planner', description: 'Implementation planning and task breakdown', agent: 'planner' },
    { command: 'ECC tdd-guide', description: 'Test-driven development', agent: 'tdd-guide' },
    { command: 'ECC code-reviewer', description: 'Code quality and maintainability review', agent: 'code-reviewer' },
    { command: 'ECC security-reviewer', description: 'Vulnerability detection', agent: 'security-reviewer' }
  ]},
  ship: { phase: 'Ship', steps: [
    { command: '/review', description: 'Pre-landing PR review', agent: 'code-reviewer' },
    { command: '/qa', description: 'Browser-based QA testing', agent: null },
    { command: '/cso', description: 'OWASP Top 10 + STRIDE security audit', agent: 'security-reviewer' },
    { command: '/ship', description: 'Run tests, review, push, open PR', agent: null },
    { command: '/land-and-deploy', description: 'Merge PR, deploy, verify production', agent: null }
  ]},
  reflect: { phase: 'Reflect', steps: [
    { command: '/document-release', description: 'Update docs to match what shipped', agent: 'doc-updater' },
    { command: '/retro', description: 'Weekly retro with per-person breakdowns', agent: null }
  ]}
};

function generatePlan(featureDescription) {
  const gstackOk = isInstalled();
  let plan = `# Sprint Plan: ${featureDescription}\n\n`;
  if (!gstackOk) plan += `> **Note:** gstack not found at ${GSTACK_DIR}. Install with: git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack\n\n`;
  for (const [key, phase] of Object.entries(WORKFLOW)) {
    plan += `## ${phase.phase}\n\n`;
    for (const step of phase.steps) {
      const agentTag = step.agent ? ` (→ ECC: ${step.agent})` : '';
      plan += `- \`${step.command}\`${agentTag}: ${step.description}\n`;
    }
    plan += '\n';
  }
  return plan;
}

function isInstalled() {
  try {
    return fs.existsSync(path.join(GSTACK_DIR, 'SKILL.md'));
  } catch { return false; }
}

module.exports = { WORKFLOW, generatePlan, isInstalled };
