// The concept cards and Now, Next, Later on November 9 are built by tapping, never typing. Everything the room can pick
// lives here, so the team can edit it before the morning: the option lists for each field, and a small library of
// starter concept cards. Every drafted card is marked DRAFT until the team has reviewed it.
// Samples are named here only by their code: their names stay sealed (sealed.ts) until the tasting reveal, and the
// presentation shows the revealed name wherever a card starts from a sample.
import { SAMPLES, PRIMARY_TERRITORIES, TEAM } from './content';

// Where a concept starts: the four samples (by code; the screen shows each one's name once revealed), then the four
// directions on the map.
export const STARTS: { id: string; label: string; kind: 'sample' | 'direction'; territory: string; base?: string }[] = [
  ...SAMPLES.map((x) => ({ id: x.code, label: `Sample ${x.code}`, kind: 'sample' as const, territory: x.territory, base: x.base })),
  ...PRIMARY_TERRITORIES.map((t) => ({ id: t.id, label: t.name, kind: 'direction' as const, territory: t.id })),
];

export const WHO = ['Loyal TheraBreath users', 'People who find mouthwash too strong', 'People who buy another mouthwash', 'People who don’t buy mouthwash yet', 'Families with kids and tweens', 'Adults who want something new'];
export const WHEN = ['First thing in the morning', 'After meals', 'On the go', 'Before a social moment', 'Wind-down, before bed'];
export const ROLE = ['Core range', 'Limited edition', 'New sub-line', 'Kids range'];
export const FORMAT = ['Rinse', 'Portable rinse sachet', 'Spray', 'Lozenge, mint or gum', 'Toothpaste'];
export const GROWS = ['Loyal users', 'New users', 'Both'];

// The concept card's fields, in the order the card shows them. `key` is where each one is stored on the concept (the
// names the session has used since the concepts were typed in).
export const CONCEPT_FIELDS: { key: 'why' | 'segment' | 'occasion' | 'role' | 'format' | 'incremental'; l: string; opts?: string[] }[] = [
  { key: 'why', l: 'Where it starts' },
  { key: 'segment', l: 'Who it’s for', opts: WHO },
  { key: 'occasion', l: 'When', opts: WHEN },
  { key: 'role', l: 'Role in the range', opts: ROLE },
  { key: 'format', l: 'Format', opts: FORMAT },
  { key: 'incremental', l: 'What it grows', opts: GROWS },
];

// A moment marked on Where TheraBreath fits in a day, as the card's When.
export const MOMENT_WHEN: Record<string, string> = {
  'Wake-up': 'First thing in the morning', 'After coffee': 'First thing in the morning', 'After lunch': 'After meals',
  'Afternoon meeting': 'Before a social moment', 'After the gym': 'On the go', 'Before going out': 'Before a social moment',
  'Wind-down': 'Wind-down, before bed', 'On the go': 'On the go',
};

// The starter cards. A card that starts from a sample has no title of its own: it takes the sample's name once the
// tasting has revealed it. The defaults come from the direction's profile on the map (who it's for, its moment); the
// two named ideas are the example concepts on the run sheet.
export type Card = { id: string; status: 'DRAFT' | 'READY'; title?: string; start: string; segment: string; occasion: string; role: string; format: string; incremental: string };
const DIRECTION_DEFAULTS: Record<string, Omit<Card, 'id' | 'status' | 'title' | 'start'>> = {
  // Plant-Powered Freshness: "Adults who'd like something besides straight mint."
  warmcool: { segment: 'Adults who want something new', occasion: 'After meals', role: 'New sub-line', format: 'Rinse', incremental: 'Both' },
  // Global Brightness: "Morning rinsers, people heading out the door, and markets outside the US."
  bright: { segment: 'Adults who want something new', occasion: 'First thing in the morning', role: 'Limited edition', format: 'Rinse', incremental: 'New users' },
  // Modern Clean: "People who skip mouthwash because they find it too harsh."
  botanical: { segment: 'People who find mouthwash too strong', occasion: 'After meals', role: 'New sub-line', format: 'Rinse', incremental: 'New users' },
  // Next-Generation Kids: "Kids and their parents."
  ladder: { segment: 'Families with kids and tweens', occasion: 'Wind-down, before bed', role: 'Kids range', format: 'Rinse', incremental: 'New users' },
};
export const defaultsFor = (start: string) => DIRECTION_DEFAULTS[STARTS.find((x) => x.id === start)?.territory || start] || DIRECTION_DEFAULTS.warmcool;

export const LIBRARY: Card[] = [
  ...PRIMARY_TERRITORIES.map((t) => ({ id: 'dir-' + t.id, status: 'DRAFT' as const, title: t.name, start: t.id, ...defaultsFor(t.id) })),
  ...SAMPLES.map((x) => ({ id: 'sample-' + x.code, status: 'DRAFT' as const, start: x.code, ...defaultsFor(x.code) })),
  { id: 'calm-rinse', status: 'DRAFT', title: 'A calmer last rinse of the day', start: 'warmcool', segment: 'Loyal TheraBreath users', occasion: 'Wind-down, before bed', role: 'New sub-line', format: 'Rinse', incremental: 'Loyal users' },
  { id: 'sink-game', status: 'DRAFT', title: 'A guessing game at the sink', start: 'ladder', segment: 'Families with kids and tweens', occasion: 'Wind-down, before bed', role: 'Kids range', format: 'Rinse', incremental: 'New users' },
];
// The library card for a sample or direction picked in the chips vote.
export const cardFor = (start: string) => LIBRARY.find((c) => c.id === (STARTS.find((x) => x.id === start)?.kind === 'sample' ? 'sample-' + start : 'dir-' + start));

// Now, Next, Later: the options for each field. "To confirm" is always there, and is highlighted in the write-up.
export const TO_CONFIRM = 'To confirm';
export const TESTS = ['Bench stability in the base', 'C&D internal tasting', 'Small consumer panel', 'Kids and parents panel', TO_CONFIRM];
export const OWNERS = TEAM.map((t) => t.name.split(' ')[0]);
export const BASES = ['Kids base', 'Fresh Breath base', 'Another base, to confirm'];
export const DUES = ['January 2027 review', 'December 2026', 'February 2027', TO_CONFIRM];
export const DUE_DEFAULT = DUES[0];
export const STEPS = ['Make a next round in the base', 'Refine the brief first', 'Park it for Later', TO_CONFIRM];
// A value that still needs confirming: the write-up highlights it.
export const unconfirmed = (v?: string) => !v || /to confirm/i.test(v);
