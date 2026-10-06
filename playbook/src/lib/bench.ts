// The Bench: turns six sensory dials into an engineering brief.
// Every readout is a rule of thumb from public literature. The TFF lab confirms on the bench.
// No formulas, no usage levels.
import { TERRITORIES, DIALS, CODE, type Territory } from './content';
import type { Bench, Dials, SessionState, Concept } from './state';

export const DEFAULT_DIALS: Dials = { onset: 3, linger: 3, sweet: 2, warm: 1, lift: 3, tingle: 2 };
export const LEVEL = ['', 'Low', 'Medium', 'High'];

// Average and spread of the team's phones. Spread is where the conversation is.
export function teamDials(b?: Bench): { avg: Dials; min: Dials; max: Dials; n: number } {
  const all = Object.values(b?.dials || {});
  const avg: Dials = {}, min: Dials = {}, max: Dials = {};
  for (const d of DIALS) {
    const v = all.map((x) => x[d.id]).filter((x) => typeof x === 'number');
    avg[d.id] = v.length ? v.reduce((a, c) => a + c, 0) / v.length : DEFAULT_DIALS[d.id];
    min[d.id] = v.length ? Math.min(...v) : avg[d.id];
    max[d.id] = v.length ? Math.max(...v) : avg[d.id];
  }
  return { avg: b?.locked || avg, min, max, n: all.length };
}

export const baseTerritory = (s: SessionState, team: number, c?: Concept): Territory => {
  const id = s.bench[team]?.base;
  return TERRITORIES.find((t) => t.id === id)
    || TERRITORIES.find((t) => (c?.why || '').toLowerCase().includes(t.name.toLowerCase().split(',')[0]) || (c?.why || '').toLowerCase().includes(t.hero.toLowerCase()))
    || TERRITORIES[0];
};

// Compass (9 dims) at first impression, heart and finish, shaped by the dials on top of the territory.
export function compass(t: Territory, d: Dials): number[][] {
  const clamp = (x: number) => Math.max(0, Math.min(5, x));
  return t.prof.map((p, stage) => {
    const w = [0.9, 0.55, 0.25][stage]; // how much each dial shows up early vs late
    return [
      clamp(p[0] + (stage === 2 ? (d.linger - 3) * 0.6 : (d.onset - 3) * 0.6)), // cooling
      clamp(p[1] + (d.lift - 3) * 0.4 * w),
      clamp(p[2]),
      clamp(p[3] + (d.lift - 3) * 0.5 * w),
      clamp(p[4] + (d.sweet - 2) * 0.6),
      clamp(p[5] + (d.warm - 1) * 0.7 * (stage === 2 ? 0.3 : 1)),
      clamp(p[6] + (d.tingle - 2) * 0.7),
      clamp(p[7] - (d.onset - 3) * 0.4 - (d.tingle - 2) * 0.2),
      clamp(p[8] + (d.linger - 3) * 0.6),
    ];
  });
}

// Perceived freshness over time: first impression, heart, finish, linger (0 to 1). Illustrative.
export function curve(t: Territory, d: Dials): number[] {
  const f = (x: number) => Math.max(0.05, Math.min(1, x));
  return [
    f(t.curve[0] * 0.6 + d.onset * 0.07 + d.lift * 0.03),
    f(t.curve[1] * 0.6 + d.warm * 0.03 + d.sweet * 0.02 + d.tingle * 0.04),
    f(t.curve[2] * 0.5 + d.linger * 0.09),
    f(0.15 + d.linger * 0.15),
  ];
}

export type Readout = { key: string; label: string; value: string; tone: 'ok' | 'warn' | 'risk'; basis: string; override?: { value: string; note?: string } };

export function readouts(t: Territory, d: Dials, b?: Bench, c?: Concept): { list: Readout[]; code: { n: number; t: string; ok: boolean; why: string }[]; claims: boolean } {
  // Stability in an oxidizing base
  let risk = t.risk + (d.sweet >= 4 ? 1 : 0) + (d.lift >= 5 ? 1 : 0) - (d.lift <= 2 && t.risk > 1 ? 1 : 0);
  risk = Math.max(1, Math.min(3, risk));
  const stabilityWhy = t.riskWhy + (d.sweet >= 4 ? ' Higher sweetness adds reactive notes.' : '') + (d.lift >= 5 ? ' A bold top note means more volatile aromatics to protect.' : '');
  const ready = risk === 3 ? 'Screen first' : risk === 2 ? (t.fit === 'Proven today' ? 'Needs engineering' : t.fit) : t.fit === 'Screen first' ? 'Needs engineering' : t.fit;
  const horizon = risk === 1 && ready === 'Proven today' ? 'Now · 2027' : risk === 3 ? 'Future · 2029 to 2030' : 'Next · 2028';
  const formats: string[] = [];
  if (d.tingle >= 4 || d.onset >= 4) formats.push('Strip', 'Gum', 'Sachet');
  if (d.onset <= 2) formats.push('Rinse', 'Spray');
  if (t.id === 'ladder') formats.push('Kids rinse', 'Toothpaste');
  if (d.linger >= 4) formats.push('Rinse', 'Toothpaste');
  if (d.warm >= 3) formats.push('Lozenge');
  if (!formats.length) formats.push('Rinse', 'Toothpaste');
  const fmt = [...new Set(formats)].slice(0, 4).join(' · ');
  const list: Readout[] = [
    { key: 'stability', label: 'Stability risk', value: LEVEL[risk], tone: risk === 1 ? 'ok' : risk === 2 ? 'warn' : 'risk', basis: stabilityWhy },
    { key: 'readiness', label: 'Readiness', value: ready, tone: ready === 'Proven today' ? 'ok' : ready === 'Screen first' ? 'risk' : 'warn', basis: 'Territory evidence, adjusted for the stability risk above.' },
    { key: 'format', label: 'Format fit', value: fmt, tone: 'ok', basis: 'Fast onset and tingle suit strips and gum; soft profiles suit rinse and spray.' },
    { key: 'horizon', label: 'Horizon', value: horizon, tone: horizon.startsWith('Now') ? 'ok' : horizon.startsWith('Next') ? 'warn' : 'risk', basis: 'Proven and low risk ships first; anything to screen goes later.' },
  ];
  for (const r of list) { const o = b?.overrides[r.key]; if (o) r.override = o; }
  const code = [
    { ok: !(d.sweet >= 4 && d.linger <= 2), why: 'Sweet with a short finish may not end fresh.' },
    { ok: !(d.onset >= 5 && d.tingle >= 4), why: 'Maximum onset plus strong tingle can read as burn.' },
    { ok: true, why: '' },
    { ok: risk < 3, why: 'High stability risk: screen in the base first.' },
    { ok: d.linger >= 2, why: 'A short linger undercuts all-day freshness.' },
    { ok: !(d.lift <= 1 && d.warm <= 1 && d.tingle <= 1), why: 'Nothing distinctive: it risks being "another mint".' },
    { ok: d.sweet < 5, why: 'Maximum sweetness reads as candy, not care.' },
  ].map((x, i) => ({ n: CODE[i].n, t: CODE[i].t, ...x }));
  const claims = /glp|dry mouth|55\+/i.test(`${c?.segment || ''} ${c?.name || ''} ${c?.why || ''}`);
  return { list, code, claims };
}
