// The run of show: one entry per slide, in order. The presentation (/host), the phones (/j) and the Console all read this,
// and the session's `scene` index points into it, so the order is shared by every screen. Every move also names its
// slide (`sceneId`), so a position saved against an older order never lands the room on the wrong slide.
// theme: 'a' light, 'b' dark. chapter: which of Ross's four objectives the scene belongs to (-1 for none).
// builds: how many extra steps the scene reveals before moving on. room: what every phone shows.
// The talking points live in sceneNotes.ts, for the team only: this file ships to every phone and attendee page, so it
// carries nothing written for the team. Titles here are what the room may see; sceneNotes gives the team's own names.
import { TOPICS } from './content';

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

export type Scene = { id: string; n: number; act: string; chapter: number; theme: 'a' | 'b'; builds: number; title: string; minutes?: number; optional?: boolean; skip?: number[]; room: RoomMode; block: string };

const W = (line?: string): RoomMode => ({ kind: 'watch', line });
const PART = (n: number) => `Part ${n} · ${TOPICS[n - 1].title}`;

type Row = Omit<Scene, 'n'>;
// A part's chapter slide (open1 to open4): its number, its window and Ross's words, over a photograph.
const opener = (n: number, block: string): Row => ({
  id: `open${n}`, act: PART(n), chapter: n - 1, theme: 'b', builds: 0, title: TOPICS[n - 1].title, block, room: W(TOPICS[n - 1].title),
});
// Twenty-two slides, built for talking with the room rather than at it. Each of Ross's four objectives opens on its own
// chapter slide. `skip` lists the builds the short version (S) leaves out: the July row on Who we are, and the two
// directions that are not in the tasting.
const SHOW: Row[] = [
  { id: 'arrival', act: 'Before we start', chapter: -1, theme: 'b', builds: 0, title: 'The Future of Freshness', block: 'welcome', room: W('Welcome. We start at 10:00.') },
  { id: 'team', act: 'Welcome', chapter: -1, theme: 'a', builds: 1, skip: [1], title: 'Who we are, since July', block: 'welcome', room: W() },
  { id: 'ours', act: 'Welcome', chapter: -1, theme: 'a', builds: 0, title: 'Our flavors in your range', block: 'welcome', room: W() },
  { id: 'brief', act: 'Welcome', chapter: -1, theme: 'a', builds: 5, title: 'Your four objectives', block: 'welcome', room: W() },
  { id: 'prework', act: 'Welcome', chapter: -1, theme: 'a', builds: 2, title: 'Your pre-brief answers', block: 'welcome', room: W() },

  opener(1, 'market'),
  { id: 'gap', act: PART(1), chapter: 0, theme: 'a', builds: 3, title: 'Out of every 100 households', block: 'market', room: W() },
  { id: 'market', act: PART(1), chapter: 0, theme: 'a', builds: 2, title: 'The shelf', block: 'market', room: W() },
  { id: 'signals', act: PART(1), chapter: 0, theme: 'a', builds: 3, title: 'Seven trends: vote, then discuss', block: 'market',
    room: { kind: 'pick', key: 'signals', max: 3, prompt: 'Pick the three trends that matter most for TheraBreath.' } },

  opener(2, 'school'),
  { id: 'school', act: PART(2), chapter: 1, theme: 'b', builds: 2, title: 'Flavor School: flavor and sodium chlorite', block: 'school', room: W('Flavor School') },
  { id: 'map', act: PART(2), chapter: 1, theme: 'a', builds: 4, skip: [2, 3], title: 'Four directions', block: 'school', room: W('Four directions') },
  { id: 'film', act: PART(2), chapter: 1, theme: 'b', builds: 0, title: 'Before we taste', block: 'school', room: W('Phones down for a couple of minutes. Eyes on the screen.') },
  { id: 'tasting', act: PART(2), chapter: 1, theme: 'b', builds: 2, title: 'The blind tasting', block: 'tasting', room: { kind: 'taste' } },
  { id: 'nextround', act: PART(2), chapter: 1, theme: 'b', builds: 1, title: 'Where each sample landed, then what gets a next round', block: 'tasting',
    room: { kind: 'chips', key: 'directions', total: 5, prompt: 'Which flavors or directions should we develop next? Put your five chips on them. You can stack them.' } },

  opener(3, 'concepts'),
  { id: 'whitespace', act: PART(3), chapter: 2, theme: 'a', builds: 3, title: 'Where TheraBreath fits in a day', block: 'concepts', room: W('Where TheraBreath fits in a day') },
  { id: 'concepts', act: PART(3), chapter: 2, theme: 'a', builds: 0, title: 'Concepts', block: 'concepts', room: W('We’re putting concepts together. Call out your ideas.') },

  opener(4, 'pipeline'),
  { id: 'board', act: PART(4), chapter: 3, theme: 'a', builds: 0, title: 'Now, Next, Later', block: 'pipeline', room: W('Now, Next, Later') },

  { id: 'playbook', act: 'Wrapping up', chapter: -1, theme: 'b', builds: 7, title: 'What we decided and what happens next', block: 'close', room: W('Here’s what we decided') },
  { id: 'lunch', act: 'Wrapping up', chapter: -1, theme: 'b', builds: 0, title: 'Thank you', block: 'close', room: { kind: 'thanks' } },
];

export const SCENES: Scene[] = SHOW.map((s, n) => ({ ...s, n }));
// Where ] and [ jump in the presentation: the start of each part, plus the map, THE FLAVOR RACE and the tasting inside
// part 2 (so ] on the film skips straight to the tasting).
export const SECTIONS = ['arrival', 'open1', 'open2', 'map', 'film', 'tasting', 'open3', 'open4', 'playbook'];
export const sceneIndex = (id: string) => SCENES.findIndex((s) => s.id === id);
// The Console's short version of the morning.
export const EXECUTIVE = ['arrival', 'brief', 'gap', 'signals', 'tasting', 'nextround', 'whitespace', 'concepts', 'board', 'playbook'];
// The first slide of each part, which carries its "Objective 0N" tag.
export const firstOfPart = (sc: Scene) => sc.chapter >= 0 && SCENES.find((x) => x.chapter === sc.chapter)?.id === sc.id;
