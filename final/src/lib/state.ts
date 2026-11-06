// Event-sourced session. Every tap is an event; every surface folds the same log into the same state.
import { SCENES } from './scenes';
import type { Sealed } from './content';
import { SURVEY } from './content';
const LEGACY = SURVEY.legacy;

export type Ev = { id: string; seq?: number; t: number; kind: string; pid?: string; data?: any };

// `warm` is the optional warm-up answer from the join screen (a flavor that surprised them this year; added November 6).
export type Participant = { pid: string; name: string; role?: string; team?: number; joined: number; sim?: boolean; paper?: boolean; warm?: string };
export type Rating = { appeal: number; feels: number; newness: number; who: string[]; word?: string; guess?: string; fruitGuess?: string; advance?: string; card?: string; sweet?: string; cool?: string };
export type Dials = Record<string, number>;
export type Bench = { dials: Record<string, Dials>; base?: string; overrides: Record<string, { value: string; note?: string }>; locked?: Dials };
// `change` is what the next sample should do differently, and `agreed` is '1' once the room has said yes to the card:
// until then every field on it is a proposal.
export type Concept = { id: string; team: number; slot: number; name: string; segment: string; occasion: string; first: string; heart: string; finish: string; sensation: string[]; format: string; incremental: string; why: string; horizon: string; role?: string; change?: string; agreed?: string; suggestions: { pid: string; text: string }[] };
export type Placement = { horizon: string; role: string; t: number };
// One line of Now, Next, Later: what goes forward, who it's for, the flavor brief, who owns it on each side, the base and
// when the next sample is due. `next` is the free-text next step rows had before the brief and the date (still shown).
// `ref` is the concept or direction a line was placed from, and `draft` marks a flavor brief drafted from its profile
// (finalized in the write-up). `due` is a date from before November 4, or one of the morning's options. `change` is
// what the next sample should do differently (added November 5; older rows don't have it).
// `role` is its place in the portfolio (Core, Expanders, Explorers or Specialists; added November 6, older rows read it
// from their concept card).
export type PlanRow = { id: string; h: string; what: string; who?: string; brief?: string; change?: string; test?: string; owner?: string; reviewer?: string; base?: string; due?: string; step?: string; next?: string; ref?: string; draft?: string; role?: string; t: number };
export const PLAN_FIELDS = ['what', 'who', 'brief', 'change', 'test', 'owner', 'reviewer', 'base', 'due', 'step', 'next', 'ref', 'draft', 'role'] as const;

export type SessionState = {
  // Where the presentation is. `sceneId` names the slide; moves saved before the 17-slide deck carry only a position in
  // the old 36-slide order, so they leave it empty and nothing resumes from them.
  scene: number; step: number; sceneId?: string;
  participants: Record<string, Participant>;
  votes: Record<string, { open: boolean; locked: boolean; revealed: boolean; picks: Record<string, any> }>;
  ratings: Record<string, Record<string, Rating>>; // sample -> pid -> rating
  guesses: Record<string, Record<string, string>>; // molecule -> pid -> answer
  concepts: Record<string, Concept>;
  missions: string[]; // mission id per team (index 0..2)
  placements: Record<string, Placement>; // concept or seed id -> placement
  reactions: Record<string, Record<string, { v: string; text?: string }>>; // target -> pid -> reaction
  commitments: Record<string, { owner?: string; reviewer?: string; base?: string; action?: string; date?: string }>;
  calendar: Record<string, string>; // concept id -> season
  bench: Record<string, Bench>; // team -> bench
  survey: Record<string, { name: string; consumer?: string; other?: string; moment?: string; momentOther?: string; veto?: string; profile?: Record<string, number> }>;
  board: Record<string, string>; // horizon (Now, Next, Future) -> free text, from before the plan had rows
  plan: Record<string, PlanRow>; // Now, Next, Later, one row per direction, typed in the presentation or the presenter view
  marks: string[]; // white-space cells marked in the presentation, as 'segment|moment'
  notes: Record<string, string>; // the write-up's own words, typed by the team after the morning (summary, a note per objective)
  paperCards: number; // paper scorecards handed in on the day, counted with +1 and -1; the cards are typed in after the morning
  timer: { running: boolean; endsAt: number; remaining: number; total: number };
  spotlight: { kind: string; ref: string } | null;
  // The off-brand answer the presenter featured on Your pre-brief answers (a `feature` event, team only). Unlike the old
  // spotlight, moving between slides doesn't clear it. `hidden` lists what the presenter took off the TV by tap: warm-up
  // answers (`warm:<pid>`) and one-word tasting answers (`word:<text>`). Both added November 6.
  featured?: { kind: string; ref: string } | null;
  hidden?: string[];
  paper: boolean; blank: boolean; sound: boolean;
  revealed: Sealed | null; // the sample names, once the presentation has flipped them (a `reveal` event, team only)
  lastEvent: number;
};

export const initialState = (): SessionState => ({
  scene: 0, step: 0, participants: {}, votes: {}, ratings: {}, guesses: {}, concepts: {},
  missions: ['m1', 'm2'], placements: {}, reactions: {}, commitments: {}, calendar: {}, bench: {}, survey: {}, board: {}, plan: {}, marks: [], notes: {}, paperCards: 0,
  timer: { running: false, endsAt: 0, remaining: 0, total: 0 }, spotlight: null, featured: null, hidden: [], paper: false, blank: false, sound: false, revealed: null, lastEvent: 0,
});

// Role in the range before November 6, read as the portfolio role it matches (conceptLibrary.ts ROLE).
const OLD_ROLE: Record<string, string> = { 'Core range': 'Core (always-on mints)', 'New sub-line': 'Expanders (permanent, beyond mint)', 'Limited edition': 'Explorers (limited editions and drops)', 'Kids range': 'Specialists (dry mouth, night, kids)' };
const newRole = (f: any) => (f && typeof f.role === 'string' && OLD_ROLE[f.role] ? { ...f, role: OLD_ROLE[f.role] } : f);
const vote = (s: SessionState, key: string) => (s.votes[key] ||= { open: false, locked: false, revealed: false, picks: {} });

export function reduce(s: SessionState, e: Ev): SessionState {
  s.lastEvent = Math.max(s.lastEvent, e.t);
  const d = e.data || {};
  switch (e.kind) {
    case 'join': { const was = s.participants[e.pid!]; const warm = typeof d.warm === 'string' ? d.warm.trim().slice(0, 60) : ''; s.participants[e.pid!] = { ...(was || {}), pid: e.pid!, name: String(d.name || 'Guest').slice(0, 24), role: d.role, joined: was?.joined || e.t, sim: !!d.sim, paper: !!d.paper, warm: warm || was?.warm }; break; }
    case 'team': if (s.participants[e.pid!]) s.participants[e.pid!].team = d.team; break;
    case 'goto': {
      // A move names its slide (`id`) as well as its position. The name wins, so a position saved against an older order
      // of slides can never land the room somewhere else; a move with an unknown name or none clears `sceneId`.
      const byId = typeof d.id === 'string' ? SCENES.findIndex((x) => x.id === d.id) : -1;
      s.scene = byId >= 0 ? byId : Math.max(0, Math.min(SCENES.length - 1, Number(d.scene) || 0));
      s.sceneId = byId >= 0 ? d.id : undefined;
      s.step = Math.max(0, Math.min(SCENES[s.scene].builds, d.step || 0)); s.spotlight = null; break;
    }
    case 'vote': { const v = vote(s, d.key); if (d.action === 'open') { v.open = true; v.locked = false; } if (d.action === 'lock') { v.open = false; v.locked = true; } if (d.action === 'reveal') { v.revealed = true; v.open = false; v.locked = true; } if (d.action === 'reset') s.votes[d.key] = { open: false, locked: false, revealed: false, picks: {} }; break; }
    case 'pick': { const v = vote(s, d.key); if (!v.locked || d.paper) v.picks[e.pid!] = d.value; break; }
    case 'unpick': delete vote(s, d.key).picks[e.pid!]; break; // the presenter view taking back a hand vote
    case 'rate': if (s.votes.tasting?.locked && !onPaper(e.pid || '')) break; (s.ratings[d.sample] ||= {})[e.pid!] = { appeal: d.appeal, feels: d.feels, newness: d.newness, who: d.who || [], word: d.word, guess: d.guess, fruitGuess: d.fruitGuess, advance: d.advance, card: d.card, sweet: d.sweet, cool: d.cool }; break;
    case 'unrate': if (s.ratings[d.sample]) delete s.ratings[d.sample][e.pid!]; break; // removing a paper card typed in by mistake
    case 'guess': (s.guesses[d.molecule] ||= {})[e.pid!] = d.answer; break;
    case 'concept': { const id = `t${d.team}-${d.slot || 1}`; s.concepts[id] = { ...(s.concepts[id] || { suggestions: [] }), ...newRole(d.fields), id, team: d.team, slot: d.slot || 1 }; break; }
    case 'suggest': { const id = `t${d.team}-${d.slot || 1}`; const c = s.concepts[id] || ({ id, team: d.team, slot: d.slot || 1, suggestions: [] } as any); c.suggestions = [...(c.suggestions || []), { pid: e.pid!, text: String(d.text).slice(0, 140) }]; s.concepts[id] = c; break; }
    case 'mission': s.missions[d.team - 1] = d.mission; break;
    case 'place': if (d.horizon) s.placements[d.ref] = { horizon: d.horizon, role: d.role || 'Expanders', t: e.t }; else delete s.placements[d.ref]; break;
    case 'react': (s.reactions[d.target] ||= {})[e.pid!] = { v: d.value, text: d.text }; break;
    case 'commitment': s.commitments[d.ref] = { ...(s.commitments[d.ref] || {}), ...d.fields }; break;
    case 'season': if (d.season) s.calendar[d.ref] = d.season; else delete s.calendar[d.ref]; break;
    case 'dial': { const b = (s.bench[d.team] ||= { dials: {}, overrides: {} }); b.dials[e.pid!] = d.dials; break; }
    case 'benchbase': { const b = (s.bench[d.team] ||= { dials: {}, overrides: {} }); b.base = d.base; break; }
    case 'override': { const b = (s.bench[d.team] ||= { dials: {}, overrides: {} }); if (d.value) b.overrides[d.key] = { value: d.value, note: d.note }; else delete b.overrides[d.key]; break; }
    case 'benchlock': { const b = (s.bench[d.team] ||= { dials: {}, overrides: {} }); b.locked = d.dials || undefined; break; }
    case 'survey': s.survey[e.pid!] = { name: d.name, consumer: LEGACY[d.consumer] || d.consumer, other: typeof d.other === 'string' ? d.other.slice(0, 60) : undefined, moment: d.moment, momentOther: typeof d.momentOther === 'string' ? d.momentOther.slice(0, 60) : undefined, veto: d.veto, profile: d.profile }; break;
    case 'timer': {
      const now = e.t;
      if (d.action === 'start') s.timer = { running: true, total: d.secs, remaining: d.secs, endsAt: now + d.secs * 1000 };
      if (d.action === 'pause' && s.timer.running) s.timer = { ...s.timer, running: false, remaining: Math.max(0, (s.timer.endsAt - now) / 1000) };
      if (d.action === 'resume' && !s.timer.running) s.timer = { ...s.timer, running: true, endsAt: now + s.timer.remaining * 1000 };
      if (d.action === 'add') s.timer = s.timer.running ? { ...s.timer, endsAt: s.timer.endsAt + d.secs * 1000, total: s.timer.total + d.secs } : { ...s.timer, remaining: s.timer.remaining + d.secs, total: s.timer.total + d.secs };
      if (d.action === 'stop') s.timer = { running: false, endsAt: 0, remaining: 0, total: 0 };
      break;
    }
    case 'board': s.board[d.horizon] = String(d.text || '').slice(0, 2000); break;
    case 'plan': {
      const r = s.plan[d.id] || { id: String(d.id), h: 'Now', what: '', t: e.t };
      if (d.h) r.h = String(d.h);
      for (const f of PLAN_FIELDS) if (typeof d.fields?.[f] === 'string') (r as any)[f] = d.fields[f].slice(0, f === 'brief' ? 600 : 160); // a drafted brief runs longer
      s.plan[r.id] = r; break;
    }
    case 'unplan': delete s.plan[d.id]; break;
    case 'papercard': s.paperCards = Math.max(0, (s.paperCards || 0) + (Number(d.d) > 0 ? 1 : -1)); break;
    case 'note': if (typeof d.key === 'string' && d.key) s.notes[d.key.slice(0, 24)] = String(d.text || '').slice(0, 2400); break;
    case 'mark': s.marks = s.marks.includes(d.cell) ? s.marks.filter((x) => x !== d.cell) : [...s.marks, String(d.cell).slice(0, 120)]; break;
    case 'spotlight': s.spotlight = d.ref ? { kind: d.kind, ref: d.ref } : null; break;
    case 'feature': s.featured = d.ref ? { kind: String(d.kind || 'veto'), ref: String(d.ref).slice(0, 400) } : null; break;
    case 'hide': { const k = String(d.key || '').slice(0, 120); if (!k) break; const h = s.hidden || []; s.hidden = h.includes(k) ? h.filter((x) => x !== k) : [...h, k]; break; }
    case 'flag': (s as any)[d.name] = !!d.value; break;
    case 'reveal': if (d.samples) s.revealed = { samples: d.samples, heroes: d.heroes || {}, flavors: d.flavors || {} }; break;
    case 'seal': s.revealed = null; break; // a rehearsal going back before the tasting, so the next run-through is blind
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
// Places that keep ties (the November 4 review): equal totals share a place (1, 1, 3), so a tie is never settled by the
// order of a list. The top three are the first three places, plus anything tied with the third.
export function places(t: Record<string, number>) {
  const r = ranked(t).filter(([, n]) => n > 0);
  const out: Record<string, { n: number; place: number; tied: boolean }> = {};
  for (const [id, n] of r) out[id] = { n, place: 1 + r.filter(([, m]) => m > n).length, tied: r.filter(([, m]) => m === n).length > 1 };
  return out;
}
export const topIds = (t: Record<string, number>) => { const p = places(t); return ranked(t).filter(([id, n]) => n > 0 && p[id].place <= 3).map(([id]) => id); };
// The shortlist for the three concept cards. `sure` is every id whose place fits inside three seats with all of its tie
// (1, 1, 3 fits; so does a three-way tie for first). `tied` is a tie that straddles the cutoff (two tied for third, or
// four tied for first): the vote can't choose among them, so the room does, for the `seats` left. The totals stay as
// voted; this only says which ideas the vote settled.
export function shortlist(t: Record<string, number>) {
  const p = places(t), ids = topIds(t);
  const fits = (id: string) => p[id].place + ids.filter((x) => p[x].n === p[id].n).length - 1 <= 3;
  const sure = ids.filter(fits), tied = ids.filter((id) => !fits(id));
  return { ids, sure, tied, seats: tied.length ? 3 - sure.length : 0 };
}
const ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'];
export const placeLabel = (p?: { place: number; tied: boolean }) => (!p ? '' : p.tied ? `Tied for ${ORD[p.place] || p.place}` : `Number ${p.place}`);
export function tasteSummary(s: SessionState, sample: string) {
  const rs = Object.values(s.ratings[sample] || {});
  const avg = (k: 'appeal' | 'feels' | 'newness') => (rs.length ? rs.reduce((a, r) => a + (r[k] || 0), 0) / rs.length : 0);
  const who: Record<string, number> = {}; rs.forEach((r) => r.who.forEach((w) => (who[w] = (who[w] || 0) + 1)));
  // The sweetness and cooling checks: how many said not enough, just right or too much.
  const jar = (k: 'sweet' | 'cool') => { const t: Record<string, number> = {}; rs.forEach((r) => r[k] && (t[r[k]!] = (t[r[k]!] || 0) + 1)); return t; };
  return { n: rs.length, appeal: avg('appeal'), feels: avg('feels'), newness: avg('newness'), who, words: rs.map((r) => r.word).filter(Boolean) as string[], sweet: jar('sweet'), cool: jar('cool') };
}
// The most common sweetness or cooling answer and how many gave it, e.g. "Just right, 4 of 6".
export const jarTop = (t: Record<string, number>) => { const all = Object.values(t).reduce((a, b) => a + b, 0); const top = ranked(t)[0]; return top ? `${top[0]}, ${top[1]} of ${all}` : ''; };
export const jarAll = (t: Record<string, number>, opts: readonly string[]) => opts.filter((o) => t[o]).map((o) => `${t[o]} ${o.toLowerCase()}`).join(', ');
// Votes and scores typed in from the room: hand votes (pid hand-...) and paper scorecards (pid paper-...).
export const byHand = (pid: string) => pid.startsWith('hand-');
export const onPaper = (pid: string) => pid.startsWith('paper-');
export function voteCounts(s: SessionState, key: string) {
  const pids = Object.keys(s.votes[key]?.picks || {});
  const hand = pids.filter(byHand).length;
  return { phones: pids.length - hand, hand };
}
export function tasters(s: SessionState) {
  const pids = new Set(Object.values(s.ratings).flatMap((r) => Object.keys(r)));
  const cards = [...pids].filter(onPaper).length;
  return { phones: pids.size - cards, cards };
}
// How far the blind tasting has got: the phones that joined (anyone on paper is counted separately), how many have
// scored all four samples, and how many have scored each one. The TV shows this while people score, not the averages.
export function tastingProgress(s: SessionState, codes: string[]) {
  const phones = Object.values(s.participants).filter((p) => !p.paper).map((p) => p.pid);
  const done = phones.filter((pid) => codes.every((c) => s.ratings[c]?.[pid])).length;
  const per = Object.fromEntries(codes.map((c) => [c, Object.keys(s.ratings[c] || {}).filter((pid) => !onPaper(pid)).length])) as Record<string, number>;
  return { phones: phones.length, done, left: Math.max(0, phones.length - done), per };
}
// The scoring closes when the scores go up (a `tasting` lock, sent by the presentation); a phone can't change a score
// after that. Paper cards typed in afterwards still go in.
export const tastingClosed = (s: SessionState) => !!s.votes.tasting?.locked;
export const people = (s: SessionState) => Object.values(s.participants).sort((a, b) => a.joined - b.joined);
export const uid = () => (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36));
