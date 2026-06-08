#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

try {
  const fusePath = path.join(__dirname, '..', 'fuse.json');
  if (!fs.existsSync(fusePath)) {
    console.error('fuse.json not found at', fusePath);
    process.exitCode = 1; return;
  }
  const fuse = JSON.parse(fs.readFileSync(fusePath, 'utf8'));

  let md = `# Omni-Fusion v${fuse.version || '?'} — Architecture Reference\n\n*Generated from fuse.json | ${new Date().toISOString().split('T')[0]}*\n\n## Projects\n\n| Project | Version | Install |\n|---------|---------|---------|\n`;

  for (const [key, val] of Object.entries(fuse.projects || {})) {
    md += `| **${val.repo || key}** | ${val.version || 'latest'} | ${val.install ? '`' + val.install + '`' : '—'} |\n`;
  }

  md += `\n## Fusion Points\n\n`;
  for (const [key, val] of Object.entries(fuse.fusionPoints || {})) {
    md += `### ${key}\n`;
    md += `- From: \`${val.from}\` → To: \`${val.to || val.via}\`\n`;
    md += `- How: ${val.how}\n\n`;
  }

  md += `\n## Pipelines\n\n`;
  for (const [key, val] of Object.entries(fuse.pipelineOrder || {})) {
    md += `### ${key}\n\`\`\`\n${val.join(' → ')}\n\`\`\`\n\n`;
  }

  const outDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'ARCHITECTURE.md'), md);
  console.log('Generated docs/ARCHITECTURE.md');
} catch (e) {
  console.error('build-docs failed:', e.message);
  process.exitCode = 1;
}
