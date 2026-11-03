// The run of show: one entry per scene, in order. The presentation (/host), the phones (/j) and the Console all read this,
// and the session's `scene` index points into it, so the order is shared by every screen.
// The simplified morning: the main flow first, then the backup slides (`backup` names their group). The arrows, ] and
// End stay in the main flow; the presenter view's Go to list (and #N) reaches the backup, and Return (Escape on the
// TV) comes back to where the main flow left off.
// theme: 'a' light, 'b' dark. chapter: which of the three parts the scene belongs to (-1 for none, and for backup).
// builds: how many extra steps the scene reveals before moving on. room: what every phone shows.
// The talking points live in sceneNotes.ts, for the team only: this file ships to every phone and attendee page, so it
// carries nothing written for the team. Titles here are what the room may see; sceneNotes gives the team's own names.
import { TOPICS, PRIMARY_TERRITORIES } from './content';

export type RoomMode =
  | { kind: 'watch'; line?: string }
  | { kind: 'pick'; key: string; max: number; prompt: string }
  | { kind: 'chips'; key: string; total: number; prompt: string }
  | { kind: 'taste' }
  | { kind: 'guess' }
  | { kind: 'team' }
  | { kind: 'canvas' }
  | { kind: 'dots'; key: string; total: number }
  | { kind: 'placements' }
  | { kind: 'code' }
  | { kind: 'bench' }
  | { kind: 'thanks' };

export type Scene = { id: string; n: number; act: string; chapter: number; theme: 'a' | 'b'; builds: number; title: string; minutes?: number; optional?: boolean; backup?: string; room: RoomMode; block: string };

const W = (line?: string): RoomMode => ({ kind: 'watch', line });
const PART = (n: number) => `Part ${n} · ${TOPICS[n - 1].title}`;

type Row = Omit<Scene, 'n'>;
const opener = (n: number, block: string): Row => ({
  id: `open${n}`, act: PART(n), chapter: n - 1, theme: 'b', builds: 0, title: TOPICS[n - 1].title, block, room: W(TOPICS[n - 1].title),
});
// A backup slide: out of the main flow, kept for questions or for more time on a topic.
const B = (group: string, r: Omit<Row, 'act' | 'chapter' | 'block' | 'backup'>): Row => ({ ...r, act: `Backup · ${group}`, chapter: -1, block: 'backup', backup: group });
const platform = (k: number): Row => {
  const t = PRIMARY_TERRITORIES[k - 1];
  return B('Directions', { id: `platform${k}`, theme: k === 4 ? 'b' : 'a', builds: 1, title: t.name, room: W(t.name) });
};

const SHOW: Row[] = [
  { id: 'arrival', act: 'Before we start', chapter: -1, theme: 'b', builds: 0, title: 'Arrival', block: 'welcome', room: W('Welcome. We start at 10:00.') },
  { id: 'title', act: 'Welcome', chapter: -1, theme: 'b', builds: 0, title: 'The Future of Freshness', block: 'welcome', room: W() },
  { id: 'team', act: 'Welcome', chapter: -1, theme: 'a', builds: 0, title: 'Who we are', block: 'welcome', room: W() },
  { id: 'brief', act: 'Welcome', chapter: -1, theme: 'a', builds: 4, title: 'What we want to accomplish', block: 'welcome', room: W() },
  { id: 'prework', act: 'Welcome', chapter: -1, theme: 'a', builds: 2, title: 'Your pre-brief answers', block: 'welcome', room: W() },
  { id: 'thesis', optional: true, act: 'Welcome', chapter: -1, theme: 'b', builds: 1, title: 'Why we’re here', block: 'welcome', room: W() },

  opener(1, 'market'),
  { id: 'gap', act: PART(1), chapter: 0, theme: 'a', builds: 2, title: '86 out of 100 households', block: 'market', room: W() },
  { id: 'portfolio', optional: true, act: PART(1), chapter: 0, theme: 'a', builds: 1, title: 'The portfolio today', block: 'market', room: W() },
  { id: 'market', act: PART(1), chapter: 0, theme: 'a', builds: 6, title: 'What competitors are launching', block: 'market', room: W() },
  { id: 'trends', act: PART(1), chapter: 0, theme: 'a', builds: 3, title: 'Three conversations about trends', block: 'market', room: W('Three conversations about trends') },
  { id: 'directions', act: PART(1), chapter: 0, theme: 'a', builds: 1, title: 'Four directions', block: 'market', room: W('Four directions') },

  opener(2, 'film'),
  { id: 'film', act: PART(2), chapter: 1, theme: 'b', builds: 0, title: 'Before we taste', block: 'film', room: W('Phones down for a couple of minutes. Eyes on the screen.') },
  { id: 'basics', act: PART(2), chapter: 1, theme: 'b', builds: 3, title: 'What to taste for', block: 'tasting', room: W('What to taste for') },
  { id: 'tasting', act: PART(2), chapter: 1, theme: 'b', builds: 2, title: 'The blind tasting', block: 'tasting', room: { kind: 'taste' } },
  { id: 'matrix', act: PART(2), chapter: 1, theme: 'b', builds: 1, title: 'Where each sample landed', block: 'choose', room: W('Where each sample landed') },
  { id: 'react', act: PART(2), chapter: 1, theme: 'a', builds: 0, title: 'What stood out?', block: 'choose', room: W('What stood out? What would you keep, and what would you change?') },
  { id: 'nextround', act: PART(2), chapter: 1, theme: 'a', builds: 1, title: 'Vote: what gets a next round', block: 'choose',
    room: { kind: 'chips', key: 'directions', total: 5, prompt: 'Put your five chips on what you’d develop next. You can stack them.' } },

  opener(3, 'build'),
  { id: 'develop', act: PART(3), chapter: 2, theme: 'a', builds: 0, title: 'What we work on next', block: 'build', room: W('We’re fleshing out the strongest ideas together. Jump in.') },

  { id: 'playbook', act: 'Wrapping up', chapter: -1, theme: 'b', builds: 5, title: 'What we decided', block: 'readback', room: W('Here’s what we decided') },
  { id: 'next', act: 'Wrapping up', chapter: -1, theme: 'b', builds: 3, title: 'What happens next', block: 'readback', room: { kind: 'thanks' } },
  { id: 'lunch', act: 'Wrapping up', chapter: -1, theme: 'b', builds: 0, title: 'Thank you', block: 'buffer', room: { kind: 'thanks' } },

  // Backup: the detail behind the main flow, for questions or if Ross's team wants more time on a topic.
  B('Welcome', { id: 'july', theme: 'a', builds: 1, title: 'From July to today', room: W() }),
  B('Trends', { id: 'signals', theme: 'a', builds: 7, title: 'Seven trends', room: W('Seven trends') }),
  B('Trends', { id: 'signalvote', theme: 'a', builds: 2, title: 'Vote: the three trends that matter most', room: { kind: 'pick', key: 'signals', max: 3, prompt: 'Pick the three trends that matter most for TheraBreath.' } }),
  B('Flavor School', { id: 'school', theme: 'b', builds: 3, title: 'What flavor is', room: W('Flavor School') }),
  B('Flavor School', { id: 'cooling', theme: 'b', builds: 3, title: 'How cooling works', room: W('Flavor School') }),
  B('Flavor School', { id: 'oxyd', theme: 'b', builds: 3, title: 'Flavor and OXYD-8', room: W('Flavor School') }),
  B('Flavor School', { id: 'anatomy', theme: 'b', builds: 4, title: 'How a TheraBreath flavor is built', room: W('Flavor School') }),
  B('Directions', { id: 'map', theme: 'a', builds: 2, title: 'The four directions on a map', room: W('Four directions') }),
  platform(1), platform(2), platform(3), platform(4),
  B('Activities', { id: 'concepts', theme: 'a', builds: 0, title: 'Concept cards', room: W('We’re writing up concepts together. Jump in with your ideas.') }),
  B('Activities', { id: 'dots', theme: 'a', builds: 1, title: 'Vote: which ideas to develop', room: { kind: 'dots', key: 'concepts', total: 3 } }),
  B('Activities', { id: 'whitespace', theme: 'a', builds: 3, title: 'Where TheraBreath fits in a day', room: W('Where TheraBreath fits in a day') }),
  B('Activities', { id: 'board', theme: 'a', builds: 0, title: 'Now, Next, Later', room: W('Now, Next, Later') }),
];

export const SCENES: Scene[] = SHOW.map((s, n) => ({ ...s, n }));
export const MAIN = SCENES.filter((s) => !s.backup);
export const BACKUP = SCENES.filter((s) => s.backup);
// The last slide of the main flow (the thank-you card): where End goes.
export const LAST_MAIN = MAIN[MAIN.length - 1].n;
// Where ] and [ jump in the presentation: the start of each part and of each block of the morning (so ] on the film
// skips to the tasting).
export const SECTIONS = ['arrival', 'open1', 'open2', 'basics', 'matrix', 'open3', 'playbook', 'lunch'];
export const sceneIndex = (id: string) => SCENES.findIndex((s) => s.id === id);
// The Console's short version of the morning.
export const EXECUTIVE = ['title', 'brief', 'gap', 'trends', 'directions', 'tasting', 'matrix', 'react', 'nextround', 'develop', 'playbook', 'next'];
