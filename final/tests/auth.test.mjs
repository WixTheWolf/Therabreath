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

test('the host password is separate from the room password', async () => {
  process.env.PLAYBOOK_PASSWORD = 'room-only'; process.env.PLAYBOOK_HOST_PASSWORD = 'host-only';
  try {
    assert.equal(await auth.checkPassword('room-only'), true);
    assert.equal(await auth.checkHostPassword('room-only'), false);
    assert.equal(await auth.checkHostPassword('host-only'), true);
    assert.equal(await auth.checkPassword('host-only'), false);
  } finally { delete process.env.PLAYBOOK_PASSWORD; delete process.env.PLAYBOOK_HOST_PASSWORD; }
});

test('the room cookie never passes as the host cookie', async () => {
  const room = await auth.authToken(), host = await auth.hostToken();
  assert.notEqual(room, host);
  assert.equal(await auth.isHost(room), false);
  assert.equal(await auth.isHost(host), true);
  assert.equal(await auth.isAuthed(host), false);
});

test('the team link only opens with its key', async () => {
  delete process.env.PLAYBOOK_TEAM_KEY;
  for (const k of ['', ' ', 'team', 'norco-console-1109', 'a'.repeat(20)]) assert.equal(await auth.checkTeamKey(k), false);
  process.env.PLAYBOOK_TEAM_KEY = 'Rehearsal-Team-Key';
  try {
    assert.equal(await auth.checkTeamKey('rehearsal-team-key'), true);
    assert.equal(await auth.checkTeamKey('rehearsal-team-keyx'), false);
  } finally { delete process.env.PLAYBOOK_TEAM_KEY; }
});

test('the team pages and the closing film need the team link, the front door does not', async () => {
  for (const p of ['/host', '/host/run', '/host/writeup', '/files/The-Future-of-Freshness-Deck.pdf', '/team', '/scorecard', '/stage/FOF1109', '/media/flavor-race.mp4', '/media/flavor-race-poster.jpg']) assert.equal(auth.teamOnly(p), true, p);
  for (const p of ['/', '/login', '/survey/FOF1109', '/j/FOF1109', '/playbook/FOF1109', '/media/opening.mp4', '/hostess', '/filesx']) assert.equal(auth.teamOnly(p), false, p);
});

test('the built-in client and team passwords are never the same', async () => {
  // The sign-in checks the team password first, so one password for both would give Church & Dwight the team pages.
  delete process.env.PLAYBOOK_PASSWORD; delete process.env.PLAYBOOK_HOST_PASSWORD;
  assert.notEqual(await auth.passwordHash(), await auth.hostHash());
});

test('on the server, the signing key does not come from the password hashes in this repository', async () => {
  delete process.env.PLAYBOOK_SECRET;
  const fromHash = [await auth.authToken(), await auth.hostToken(), await auth.joinToken('FOF1109')];
  process.env.POSTGRES_URL = 'postgres://user:server-only@db.example:5432/postgres';
  try {
    const fromDb = [await auth.authToken(), await auth.hostToken(), await auth.joinToken('FOF1109')];
    fromDb.forEach((t, i) => assert.notEqual(t, fromHash[i]));
    process.env.PLAYBOOK_SECRET = 'set-on-vercel';
    assert.notEqual(await auth.authToken(), fromDb[0]);
  } finally { delete process.env.POSTGRES_URL; delete process.env.PLAYBOOK_SECRET; }
});

test('the owner link is off until PLAYBOOK_OWNER_KEY is set, and needs at least 20 characters', async () => {
  delete process.env.PLAYBOOK_OWNER_KEY;
  assert.equal(auth.ownerEnabled(), false);
  assert.equal(await auth.checkOwnerKey(''), false);
  assert.equal(await auth.isOwner(await auth.ownerToken()), false);
  process.env.PLAYBOOK_OWNER_KEY = 'too-short';
  try { assert.equal(auth.ownerEnabled(), false); assert.equal(await auth.checkOwnerKey('too-short'), false); } finally { delete process.env.PLAYBOOK_OWNER_KEY; }
});

test('only the exact owner key opens the answers, and changing it signs the old cookie out', async () => {
  process.env.PLAYBOOK_OWNER_KEY = 'Owner-Test-Key-0123456789';
  try {
    assert.equal(await auth.checkOwnerKey('Owner-Test-Key-0123456789'), true);
    assert.equal(await auth.checkOwnerKey(' Owner-Test-Key-0123456789 '), true);
    for (const k of ['owner-test-key-0123456789', 'Owner-Test-Key-012345678', '']) assert.equal(await auth.checkOwnerKey(k), false);
    const cookie = await auth.ownerToken();
    assert.equal(await auth.isOwner(cookie), true);
    assert.equal(await auth.isOwner(await auth.hostToken()), false);
    assert.equal(await auth.isOwner(await auth.authToken()), false);
    process.env.PLAYBOOK_OWNER_KEY = 'Another-Owner-Key-0123456789';
    assert.equal(await auth.isOwner(cookie), false);
  } finally { delete process.env.PLAYBOOK_OWNER_KEY; }
});

test('the team key and the host cookie are not the owner key', async () => {
  process.env.PLAYBOOK_OWNER_KEY = 'Owner-Test-Key-0123456789';
  process.env.PLAYBOOK_TEAM_KEY = 'team-test-key';
  try {
    assert.equal(await auth.checkOwnerKey('team-test-key'), false);
    assert.equal(await auth.checkTeamKey('Owner-Test-Key-0123456789'), false);
  } finally { delete process.env.PLAYBOOK_OWNER_KEY; delete process.env.PLAYBOOK_TEAM_KEY; }
});

test('the Church & Dwight pass only takes its own token, and is none of the other cookies or links', async () => {
  const t = await auth.clientToken();
  assert.equal(t.length, 24);
  assert.equal(await auth.isClient(t), true);
  for (const x of ['', null, undefined, t.slice(0, 23), t + 'x', await auth.joinToken('FOF1109'), await auth.authToken(), await auth.hostToken()]) assert.equal(await auth.isClient(x), false);
  assert.equal(await auth.isHost(t), false);
  assert.equal(await auth.isAuthed(t), false);
  process.env.PLAYBOOK_SECRET = 'rotated';
  try { assert.notEqual(await auth.clientToken(), t); } finally { delete process.env.PLAYBOOK_SECRET; }
});

test('the Church & Dwight pass opens two files and no team page', () => {
  assert.deepEqual([...auth.CLIENT_FILES].sort(), ['/files/The-Future-of-Freshness-Slides.pdf', '/media/flavor-race.mp4']);
  for (const p of ['/files/The-Future-of-Freshness-Deck.pdf', '/files/The-Future-of-Freshness-Presenter-Deck.pdf', '/files/The-Future-of-Freshness-Run-Sheet.pdf', '/host', '/team']) assert.equal(auth.CLIENT_FILES.has(p), false);
});
