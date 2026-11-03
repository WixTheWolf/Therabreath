// The blind tasting stays blind: no browser file may import the sealed names, and no browser bundle may carry them.
// Run after `next build` for the bundle check (it is skipped when there is no build).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const sealedSrc = readFileSync('src/lib/sealed.ts', 'utf8');
const names = [...sealedSrc.matchAll(/name: '([^']+)'/g)].map((m) => m[1]).filter((n) => n !== 'Mystery Flavor');
const notes = [...sealedSrc.matchAll(/note: '([^']+)'/g)].map((m) => m[1]);

test('no client file imports the sealed names', () => {
  for (const f of walk('src').filter((p) => /\.(tsx?|jsx?)$/.test(p))) {
    const s = readFileSync(f, 'utf8');
    if (/^['"]use client['"]/m.test(s)) assert.ok(!/from ['"]@\/lib\/sealed['"]|from ['"]\.\/sealed['"]/.test(s), `${f} imports src/lib/sealed`);
  }
});

test('the sealed names and notes appear nowhere else in the source', () => {
  for (const f of walk('src').filter((p) => /\.(tsx?|jsx?)$/.test(p) && !p.endsWith('sealed.ts'))) {
    const s = readFileSync(f, 'utf8');
    for (const x of [...names, ...notes]) assert.ok(!s.includes(x), `${f} carries "${x}"`);
  }
});

test('no browser bundle carries a sample name or what is in it', { skip: !existsSync('.next/static') }, () => {
  for (const f of walk('.next/static').filter((p) => p.endsWith('.js'))) {
    const s = readFileSync(f, 'utf8');
    for (const x of [...names, ...notes]) assert.ok(!s.includes(x), `${f} carries "${x}"`);
  }
});
