// Security regression tests for the password gate and signed join links.
// Run with: node --experimental-strip-types --test playbook/tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as auth from '../src/lib/auth.ts';

test('wrong or empty passwords fail against the built-in hash', async () => {
  delete process.env.PLAYBOOK_PASSWORD;
  for (const p of ['', ' ', 'password', 'TB1109', 'therabreath']) assert.equal(await auth.checkPassword(p), false);
});

test('case and surrounding spaces are ignored', async () => {
  process.env.PLAYBOOK_PASSWORD = 'Rehearsal-Only';
  try {
    for (const p of ['rehearsal-only', 'REHEARSAL-ONLY', '  Rehearsal-only ']) assert.equal(await auth.checkPassword(p), true);
  } finally { delete process.env.PLAYBOOK_PASSWORD; }
});

test('PLAYBOOK_PASSWORD replaces the built-in password', async () => {
  process.env.PLAYBOOK_PASSWORD = 'rehearsal-only';
  try {
    assert.equal(await auth.checkPassword('rehearsal-only'), true);
    assert.equal(await auth.checkPassword('rehearsal-onlyx'), false);
  } finally { delete process.env.PLAYBOOK_PASSWORD; }
});

test('only the signed cookie value is accepted', async () => {
  const token = await auth.authToken();
  assert.equal(await auth.isAuthed(token), true);
  assert.equal(await auth.isAuthed(token.slice(0, -1) + (token.endsWith('0') ? '1' : '0')), false);
  assert.equal(await auth.isAuthed(''), false);
  assert.equal(await auth.isAuthed(undefined), false);
});

test('join links are bound to one session code', async () => {
  const a = await auth.joinToken('TB1109');
  assert.equal(a.length, 16);
  assert.equal(await auth.joinToken('tb1109'), a);
  assert.notEqual(await auth.joinToken('TB1110'), a);
});

test('PLAYBOOK_SECRET rotates cookies and join links', async () => {
  const before = [await auth.authToken(), await auth.joinToken('TB1109')];
  process.env.PLAYBOOK_SECRET = 'rotated';
  try {
    assert.notEqual(await auth.authToken(), before[0]);
    assert.notEqual(await auth.joinToken('TB1109'), before[1]);
  } finally { delete process.env.PLAYBOOK_SECRET; }
});
