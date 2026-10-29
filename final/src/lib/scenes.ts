// The run of show: one entry per scene, in order. The presentation (/host), the phones (/j) and the Console all read this,
// and the session's `scene` index points into it, so the order is shared by every screen.
// theme: 'a' light, 'b' dark. chapter: which of Ross's four objectives the scene belongs to (-1 for none).
// builds: how many extra steps the scene reveals before moving on. room: what every phone shows.
// The talking points live in sceneNotes.ts, for the team only: this file ships to every phone and attendee page, so it
// carries nothing written for the team. Titles here are what the room may see; sceneNotes gives the team's own names.
import { TOPICS, SAMPLES, PRIMARY_TERRITORIES } from './content';

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

export type Scene = { id: string; n: number; act: string; chapter: number; theme: 'a' | 'b'; builds: number; title: string; minutes?: number; optional?: boolean; room: RoomMode; block: string };

const W = (line?: string): RoomMode => ({ kind: 'watch', line });
const PART = (n: number) => `Part ${n} · ${TOPICS[n - 1].title}`;

type Row = Omit<Scene, 'n'>;
const opener = (n: number, block: string): Row => ({
  id: `open${n}`, act: PART(n), chapter: n - 1, theme: 'b', builds: 0, title: TOPICS[n - 1].title, block, room: W(TOPICS[n - 1].title),
});
const platform = (k: number): Row => {
  const t = PRIMARY_TERRITORIES[k - 1]; const tasted = SAMPLES.some((x) => x.territory === t.id);
  return { id: `platform${k}`, optional: !tasted, act: PART(2), chapter: 1, theme: k === 4 ? 'b' : 'a', builds: 1, title: t.name, block: 'school', room: W(t.name) };
};

const SHOW: Row[] = [
  { id: 'arrival', act: 'Before we start', chapter: -1, theme: 'b', builds: 0, title: 'Arrival', block: 'welcome', room: W('Welcome. We start at 10:00.') },
  { id: 'title', act: 'Welcome', chapter: -1, theme: 'b', builds: 0, title: 'The Future of Freshness', block: 'welcome', room: W() },
  { id: 'team', act: 'Welcome', chapter: -1, theme: 'a', builds: 0, title: 'Who we are', block: 'welcome', room: W() },
  { id: 'july', act: 'Welcome', chapter: -1, theme: 'a', builds: 1, title: 'From July to today', block: 'welcome', room: W() },
  { id: 'brief', act: 'Welcome', chapter: -1, theme: 'a', builds: 5, title: 'Your four objectives', block: 'welcome', room: W() },
  { id: 'prework', act: 'Welcome', chapter: -1, theme: 'a', builds: 2, title: 'Your pre-brief answers', block: 'welcome', room: W() },
  { id: 'thesis', act: 'Welcome', chapter: -1, theme: 'b', builds: 1, title: 'Why we’re here', block: 'welcome', room: W() },

  opener(1, 'market'),
  { id: 'gap', act: PART(1), chapter: 0, theme: 'a', builds: 2, title: '86 out of 100 households', block: 'market', room: W() },
  { id: 'portfolio', act: PART(1), chapter: 0, theme: 'a', builds: 1, title: 'The portfolio today', block: 'market', room: W() },
  { id: 'market', act: PART(1), chapter: 0, theme: 'a', builds: 6, title: 'What competitors are launching', block: 'market', room: W() },
  { id: 'signals', act: PART(1), chapter: 0, theme: 'a', builds: 7, title: 'Seven trends', block: 'market', room: W('Seven trends') },
  { id: 'signalvote', act: PART(1), chapter: 0, theme: 'a', builds: 2, title: 'Vote: the three that matter most', block: 'market',
    room: { kind: 'pick', key: 'signals', max: 3, prompt: 'Pick the three trends that matter most for TheraBreath.' } },

  opener(2, 'school'),
  { id: 'school', act: PART(2), chapter: 1, theme: 'b', builds: 3, title: 'What flavor is', block: 'school', room: W('Flavor School') },
  { id: 'cooling', optional: true, act: PART(2), chapter: 1, theme: 'b', builds: 3, title: 'How cooling works', block: 'school', room: W('Flavor School') },
  { id: 'oxyd', optional: true, act: PART(2), chapter: 1, theme: 'b', builds: 3, title: 'Flavor and OXYD-8', block: 'school', room: W('Flavor School') },
  { id: 'anatomy', optional: true, act: PART(2), chapter: 1, theme: 'b', builds: 4, title: 'How a TheraBreath flavor is built', block: 'school', room: W('Flavor School') },
  { id: 'map', act: PART(2), chapter: 1, theme: 'a', builds: 2, title: 'Four directions', block: 'school', room: W('Four directions') },
  platform(1), platform(2), platform(3), platform(4),
  { id: 'tasting', act: PART(2), chapter: 1, theme: 'b', builds: 2, title: 'The blind tasting', block: 'tasting', room: { kind: 'taste' } },
  { id: 'matrix', act: PART(2), chapter: 1, theme: 'b', builds: 1, title: 'Where each sample landed', block: 'tasting', room: W('Where each sample landed') },
  { id: 'nextround', act: PART(2), chapter: 1, theme: 'a', builds: 1, title: 'Vote: what gets a next round', block: 'tasting',
    room: { kind: 'chips', key: 'directions', total: 5, prompt: 'Put your five chips on what you’d develop next. You can stack them.' } },

  opener(3, 'concepts'),
  { id: 'concepts', act: PART(3), chapter: 2, theme: 'a', builds: 0, title: 'Concepts', block: 'concepts', room: W('We’re writing up concepts together. Jump in with your ideas.') },
  { id: 'dots', act: PART(3), chapter: 2, theme: 'a', builds: 1, title: 'Vote: which ideas to develop', block: 'concepts', room: { kind: 'dots', key: 'concepts', total: 3 } },

  opener(4, 'pipeline'),
  { id: 'whitespace', act: PART(4), chapter: 3, theme: 'a', builds: 3, title: 'Where TheraBreath fits in a day', block: 'pipeline', room: W('Where TheraBreath fits in a day') },
  { id: 'board', act: PART(4), chapter: 3, theme: 'a', builds: 0, title: 'Now, Next, Later', block: 'pipeline', room: W('Now, Next, Later') },

  { id: 'playbook', act: 'Wrapping up', chapter: -1, theme: 'b', builds: 5, title: 'What we decided', block: 'close', room: W('Here’s what we decided') },
  { id: 'next', act: 'Wrapping up', chapter: -1, theme: 'b', builds: 3, title: 'What happens next', block: 'close', room: { kind: 'thanks' } },
  { id: 'film', act: 'Wrapping up', chapter: -1, theme: 'b', builds: 0, title: 'Before lunch', block: 'close', room: W('Phones down for a couple of minutes. Eyes on the screen.') },
  { id: 'lunch', act: 'Wrapping up', chapter: -1, theme: 'b', builds: 0, title: 'Lunch', block: 'close', room: { kind: 'thanks' } },
];

export const SCENES: Scene[] = SHOW.map((s, n) => ({ ...s, n }));
// Where ] and [ jump in the presentation: the start of each part, plus the map and the tasting inside part 2.
export const SECTIONS = ['arrival', 'open1', 'open2', 'map', 'tasting', 'open3', 'open4', 'playbook'];
export const sceneIndex = (id: string) => SCENES.findIndex((s) => s.id === id);
// The Console's short version of the morning.
export const EXECUTIVE = ['title', 'brief', 'gap', 'signalvote', 'tasting', 'matrix', 'nextround', 'concepts', 'dots', 'board', 'playbook', 'next'];
