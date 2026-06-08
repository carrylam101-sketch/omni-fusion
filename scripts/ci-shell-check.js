const fs = require('fs');
const path = require('path');

const files = [
  'bin/of.js', 'lib/codegraph.js', 'lib/ecc.js', 'lib/gstack.js',
  'scripts/co-install.js', 'scripts/check-install.js'
];

let issues = 0;
const root = path.resolve(__dirname, '..');

for (const f of files) {
  const content = fs.readFileSync(path.join(root, f), 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('execSync') || line.includes('spawnSync')) {
      const hasShellTrue = line.includes('shell: true') || line.includes('shell:true');
      const hasDollarBrace = line.includes('$' + '{');
      const hasPlusInterp = line.includes('+') && hasDollarBrace;
      if (!hasShellTrue && hasPlusInterp) {
        console.warn(f + ':' + (i + 1) + ' - potential injection: ' + line.trim());
        issues++;
      }
    }
  });
}

if (issues) {
  console.log('Found', issues, 'potential injection points (review manually)');
} else {
  console.log('No obvious injection patterns');
}
