// Event-sourced session. Every tap is an event; every surface folds the same log into the same state.
import { SCENES } from './scenes';

export type Ev = { id: string; seq?: number; t: number; kind: string; pid?: string; data?: any };

export type Participant = { pid: string; name: string; role?: string; team?: number; joined: number; sim?: boolean; paper?: boolean };
export type Rating = { appeal: number; feels: number; newness: number; who: string[]; word?: string; guess?: string };
export type Dials = Record<string, number>;
export type Bench = { dials: Record<string, Dials>; base?: string; overrides: Record<string, { value: string; note?: string }>; locked?: Dials };
export type Concept = { id: string; team: number; slot: number; name: string; segment: string; occasion: string; first: string; heart: string; finish: string; sensation: string[]; format: string; incremental: string; why: string; horizon: string; suggestions: { pid: string; text: string }[] };
export type Placement = { horizon: string; role: string; t: number };

export type SessionState = {
  scene: number; step: number;
  participants: Record<string, Participant>;
  votes: Record<string, { open: boolean; locked: boolean; revealed: boolean; picks: Record<string, any> }>;
  ratings: Record<string, Record<string, Rating>>; // sample -> pid -> rating
  guesses: Record<string, Record<string, string>>; // molecule -> pid -> answer
  concepts: Record<string, Concept>;
  missions: string[]; // mission id per team (index 0..2)
  placements: Record<string, Placement>; // concept or seed id -> placement
  reactions: Record<string, Record<string, { v: string; text?: string }>>; // target -> pid -> reaction
  calendar: Record<string, string>; // concept id -> season
  bench: Record<string, Bench>; // team -> bench
  survey: Record<string, { name: string; consumer?: string; moment?: string; veto?: string; profile?: Record<string, number> }>;
  timer: { running: boolean; endsAt: number; remaining: number; total: number };
  spotlight: { kind: string; ref: string } | null;
  paper: boolean; blank: boolean; sound: boolean;
  lastEvent: number;
};

export const initialState = (): SessionState => ({
  scene: 0, step: 0, participants: {}, votes: {}, ratings: {}, guesses: {}, concepts: {},
  missions: ['m1', 'm2', 'm3'], placements: {}, reactions: {}, calendar: {}, bench: {}, survey: {},
  timer: { running: false, endsAt: 0, remaining: 0, total: 0 }, spotlight: null, paper: false, blank: false, sound: false, lastEvent: 0,
});

const vote = (s: SessionState, key: string) => (s.votes[key] ||= { open: false, locked: false, revealed: false, picks: {} });

export function reduce(s: SessionState, e: Ev): SessionState {
  s.lastEvent = Math.max(s.lastEvent, e.t);
  const d = e.data || {};
  switch (e.kind) {
    case 'join': s.participants[e.pid!] = { ...(s.participants[e.pid!] || {}), pid: e.pid!, name: String(d.name || 'Guest').slice(0, 24), role: d.role, joined: s.participants[e.pid!]?.joined || e.t, sim: !!d.sim, paper: !!d.paper }; break;
    case 'team': if (s.participants[e.pid!]) s.participants[e.pid!].team = d.team; break;
    case 'goto': s.scene = Math.max(0, Math.min(SCENES.length - 1, d.scene)); s.step = Math.max(0, Math.min(SCENES[s.scene].builds, d.step || 0)); s.spotlight = null; break;
    case 'vote': { const v = vote(s, d.key); if (d.action === 'open') { v.open = true; v.locked = false; } if (d.action === 'lock') { v.open = false; v.locked = true; } if (d.action === 'reveal') { v.revealed = true; v.open = false; v.locked = true; } if (d.action === 'reset') s.votes[d.key] = { open: false, locked: false, revealed: false, picks: {} }; break; }
    case 'pick': { const v = vote(s, d.key); if (!v.locked || d.paper) v.picks[e.pid!] = d.value; break; }
    case 'rate': (s.ratings[d.sample] ||= {})[e.pid!] = { appeal: d.appeal, feels: d.feels, newness: d.newness, who: d.who || [], word: d.word, guess: d.guess }; break;
    case 'guess': (s.guesses[d.molecule] ||= {})[e.pid!] = d.answer; break;
    case 'concept': { const id = `t${d.team}-${d.slot || 1}`; s.concepts[id] = { ...(s.concepts[id] || { suggestions: [] }), ...d.fields, id, team: d.team, slot: d.slot || 1 }; break; }
    case 'suggest': { const id = `t${d.team}-${d.slot || 1}`; const c = s.concepts[id] || ({ id, team: d.team, slot: d.slot || 1, suggestions: [] } as any); c.suggestions = [...(c.suggestions || []), { pid: e.pid!, text: String(d.text).slice(0, 140) }]; s.concepts[id] = c; break; }
    case 'mission': s.missions[d.team - 1] = d.mission; break;
    case 'place': if (d.horizon) s.placements[d.ref] = { horizon: d.horizon, role: d.role || 'Expanders', t: e.t }; else delete s.placements[d.ref]; break;
    case 'react': (s.reactions[d.target] ||= {})[e.pid!] = { v: d.value, text: d.text }; break;
    case 'season': if (d.season) s.calendar[d.ref] = d.season; else delete s.calendar[d.ref]; break;
    case 'dial': { const b = (s.bench[d.team] ||= { dials: {}, overrides: {} }); b.dials[e.pid!] = d.dials; break; }
    case 'benchbase': { const b = (s.bench[d.team] ||= { dials: {}, overrides: {} }); b.base = d.base; break; }
    case 'override': { const b = (s.bench[d.team] ||= { dials: {}, overrides: {} }); if (d.value) b.overrides[d.key] = { value: d.value, note: d.note }; else delete b.overrides[d.key]; break; }
    case 'benchlock': { const b = (s.bench[d.team] ||= { dials: {}, overrides: {} }); b.locked = d.dials || undefined; break; }
    case 'survey': s.survey[e.pid!] = { name: d.name, consumer: d.consumer, moment: d.moment, veto: d.veto, profile: d.profile }; break;
    case 'timer': {
      const now = e.t;
      if (d.action === 'start') s.timer = { running: true, total: d.secs, remaining: d.secs, endsAt: now + d.secs * 1000 };
      if (d.action === 'pause' && s.timer.running) s.timer = { ...s.timer, running: false, remaining: Math.max(0, (s.timer.endsAt - now) / 1000) };
      if (d.action === 'resume' && !s.timer.running) s.timer = { ...s.timer, running: true, endsAt: now + s.timer.remaining * 1000 };
      if (d.action === 'add') s.timer = s.timer.running ? { ...s.timer, endsAt: s.timer.endsAt + d.secs * 1000, total: s.timer.total + d.secs } : { ...s.timer, remaining: s.timer.remaining + d.secs, total: s.timer.total + d.secs };
      if (d.action === 'stop') s.timer = { running: false, endsAt: 0, remaining: 0, total: 0 };
      break;
    }
    case 'spotlight': s.spotlight = d.ref ? { kind: d.kind, ref: d.ref } : null; break;
    case 'flag': (s as any)[d.name] = !!d.value; break;
    case 'wipe': return initialState();
  }
  return s;
}

export const fold = (events: Ev[]) => events.reduce((s, e) => reduce(s, e), initialState());

// Derived tallies used by Stage, Console and the Playbook
export function tallyPick(s: SessionState, key: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const v of Object.values(s.votes[key]?.picks || {})) {
    if (Array.isArray(v)) v.forEach((id: string) => (out[id] = (out[id] || 0) + 1));
    else if (v && typeof v === 'object') for (const [id, n] of Object.entries(v)) out[id] = (out[id] || 0) + Number(n || 0);
  }
  return out;
}
export const ranked = (t: Record<string, number>) => Object.entries(t).sort((a, b) => b[1] - a[1]);
export function tasteSummary(s: SessionState, sample: string) {
  const rs = Object.values(s.ratings[sample] || {});
  const avg = (k: 'appeal' | 'feels' | 'newness') => (rs.length ? rs.reduce((a, r) => a + (r[k] || 0), 0) / rs.length : 0);
  const who: Record<string, number> = {}; rs.forEach((r) => r.who.forEach((w) => (who[w] = (who[w] || 0) + 1)));
  return { n: rs.length, appeal: avg('appeal'), feels: avg('feels'), newness: avg('newness'), who, words: rs.map((r) => r.word).filter(Boolean) as string[] };
}
export const people = (s: SessionState) => Object.values(s.participants).sort((a, b) => a.joined - b.joined);
export const uid = () => (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36));
