const fs = require('fs');
const p = 'd:\\SELEDA 0610\\src\\components\\Shared\\PermissionChecklist.tsx';
let c = fs.readFileSync(p, 'utf8');
const start = c.indexOf('// Module access level: read = view only');
const end = c.indexOf('// Legacy module access list');
if (start === -1 || end === -1) { console.log('Markers not found'); process.exit(1); }
const before = c.substring(0, start);
const after = c.substring(end);
const middle = require('./tmp-module-data.js');
fs.writeFileSync(p, before + middle + after);
console.log('Done. File updated.');
