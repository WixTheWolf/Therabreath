// The run of show. One entry per Stage scene, in order.
// theme: 'a' Laboratory Light, 'b' After Hours. chapter: index into CHAPTERS (-1 for none).
// builds: how many extra steps the scene reveals before moving on. room: what every phone shows.

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

export type Scene = { id: string; n: number; act: string; chapter: number; theme: 'a' | 'b'; builds: number; title: string; minutes?: number; notes: string; room: RoomMode };

const W = (line?: string): RoomMode => ({ kind: 'watch', line });

const SCENE_CATALOG: Scene[] = [
  { id: 'arrival', n: 0, act: 'Pre-show', chapter: -1, theme: 'b', builds: 0, title: 'Arrival', notes: 'Loop from 9:15. Names rise into the drop as people join. Invite everyone to scan the QR.', room: W('Welcome. We start at 10:00.') },
  { id: 'film', n: 0, act: 'Opening', chapter: -1, theme: 'b', builds: 0, title: 'The film', notes: 'Lights down, sound up. THE FLAVOR RACE, about three minutes. Let it land before anyone speaks.', room: W('Eyes up. The film is starting.') },
  { id: 'title', n: 1, act: 'Opening', chapter: -1, theme: 'b', builds: 0, title: 'The Flavor Playbook', notes: 'Dan welcomes the room. Thank Ross for the invitation. Two hours, one document by noon.', room: W() },
  { id: 'july', n: 2, act: 'Opening', chapter: -1, theme: 'a', builds: 1, title: 'From July to today', notes: 'In July you came to Norco: resiliency, innovation, operations, partnership. Today is about the fifth word: growth.', room: W() },
  { id: 'brief', n: 3, act: 'Opening', chapter: -1, theme: 'a', builds: 4, title: 'Your brief, our agenda', notes: 'These are Ross\'s four objectives, word for word. Each act answers one and writes one chapter of the Playbook. Watch the line at the bottom fill.', room: W() },
  { id: 'prework', n: 4, act: 'Opening', chapter: -1, theme: 'a', builds: 2, title: 'The room already spoke', notes: 'Pre-work reveal. Read the top consumer and the missing moment. Have fun with the vetoes.', room: W() },
  { id: 'vocab', n: 4, act: 'Opening', chapter: -1, theme: 'b', builds: 2, title: 'Freshness is evolving', notes: 'For decades freshness meant one thing: mint. Step 1 explodes the vocabulary. Step 2: freshness is bigger than mint. Pick two words and define them out loud.', room: W('Freshness is evolving') },
  { id: 'thesis', n: 5, act: 'Opening', chapter: -1, theme: 'b', builds: 1, title: 'The thesis', notes: 'Pause between the lines. TheraBreath took away the burn. Now let\'s add the want.', room: W() },
  { id: 'climb', n: 6, act: 'Act I · The Signals', chapter: 0, theme: 'a', builds: 1, title: 'The climb', minutes: 2, notes: '5.6 to 15.6 with Swishy Time, just under 22 at the end of 2025, 25.3 in Q2 2026. Number 2, with number 1 in sight.', room: W() },
  { id: 'gap', n: 7, act: 'Act I · The Signals', chapter: 0, theme: 'a', builds: 2, title: 'The gap', minutes: 2, notes: 'The emotional center. Let the glasses fill in silence. 86 of every 100 US households have not met TheraBreath yet. Pause. Flavor is how we introduce ourselves.', room: W() },
  { id: 'portfolio', n: 8, act: 'Act I · The Signals', chapter: 0, theme: 'a', builds: 1, title: 'The portfolio today', minutes: 2, notes: 'We have mastered mint. Nearly every adult variant is a mint named for a benefit. Then zoom out: everything mint makes possible.', room: W() },
  { id: 'market', n: 9, act: 'Act I · The Signals', chapter: 0, theme: 'a', builds: 5, title: 'The market is moving', minutes: 2, notes: 'Factual and neutral. The flavor race is being run at the shelf, one limited edition at a time.', room: W() },
  { id: 'shifts', n: 9, act: 'Act I · The Signals', chapter: 0, theme: 'a', builds: 6, title: 'Six shifts', minutes: 2, notes: 'Each step flips one shift. Ask the room which one TheraBreath is already leading.', room: W('Six shifts') },
  ...[1, 2, 3, 4, 5, 6, 7].map((k): Scene => ({ id: `signal${k}`, n: 9 + k, act: 'Act I · The Signals', chapter: 0, theme: 'a', builds: 2, title: `Signal ${k}`, minutes: 1.5, notes: 'Motion first, then the still for discussion. Read the headline, then the two proofs, then "so what".', room: W('Signal ' + k + ' of 7') })),
  { id: 'signalvote', n: 17, act: 'Act I · The Signals', chapter: 0, theme: 'a', builds: 1, title: 'Live vote: three signals', minutes: 3, notes: 'Open the vote on Console. Pick the three signals that matter most. Lock, then reveal: the top three pulse and lock into Chapter 1.', room: { kind: 'pick', key: 'signals', max: 3, prompt: 'Pick the 3 signals that matter most for TheraBreath.' } },
  { id: 'school', n: 18, act: 'Act II · Flavor School', chapter: 1, theme: 'b', builds: 3, title: 'What flavor really is', minutes: 2, notes: 'Alex leads. Taste on the tongue, aroma through the nose (including from the back of the mouth), feel through the trigeminal nerve. [CONFIRM wording with Alex]', room: W('Flavor School') },
  { id: 'cooling', n: 19, act: 'Act II · Flavor School', chapter: 1, theme: 'b', builds: 3, title: 'How cool works', minutes: 2, notes: 'Cooling has two jobs: the first impression and the last. Curves are illustrative. [CONFIRM with Alex]', room: W('Flavor School') },
  { id: 'oxyd', n: 20, act: 'Act II · Flavor School', chapter: 1, theme: 'b', builds: 3, title: 'Flavor in an oxidizing world', minutes: 2, notes: 'OXYD-8 is tough on odor-causing bacteria, which makes it a demanding home for flavor. Three levers. We don\'t just make it taste good. We make it survive. No formula details. [CONFIRM all copy with Alex]', room: W('Flavor School') },
  { id: 'anatomy', n: 21, act: 'Act II · Flavor School', chapter: 1, theme: 'b', builds: 4, title: 'Anatomy of a TheraBreath flavor', minutes: 2, notes: 'First impression, heart, finish, linger. However adventurous it starts, it must finish fresh.', room: W('Flavor School') },
  { id: 'molecules', n: 22, act: 'Act II · Flavor School', chapter: 1, theme: 'b', builds: 13, title: 'Molecule flight', minutes: 2, notes: 'Hand out the vials. Phones guess the source before each reveal. Step through the seven molecules. [CONFIRM set with Alex]', room: { kind: 'guess' } },
  { id: 'map', n: 23, act: 'Act III · The Territory Flight', chapter: 1, theme: 'a', builds: 2, title: 'The map', minutes: 2, notes: 'Intensity by character. Our perspective, illustrative. The gentle, adventurous quadrant glows: this is where the next 86% live.', room: W() },
  ...[1, 2, 3, 4, 5, 6, 7].map((k): Scene => ({ id: `territory${k}`, n: 23 + k, act: 'Act III · The Territory Flight', chapter: 1, theme: k === 4 ? 'b' : 'a', builds: 1, title: `Territory ${k}`, minutes: 1.5, notes: 'Twenty seconds of world, then the card. Pass the aroma jar for this territory.', room: W('Territory ' + k + ' of 7') })),
  { id: 'tasting', n: 31, act: 'Act III · The Territory Flight', chapter: 1, theme: 'b', builds: 2, title: 'Blind tasting', minutes: 8, notes: 'Samples A to D. Phones score each. Watch the heat map fill. Step 2 reveals the names with the liquid flip.', room: { kind: 'taste' } },
  { id: 'matrix', n: 31, act: 'Act III · The Territory Flight', chapter: 1, theme: 'b', builds: 1, title: 'Loyal users and new consumers', minutes: 3, notes: 'Each sample plotted on the two goals in Ross\'s brief.', room: W('Loyal users and new consumers') },
  { id: 'chips', n: 32, act: 'Act III · The Territory Flight', chapter: 1, theme: 'a', builds: 1, title: 'Territory vote', minutes: 3, notes: 'Five chips each. Territories grow as chips land. Lock, then the ranking goes into Chapter 2.', room: { kind: 'chips', key: 'territories', total: 5, prompt: 'Place 5 chips on the territories you want in the Playbook.' } },
  { id: 'clock', n: 32, act: 'Act IV · Co-create', chapter: 2, theme: 'b', builds: 5, title: 'The flavor clock', minutes: 2, notes: 'The same person wants a different freshness at 7 AM and at 10 PM. Step through the five moments. Which moment is TheraBreath missing? The pre-work already told us.', room: W('The flavor clock') },
  { id: 'missions', n: 33, act: 'Act IV · Co-create', chapter: 2, theme: 'a', builds: 1, title: 'Mission briefing', minutes: 2, notes: 'Three mixed teams, C&D and TFF together. Phones pick a team. Missions can be changed on Console.', room: { kind: 'team' } },
  { id: 'seeds', n: 34, act: 'Act IV · Co-create', chapter: 2, theme: 'a', builds: 0, title: 'Seed cards', minutes: 3, notes: 'Fourteen provocations, not answers. Teams can use, remix or ignore them.', room: { kind: 'team' } },
  { id: 'canvas', n: 35, act: 'Act IV · Co-create', chapter: 2, theme: 'a', builds: 0, title: 'The Concept Canvas', minutes: 15, notes: 'Start the 15 minute timer. One captain per team types; others suggest. The glass drains; in the last minute it speeds up.', room: { kind: 'canvas' } },
  { id: 'bench', n: 35, act: 'Act IV · Co-create', chapter: 2, theme: 'a', builds: 2, title: 'The Bench', minutes: 8, notes: 'Each team tunes its concept on six dials. Steps show team 1, 2, 3. Readouts are rules of thumb; Alex can override any of them from Console. Lock the signature before pitches.', room: { kind: 'bench' } },
  { id: 'pitches', n: 36, act: 'Act IV · Co-create', chapter: 2, theme: 'a', builds: 2, title: 'Pitches', minutes: 7, notes: 'Two to three minutes each. Step to the next poster. Timer per pitch.', room: W('Pitches') },
  { id: 'dots', n: 37, act: 'Act IV · Co-create', chapter: 2, theme: 'a', builds: 1, title: 'Dot vote', minutes: 2, notes: 'Three dots each across all concepts and seeds. Dots rain onto the posters. Top concepts lock into Chapter 3.', room: { kind: 'dots', key: 'concepts', total: 3 } },
  { id: 'pipeline', n: 38, act: 'Act V · Build the Playbook', chapter: 3, theme: 'a', builds: 0, title: 'The pipeline board', minutes: 7, notes: 'Place the voted concepts on Now, Next, Future and a portfolio role, from Console. Phones can agree or challenge.', room: { kind: 'placements' } },
  { id: 'calendar', n: 39, act: 'Act V · Build the Playbook', chapter: 3, theme: 'a', builds: 1, title: 'The 2027 flavor calendar', minutes: 4, notes: 'Four seasonal drop windows. A flavor calendar turns innovation into a rhythm the shelf can count on.', room: W() },
  { id: 'code', n: 40, act: 'Act V · Build the Playbook', chapter: 4, theme: 'a', builds: 7, title: 'The Flavor Code', minutes: 4, notes: 'Seven guardrails. Phones react keep, edit or add for each.', room: { kind: 'code' } },
  { id: 'assemble', n: 41, act: 'Close', chapter: 4, theme: 'b', builds: 1, title: 'The Playbook you just built', minutes: 3, notes: 'The signature moment. Let it assemble. End on the cover with their names.', room: W('The Playbook is assembling') },
  { id: 'next', n: 42, act: 'Close', chapter: 4, theme: 'b', builds: 3, title: 'What happens next', minutes: 2, notes: 'Three commitments [CONFIRM dates]. Dan closes: thank you for building this with us.', room: { kind: 'thanks' } },
  { id: 'lunch', n: 43, act: 'Close', chapter: -1, theme: 'b', builds: 0, title: 'Lunch', notes: 'Ambient loop in the colors of the chosen territories.', room: { kind: 'thanks' } },
];

// FINAL run of show: Ross's four objectives as four chapters, the real samples at the center, a hard stop at noon.
// Presenters: Dan opens and closes, Alex the market and share, Ryan Flavor School, the tasting and the Bench, Matt facilitates.
const LIVE_ORDER = [
  'arrival', 'film', 'title', 'july', 'brief', 'prework', 'thesis',
  'climb', 'gap', 'portfolio', 'market', 'signal1', 'signal2', 'signal3', 'signal4', 'signal5', 'signal6', 'signal7', 'signalvote',
  'school', 'cooling', 'oxyd', 'anatomy', 'map', 'territory1', 'territory2', 'territory3', 'territory4', 'tasting', 'matrix', 'chips',
  'missions', 'canvas', 'bench', 'pitches', 'dots',
  'pipeline', 'code', 'assemble', 'next', 'lunch',
];
const LIVE_NOTES: Record<string, Partial<Scene>> = {
  arrival: { notes: '9:30 to 10:00. Ross meets us at 9:30 for Wi-Fi and the room. Plug in, Stage full screen, test the film sound. Names rise into the drop as people scan the QR.' },
  film: { notes: '10:00 sharp. Lights down, sound up. THE FLAVOR RACE, 3 minutes. Nobody speaks until the end card.', room: W('Eyes up. The film is starting.') },
  title: { notes: '10:03. Dan welcomes the room and thanks Ross for the invitation. Two hours, one Playbook by noon, with their names on the cover.' },
  july: { notes: '10:04. In July you came to Norco: resiliency, innovation, operations, partnership. Today is the fifth word: growth.' },
  brief: { builds: 5, notes: '10:05. Ross\'s four objectives, word for word, and his goal: new flavor experiences that strengthen appeal with loyal users and attract new consumers. Each objective writes one chapter. Watch the line at the bottom fill.' },
  prework: { notes: '10:07. The pre-brief homework, live. Read the top consumer and the missing moment. Have fun with the vetoes.' },
  thesis: { notes: '10:09. Pause between the lines. TheraBreath took away the burn. Now let\'s add the want.' },
  climb: { notes: '10:10. Alex. 5.6 to 15.6 with Swishy Time, just under 22 at the end of 2025, 25.3 in Q2 2026. Number 2, with number 1 in sight. Refresh after the Q3 call on October 30.' },
  gap: { notes: '10:12. Alex. The emotional center. Let the glasses fill in silence. 86 of every 100 US households have not met TheraBreath yet. Pause. Flavor is how we introduce ourselves.' },
  portfolio: { notes: '10:14. We have mastered mint: nearly every adult variant is a mint named for a benefit. Then zoom out to everything mint makes possible.' },
  market: { notes: '10:15. Factual and neutral. The race is being run at the shelf, one limited edition at a time.' },
  signal: { minutes: 1, notes: '10:17 to 10:24. About a minute each: the headline, two proofs, the so what. Ask which one surprises the R&D team.' },
  signalvote: { notes: '10:24 to 10:27. Open the vote on Console. Three signals each. Lock, reveal, and the top three go into Chapter 1.' },
  school: { notes: '10:27. Ryan. Taste on the tongue, aroma through the nose (including from the back of the mouth), feel through the trigeminal nerve. [CONFIRM wording with Ryan]' },
  cooling: { notes: '10:29. Ryan. Cooling has two jobs: the first impression and the last. The curves are illustrative, for teaching.' },
  oxyd: { notes: '10:31. Ryan. The R&D moment. OXYD-8 is tough on odor-causing bacteria, which makes it a demanding home for flavor. Three levers. Public chemistry only, no formula details. [CONFIRM copy with Ryan]' },
  anatomy: { notes: '10:33. First impression, heart, finish, linger. However adventurous it starts, it must finish fresh.' },
  map: { title: 'Four opportunity platforms', notes: '10:35. Four platforms on the intensity by character map. Our perspective, illustrative. The gentle, adventurous corner is where the next 86% live.' },
  territory: { notes: '10:37 to 10:44. Under two minutes each. One question per platform. Keep sample names for the reveal.' },
  tasting: { minutes: 16, notes: '10:44 to 11:00. Ryan. A and B in the Fresh Breath base, C and D in the Kids base [CONFIRM with Ryan]. Phones score each sample. C is Mystery Flavor: collect fruit guesses before step 2 reveals the names. Rinse and pause between samples. Workshop reactions, not consumer validation.' },
  matrix: { notes: '11:00. Ross asked for both: strengthen appeal with loyal users, and attract new consumers. Feels like TheraBreath runs across, newness runs up, appeal is size. Top right is where to develop first.' },
  chips: { title: 'Platform vote', notes: '11:03. Five chips across the four platforms. Lock, then the ranking goes into Chapter 2.' },
  missions: { notes: '11:06. Two mixed teams, C&D and TFF together: one adult mission, one kids and family mission. Start from the tasting results.' },
  canvas: { minutes: 12, notes: '11:08 to 11:20. Start the 12-minute glass. One captain per team types; the others suggest. One concept per team: consumer, occasion, sensory target, why it is incremental.' },
  bench: { builds: 1, minutes: 7, notes: '11:20 to 11:27. Ryan. Each team tunes its concept on six dials. Readouts are rules of thumb from public literature; Ryan can override any of them from Console. Lock the signature before pitches.' },
  pitches: { builds: 1, minutes: 6, notes: '11:27 to 11:33. Two to three minutes per team. Who it is for, why only TheraBreath, what changes in the next sample.' },
  dots: { minutes: 3, notes: '11:33. Three dots each. Dots rain onto the posters; the top concepts lock into Chapter 3.' },
  pipeline: { minutes: 10, notes: '11:36 to 11:46. Place the directions on Now, Next, Future and a portfolio role. For each priority record the TFF owner, C&D reviewer, base, next sample action and evaluation date.' },
  code: { notes: '11:46. Seven guardrails. Phones keep, edit or add. Edits go straight into Chapter 5.' },
  assemble: { notes: '11:50. The signature moment. Let the Playbook assemble and close on the cover with their names.' },
  next: { minutes: 5, notes: '11:53. Read back owners, sample actions and dates. Playbook v1.0 within 8 business days. Dan closes: thank you for building this with us. [CONFIRM dates]' },
  lunch: { notes: '12:00. Hard stop. The room is ours through lunch; the loop runs in the colors they chose.' },
};
const PLATFORM_NAMES = ['Plant-Powered Freshness', 'Global Brightness', 'Modern Clean', 'Next-Generation Kids'];
export const SCENES: Scene[] = LIVE_ORDER.map((id, n) => {
  const base = SCENE_CATALOG.find(s => s.id === id)!;
  const notes = LIVE_NOTES[id] || LIVE_NOTES[id.replace(/\d+$/, '')];
  const platform = id.startsWith('territory') ? { title: PLATFORM_NAMES[Number(id.slice(-1)) - 1], room: W('Opportunity platform ' + id.slice(-1) + ' of 4') } : {};
  return { ...base, ...notes, ...platform, n };
});
export const sceneIndex = (id: string) => SCENES.findIndex((s) => s.id === id);
export const EXECUTIVE = ['title', 'gap', 'signalvote', 'tasting', 'matrix', 'chips', 'dots', 'pipeline', 'next'];
