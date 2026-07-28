const fs = require('fs');
const p = 'd:\\SELEDA 0610\\src\\components\\Shared\\PermissionChecklist.tsx';
let c = fs.readFileSync(p, 'utf8');
const lines = c.split('\n');
let out = [];
let skip = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("finance: [")) { out.push(lines[i]); skip = true; continue; }
  if (skip && lines[i].trim() === '],') { out.push(lines[i]); skip = false; continue; }
  if (skip) continue;
  out.push(lines[i]);
}
fs.writeFileSync(p, out.join('\n'));
console.log('done');
