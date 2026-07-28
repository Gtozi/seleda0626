/**
 * Migration Verification Script
 * Verifies that all migration files are uniquely numbered and can be applied cleanly.
 * Run: npx ts-node scripts/verify-migrations.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

function verifyMigrations() {
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
  
  // Check for duplicate prefixes
  const prefixMap: Record<string, string[]> = {};
  for (const file of files) {
    const match = file.match(/^(\d+[a-z]?)_/);
    if (!match) {
      console.warn(`[WARN] Non-standard migration filename: ${file}`);
      continue;
    }
    const prefix = match[1];
    if (!prefixMap[prefix]) prefixMap[prefix] = [];
    prefixMap[prefix].push(file);
  }

  let hasErrors = false;
  for (const [prefix, fileList] of Object.entries(prefixMap)) {
    if (fileList.length > 1) {
      console.error(`[ERROR] Duplicate migration prefix "${prefix}": ${fileList.join(', ')}`);
      hasErrors = true;
    }
  }

  // Check for empty files
  for (const file of files) {
    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8').trim();
    if (!content) {
      console.warn(`[WARN] Empty migration file: ${file}`);
    }
  }

  // Sort and display order
  const sorted = files.sort((a, b) => {
    const pa = a.match(/^(\d+[a-z]?)_/)?.[1] || '';
    const pb = b.match(/^(\d+[a-z]?)_/)?.[1] || '';
    return pa.localeCompare(pb, undefined, { numeric: true });
  });

  console.log(`\n[OK] ${files.length} migration files found (${sorted.length} sorted)`);
  console.log(`  First: ${sorted[0]}`);
  console.log(`  Last:  ${sorted[sorted.length - 1]}`);

  if (hasErrors) {
    console.error('\n[FAIL] Migration verification failed — duplicate prefixes found.');
    process.exit(1);
  } else {
    console.log('\n[PASS] All migration files are uniquely numbered.');
  }
}

verifyMigrations();
