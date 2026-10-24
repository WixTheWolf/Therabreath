#!/usr/bin/env node
// Brand rule: no em dashes and no en dashes, anywhere. Exits 1 and lists every hit.
// usage: node check-dashes.mjs [dir ...]   (default: the playbook folder)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const roots = process.argv.slice(2).length ? process.argv.slice(2) : [resolve(here, '../..')];
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'out']);
const TEXT = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.json', '.css', '.html', '.md', '.txt', '.svg', '.yml', '.yaml', '.glsl']);
const BAD = /[\u2013\u2014]/g;
let hits = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) { if (!SKIP_DIRS.has(name)) walk(p); continue; }
    if (TEXT.has(extname(name).toLowerCase())) check(p);
  }
}
function check(p) {
  readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
    if (BAD.test(line)) { hits++; console.log(`${p}:${i + 1}: ${line.trim().slice(0, 120)}`); }
    BAD.lastIndex = 0;
  });
}
roots.forEach((r) => (statSync(r).isFile() ? check(r) : walk(r)));
if (hits) { console.error(`\n${hits} line(s) contain an em dash or en dash. Use a comma, colon, period, parentheses, or "to".`); process.exit(1); }
console.log('No em dashes or en dashes found.');
