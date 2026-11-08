// The room's pre-brief answers, read once and shared by every slide that quotes them back (5, 7, 9, 12, 17 and the
// concept cards on 18). Read only: the presentation hands this the session's `survey` (in a rehearsal, the live answers
// without names, see liveSurvey.ts) and it never writes anything. Every value here is null when there's nothing clear to
// say (no answers, or a tie for the top), and each slide then keeps its own wording.
import { SURVEY } from './content';
import type { SessionState } from './state';

type Answers = SessionState['survey'][string][];
export type Top = { label: string; count: number; total: number };
export const answersOf = (survey?: SessionState['survey'] | null): Answers => Object.values(survey || {});

// The top answer among `options`, or null with no answers or a tie at the top. `total` is everyone who answered the
// question (an answer outside the options, like Someone else, still counts toward it).
function topOf(answers: Answers, key: 'consumer' | 'moment', options: readonly string[]): Top | null {
  const given = answers.map((a) => a[key]).filter(Boolean) as string[];
  const t: Record<string, number> = {};
  for (const v of given) if (options.includes(v)) t[v] = (t[v] || 0) + 1;
  const r = Object.entries(t).sort((a, b) => b[1] - a[1]);
  if (!r.length || (r[1] && r[1][1] === r[0][1])) return null;
  return { label: r[0][0], count: r[0][1], total: given.length };
}
const AUDIENCES = SURVEY.consumer.options.filter((o) => o !== SURVEY.consumer.other);
export const topAudience = (answers: Answers) => topOf(answers, 'consumer', AUDIENCES);
// The moment exactly as the day arc labels it (After coffee, Wake-up and so on).
export const topOccasion = (answers: Answers) => topOf(answers, 'moment', SURVEY.moment.options);

// Each audience in plain words, for a sentence: "4 of 5 of you want to win people who buy another brand."
export const AUDIENCE_PLAIN: Record<string, string> = {
  'Loyal TheraBreath users': 'loyal TheraBreath users',
  'Mouthwash users who buy another brand': 'people who buy another brand',
  'People who don’t use mouthwash yet': 'people who don’t use mouthwash yet',
  'People who want it milder': 'people who want it milder',
  'Gen Z': 'Gen Z',
  'Families with kids and tweens': 'families with kids and tweens',
  'People 55 and over': 'people 55 and over',
  'People living with dry mouth': 'people living with dry mouth',
  'Shoppers outside the US': 'shoppers outside the US',
};
export const plainAudience = (label: string) => AUDIENCE_PLAIN[label] || label.charAt(0).toLowerCase() + label.slice(1);
// The three groups on Out of every 100 households: the 14 who buy TheraBreath, the 51 who buy another brand and the 35
// who don't buy mouthwash. Only these three audiences are one of them.
export const AUDIENCE_GROUP: Record<string, 'tb' | 'another' | 'none'> = {
  'Loyal TheraBreath users': 'tb',
  'Mouthwash users who buy another brand': 'another',
  'People who don’t use mouthwash yet': 'none',
};
// The closest Who it's for on a concept card (conceptLibrary.ts). The rest have no close match, so an adult card keeps its
// direction's own default.
export const AUDIENCE_WHO: Record<string, string> = {
  'Loyal TheraBreath users': 'Loyal TheraBreath users',
  'Mouthwash users who buy another brand': 'People who buy another mouthwash',
  'People who don’t use mouthwash yet': 'People who don’t buy mouthwash yet',
  'People who want it milder': 'People who find mouthwash too strong',
};

// The freshness sliders, read back in the slider's own words. Each slider's average is rounded; 2 or less leans to the
// left label, 4 or more to the right, 3 is the middle.
export const LEAN: Record<string, [string, string]> = { adv: ['the familiar', 'the adventurous'], cool: ['strong cooling', 'gentle cooling'], bot: ['classic mint', 'mint with other notes'], exp: ['a rinse that just does the job', 'something to enjoy'], occ: ['a flavor for any time of day', 'a flavor made for one moment'] };
export const listOf = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
export function roomProfile(answers: Answers) {
  const ps = answers.map((a) => a.profile).filter(Boolean) as Record<string, number>[]; const out: Record<string, number> = {};
  for (const k of Object.keys(LEAN)) out[k] = ps.length ? Math.round(ps.reduce((s, p) => s + (p[k] || 3), 0) / ps.length) : 3;
  return out;
}
export const leans = (p: Record<string, number>) => Object.keys(LEAN).filter((k) => p[k] <= 2 || p[k] >= 4).map((k) => LEAN[k][p[k] <= 2 ? 0 : 1]);
// "toward the adventurous and something to enjoy", or null when nobody answered the sliders or every one sits in the
// middle. `adventurous` says whether the room leans that way (slide 12 asks about it).
export function lean(answers: Answers) {
  if (!answers.some((a) => a.profile)) return null;
  const p = roomProfile(answers), l = leans(p);
  return l.length ? { text: `toward ${listOf(l)}`, adventurous: p.adv >= 4, parts: l } : null;
}

// The off-brand answers, each once with how many gave it, most given first. `key` is the answer lowercased without its
// end punctuation: the same answer from several people shows once, and the presenter features an answer by its key.
export const vetoKey = (v: string) => v.trim().toLowerCase().replace(/[.!]+$/, '');
export function offBrand(answers: Answers) {
  const m: Record<string, { key: string; text: string; n: number }> = {};
  for (const v of answers.map((a) => a.veto).filter(Boolean) as string[]) {
    const key = vetoKey(v); if (!key) continue;
    m[key] = { key, text: m[key]?.text || v.trim().replace(/[.!]+$/, ''), n: (m[key]?.n || 0) + 1 };
  }
  return Object.values(m).sort((a, b) => b.n - a.n);
}
// The answer the presenter featured on slide 5 (the `feature` event), or null when nothing is featured or the answer
// isn't there any more.
export function featuredQuote(s: Pick<SessionState, 'featured'>, answers: Answers) {
  const f = s.featured;
  if (!f || f.kind !== 'veto') return null;
  return offBrand(answers).find((x) => x.key === f.ref)?.text || null;
}
// Whether someone wrote a phrase in their off-brand or Someone else answer (slide 9 quotes two of them). A question that
// quotes an answer falls back to its own wording when the phrase isn't there.
export const said = (answers: Answers, phrase: string) => answers.some((a) => [a.veto, a.other, a.momentOther].some((v) => typeof v === 'string' && v.toLowerCase().includes(phrase.toLowerCase())));

// Everything the slides read, in one call.
export function prebrief(s: Pick<SessionState, 'survey' | 'featured'>) {
  const answers = answersOf(s.survey);
  return { answers, n: answers.length, topAudience: topAudience(answers), topOccasion: topOccasion(answers), lean: lean(answers), featuredQuote: featuredQuote(s, answers) };
}
