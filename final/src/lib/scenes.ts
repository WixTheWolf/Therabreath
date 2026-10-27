// The run of show: one entry per scene, in order. The presentation (/host), the phones (/j) and the Console all read this,
// and the session's `scene` index points into it, so the order is shared by every screen.
// theme: 'a' light, 'b' dark. chapter: which of Ross's four objectives the scene belongs to (-1 for none).
// builds: how many extra steps the scene reveals before moving on. room: what every phone shows.
// points: the talking points in the presenter's notes (N). Nobody is named as presenting any part.
import { TOPICS, PORTFOLIO, SAMPLES, MYSTERY, PRIMARY_TERRITORIES } from './content';

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

export type Scene = { id: string; n: number; act: string; chapter: number; theme: 'a' | 'b'; builds: number; title: string; minutes?: number; optional?: boolean; notes: string; room: RoomMode; block: string; points: string[] };

const W = (line?: string): RoomMode => ({ kind: 'watch', line });
const MINT = PORTFOLIO.filter((v) => /mint/i.test(v.flavor)).length;
const FRESH = SAMPLES.filter((x) => x.base.startsWith('Fresh')).map((x) => x.code).join(' and ');
const KIDS = SAMPLES.filter((x) => x.base.startsWith('Kids')).map((x) => x.code).join(' and ');
const PART = (n: number) => `Part ${n} · ${TOPICS[n - 1].title}`;

type Row = Omit<Scene, 'n' | 'notes'>;
const opener = (n: number, block: string): Row => ({
  id: `open${n}`, act: PART(n), chapter: n - 1, theme: 'b', builds: 0, title: TOPICS[n - 1].title, block, room: W(TOPICS[n - 1].title),
  points: ['Read Ross’s words on screen, then talk it through:', ...TOPICS[n - 1].points],
});
const platform = (k: number): Row => {
  const t = PRIMARY_TERRITORIES[k - 1]; const tasted = SAMPLES.some((x) => x.territory === t.id);
  return { id: `platform${k}`, optional: !tasted, act: PART(2), chapter: 1, theme: k === 4 ? 'b' : 'a', builds: 1, title: t.name, block: 'school', room: W(t.name),
    points: [`${t.name}: ${t.promise}`, tasted ? 'Two of today’s samples come from here. Don’t name them yet.' : 'Not in the tasting. We just want their opinion.', `Ask: ${t.q}`] };
};

const SHOW: Row[] = [
  { id: 'arrival', act: 'Before we start', chapter: -1, theme: 'b', builds: 0, title: 'Arrival', block: 'welcome', room: W('Welcome. We start at 10:00.'),
    points: ['9:30. Ross is meeting us at 9:30 to help with the Wi-Fi and the room.', 'Laptop on the TV, press F for full screen, and test the film sound.', 'As people sit down, ask them to scan the code. Their names show up on screen as they join.'] },
  { id: 'title', act: 'Welcome', chapter: -1, theme: 'b', builds: 0, title: 'The Future of Freshness', block: 'welcome', room: W(),
    points: ['10:00. Welcome everyone and thank Ross for inviting us.', 'Two hours: the four things Ross asked for, four samples to taste, and a plan to leave with.', 'Phones come out a few times today, for votes and for the tasting.'] },
  { id: 'team', act: 'Welcome', chapter: -1, theme: 'a', builds: 0, title: 'Who we are', block: 'welcome', room: W(),
    points: ['Introduce the four of us and what each of us does day to day.', 'Ross asked to see our creativity, technical expertise and innovation capabilities. Today is our chance to show them.'] },
  { id: 'july', act: 'Welcome', chapter: -1, theme: 'a', builds: 1, title: 'From July to today', block: 'welcome', room: W(),
    points: ['When they visited Norco in July we talked about resiliency, innovation, operations and partnership.', 'Today is about the fifth one: growth.'] },
  { id: 'brief', act: 'Welcome', chapter: -1, theme: 'a', builds: 5, title: 'Your four objectives', block: 'welcome', room: W(),
    points: ['Read the four objectives the way Ross wrote them. They are the agenda for the morning.', 'Last build is his goal: flavors that keep loyal users and bring in new ones.'] },
  { id: 'prework', act: 'Welcome', chapter: -1, theme: 'a', builds: 2, title: 'Your pre-brief answers', block: 'welcome', room: W(),
    points: ['Their pre-brief answers: the consumer they most want to win, and the moment TheraBreath is missing.', 'Have some fun with the vetoes. No names on screen.', 'This scene is skipped automatically if nobody has answered yet.'] },
  { id: 'thesis', act: 'Welcome', chapter: -1, theme: 'b', builds: 1, title: 'Why we are here', block: 'welcome', room: W(),
    points: ['Let this one sit for a second.', 'TheraBreath took the burn out of mouthwash. The next job is giving more people a reason to want it.'] },

  opener(1, 'market'),
  { id: 'gap', act: PART(1), chapter: 0, theme: 'a', builds: 2, title: '86 out of 100 households', block: 'market', room: W(),
    points: ['Quick context first: 25.3% of US mouthwash in Q2 2026, up 4.5 points, number 2.', 'Then let the glasses fill. 86 out of 100 US households still don’t buy TheraBreath.', 'Flavor is one of the best ways to reach them.'] },
  { id: 'portfolio', act: PART(1), chapter: 0, theme: 'a', builds: 1, title: 'The portfolio today', block: 'market', room: W(),
    points: [`${MINT} of the ${PORTFOLIO.length} flavors are mint. That is a strength.`, 'Next build zooms out: there is a lot of room around mint.'] },
  { id: 'market', act: PART(1), chapter: 0, theme: 'a', builds: 6, title: 'What competitors are launching', block: 'market', room: W(),
    points: ['Keep this factual. Competitors are adding flavors, mostly as limited editions.', 'Last build: TheraBreath already has what they are chasing (alcohol-free, dye-free, OXYD-8, a kids line). Ask what keeps it ahead.'] },
  { id: 'signals', act: PART(1), chapter: 0, theme: 'a', builds: 7, title: 'Seven trends', block: 'market', room: W('Seven trends'),
    points: ['One trend per click: the headline, two sources, and what we think it means for TheraBreath.', 'Don’t read every source out loud. About forty seconds each.', 'Ask which one surprises them.'] },
  { id: 'signalvote', act: PART(1), chapter: 0, theme: 'a', builds: 2, title: 'Vote: the three that matter most', block: 'market',
    room: { kind: 'pick', key: 'signals', max: 3, prompt: 'Pick the three trends that matter most for TheraBreath.' },
    points: ['Phones out. Everyone picks three.', 'Watch the bars fill. No phone? Click a bar to add a hand vote.', 'Build 1 shows the top three. They go into the Playbook.', `Build 2: ${TOPICS[0].questions[1]}`] },

  opener(2, 'school'),
  { id: 'school', act: PART(2), chapter: 1, theme: 'b', builds: 3, title: 'What flavor is', block: 'school', room: W('Flavor School'),
    points: ['Taste is the tongue: sweet, sour, salty, bitter, umami.', 'Aroma is the nose, including from the back of the mouth when you swallow.', 'Feel is the trigeminal nerve. That is where cooling, tingle and warmth come from.'] },
  { id: 'cooling', optional: true, act: PART(2), chapter: 1, theme: 'b', builds: 3, title: 'How cooling works', block: 'school', room: W('Flavor School'),
    points: ['Cooling does two jobs: the hit when you first rinse, and how long it lasts.', 'These curves are for explaining, not measured data.'] },
  { id: 'oxyd', optional: true, act: PART(2), chapter: 1, theme: 'b', builds: 3, title: 'Flavor and OXYD-8', block: 'school', room: W('Flavor School'),
    points: ['OXYD-8 is tough on the bacteria behind bad breath, and that makes it hard on flavor.', 'Three things we work with: pH, how we dissolve and protect the flavor, and picking materials that hold up.', 'Public chemistry only. No formula details.'] },
  { id: 'anatomy', optional: true, act: PART(2), chapter: 1, theme: 'b', builds: 4, title: 'How a TheraBreath flavor is built', block: 'school', room: W('Flavor School'),
    points: ['First impression, main flavor, finish, and how long it lasts.', 'Whatever it starts with, a TheraBreath flavor has to finish clean.'] },
  { id: 'map', act: PART(2), chapter: 1, theme: 'a', builds: 2, title: 'Four directions', block: 'school', room: W('Four directions'),
    points: ['Four directions on one map: familiar to adventurous, gentle to bold. This is our view, not data.', 'The gentle and adventurous corner is where we think new users could come from.', 'Two of these are in today’s tasting.'] },
  platform(1), platform(2), platform(3), platform(4),
  { id: 'tasting', act: PART(2), chapter: 1, theme: 'b', builds: 2, title: 'The blind tasting', block: 'tasting', room: { kind: 'taste' },
    points: ['Phones out, or the paper card. Score each sample as you go.', `${FRESH} are in the Fresh Breath base, ${KIDS} in the Kids base.`, `${MYSTERY} is the Mystery Flavor. Taste it last and write down the fruits.`, 'Water and a pause between samples. These are first reactions, not consumer research.', 'Build 1 shows their words and fruit guesses. Build 2 reveals the names.'] },
  { id: 'matrix', act: PART(2), chapter: 1, theme: 'b', builds: 1, title: 'Where each sample landed', block: 'tasting', room: W('Where each sample landed'),
    points: ['This comes straight from their scores. Across: feels like TheraBreath (loyal users). Up: newness (new consumers). Size is appeal.', 'Top right is what Ross asked for: both at once.'] },
  { id: 'nextround', act: PART(2), chapter: 1, theme: 'a', builds: 1, title: 'Vote: what gets a next round', block: 'tasting',
    room: { kind: 'chips', key: 'directions', total: 5, prompt: 'Place five chips on the directions you would develop next. You can stack them.' },
    points: ['Five chips each, on the samples and directions they would develop next. Stacking is fine.', 'Click a direction to add a hand vote for anyone without a phone.', 'Build 1 shows the top three.', `Then ask: ${TOPICS[1].questions[1]}`] },

  opener(3, 'concepts'),
  { id: 'concepts', act: PART(3), chapter: 2, theme: 'a', builds: 0, title: 'Concepts', block: 'concepts', room: W('We are writing up concepts together. Shout out ideas.'),
    points: ['Start from what scored well and what got chips.', 'Up to three concepts. For each: where it starts, who it is for, when, its role in the range, the format, and what it grows.', 'Type as they talk. The boxes suggest options from this morning, and everything saves to the session.'] },
  { id: 'dots', act: PART(3), chapter: 2, theme: 'a', builds: 1, title: 'Vote: which ideas to develop', block: 'concepts', room: { kind: 'dots', key: 'concepts', total: 3 },
    points: ['Three dots each, on the concepts or samples they would develop. Stacking is fine.', 'Build 1 shows the top three.'] },

  opener(4, 'pipeline'),
  { id: 'whitespace', act: PART(4), chapter: 3, theme: 'a', builds: 3, title: 'Where TheraBreath fits in a day', block: 'pipeline', room: W('Where TheraBreath fits in a day'),
    points: ['A day from morning to night, with on the go set apart.', 'Build 1: where we think TheraBreath is today: rinse in the morning and at night; lozenges, gum and sachets on the go. Ask them to correct us.', 'Build 2: the moment their pre-brief answers say is missing. Build 3: everything still open.', 'The rows are this morning’s concepts (before any are written, the samples and directions). Click a cell to mark where each one could fit.'] },
  { id: 'board', act: PART(4), chapter: 3, theme: 'a', builds: 0, title: 'Now, Next, Later', block: 'pipeline', room: W('Now, Next, Later'),
    points: ['Now, Next or Later for each concept and direction. One line each.', 'For each one: a TFF owner, a C&D reviewer, the base, and the next sample step.', TOPICS[3].questions[1]] },

  { id: 'playbook', act: 'Wrapping up', chapter: -1, theme: 'b', builds: 1, title: 'What we decided', block: 'close', room: W('Here is what we decided'),
    points: ['Everything we decided this morning: the trends, the directions, the concepts and the plan.', 'Read the plan back with the owners.', 'Next build: the cover. We will send the write-up within 8 business days.'] },
  { id: 'next', act: 'Wrapping up', chapter: -1, theme: 'b', builds: 3, title: 'What happens next', block: 'close', room: { kind: 'thanks' },
    points: ['The three next steps. The dates still need confirming before November 9.', 'Then thank everyone.'] },
  { id: 'film', act: 'Wrapping up', chapter: -1, theme: 'b', builds: 0, title: 'THE FLAVOR RACE', block: 'close', room: W('Phones down. The film is starting.'),
    points: ['11:48. Lights down, sound up. THE FLAVOR RACE runs 2:26.', 'Don’t talk over it. When it ends, send everyone to lunch.'] },
  { id: 'lunch', act: 'Wrapping up', chapter: -1, theme: 'b', builds: 0, title: 'Lunch', block: 'close', room: { kind: 'thanks' },
    points: ['12:00. Lunch, hosted by Church & Dwight.'] },
];

const LATE = 'Optional. If we are running late, skip it: S skips every optional slide, ] jumps to the next part.';
export const SCENES: Scene[] = SHOW.map((s, n) => { const points = s.optional ? [...s.points, LATE] : s.points; return { ...s, points, n, notes: points.join(' ') }; });
// Where ] and [ jump in the presentation: the start of each part, plus the map and the tasting inside part 2.
export const SECTIONS = ['arrival', 'open1', 'open2', 'map', 'tasting', 'open3', 'open4', 'playbook'];
export const sceneIndex = (id: string) => SCENES.findIndex((s) => s.id === id);
// The Console's short version of the morning.
export const EXECUTIVE = ['title', 'brief', 'gap', 'signalvote', 'tasting', 'matrix', 'nextround', 'concepts', 'dots', 'board', 'playbook', 'next'];
