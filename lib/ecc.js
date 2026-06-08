const fs = require('fs');
const path = require('path');
const os = require('os');

function getAgentsDir() {
  return process.env.ECC_AGENTS_PATH || path.join(os.homedir(), '.claude', 'agents');
}

function listAgents() {
  const dir = getAgentsDir();
  try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    return files.map(f => ({
      name: f.replace(/\.md$/, ''),
      file: path.join(dir, f)
    }));
  } catch { return []; }
}

function loadAgent(name) {
  try {
    const dir = getAgentsDir();
    const filePath = path.join(dir, `${name}.md`);
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const purpose = lines.slice(0, 15).filter(l => l.trim()).slice(0, 5).join(' ').slice(0, 200);
    return { name, file: filePath, purpose, content };
  } catch { return null; }
}

function findReviewersForLanguage(lang) {
  const langMap = {
    ts: 'typescript-reviewer', tsx: 'typescript-reviewer', mts: 'typescript-reviewer', cts: 'typescript-reviewer',
    js: 'typescript-reviewer', jsx: 'typescript-reviewer', mjs: 'typescript-reviewer', cjs: 'typescript-reviewer',
    py: 'python-reviewer', go: 'go-reviewer', rs: 'rust-reviewer', java: 'java-reviewer',
    cpp: 'cpp-reviewer', c: 'cpp-reviewer', cs: 'csharp-reviewer', kt: 'kotlin-reviewer',
    dart: 'flutter-reviewer', swift: 'code-reviewer', rb: 'code-reviewer', php: 'code-reviewer',
    vue: 'code-reviewer', svelte: 'code-reviewer', css: 'code-reviewer', scss: 'code-reviewer',
    html: 'code-reviewer', sql: 'database-reviewer'
  };
  return langMap[lang] || 'code-reviewer';
}

function buildReviewPrompt(filePath, lang, impactData, fileContent) {
  try {
    const reviewerName = findReviewersForLanguage(lang);
    const reviewer = loadAgent(reviewerName);
    const generalReviewer = loadAgent('code-reviewer');

    let prompt = `# Code Review Request\n\n`;
    prompt += `## File\n${filePath}\n\n`;

    if (fileContent) {
      prompt += `## Source Code\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
    }

    if (impactData) {
      prompt += `## CodeGraph Context\n\`\`\`\n${impactData.split('\n').slice(0, 40).join('\n')}\n\`\`\`\n\n`;
    }

    if (reviewer) {
      const agentLines = (reviewer.content || '').split('\n').filter(l => !l.startsWith('#') && !l.startsWith('---') && l.trim()).slice(0, 30).join('\n');
      if (agentLines) {
        prompt += `## ${reviewerName}\n${agentLines}\n\n`;
      }
    }

    if (generalReviewer && reviewerName !== 'code-reviewer') {
      const generalLines = (generalReviewer.content || '').split('\n').filter(l => !l.startsWith('#') && !l.startsWith('---') && l.trim()).slice(0, 15).join('\n');
      if (generalLines) {
        prompt += `## General Code Review Standards\n${generalLines}\n`;
      }
    }

    return prompt;
  } catch {
    return `# Code Review Request\n\n## File\n${filePath}\n\nUnable to load review agent.`;
  }
}

module.exports = { listAgents, loadAgent, findReviewersForLanguage, buildReviewPrompt };
