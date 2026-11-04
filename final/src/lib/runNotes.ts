// What the team does in each block of the morning, for the run sheet (team only, printed): the slides, what happens,
// the technology and materials, what the block should leave us with, and any transition. Kept apart from RUN in
// content.ts, which ships to attendee pages, so nothing written for the team (THE FLAVOR RACE above all) reaches them.
// Import this only from team-only pages.
import { MYSTERY } from './content';

export type BlockNotes = { slides: string; does: string; kit: string; output: string; after?: string };

const TEXT: Record<string, Pick<BlockNotes, 'slides' | 'does'>> = {
  welcome: {
    slides: 'Arrival, Title, Who we are, From July to today, Your four objectives, Your pre-brief answers (only if answers came in), Why we’re here',
    does: 'As people sit down, the arrival screen shows the QR code and counts the phones as they join. Thank Ross for having us, introduce the four of us and recap July. Read Ross’s four objectives and his goal, and show the pre-brief answers if any came in. Then explain why we’re here: TheraBreath took the burn out of mouthwash, and the next job is giving more people a reason to want it.',
  },
  market: {
    slides: 'Part 1, 86 out of 100 households, The portfolio today, What competitors are launching, Seven trends, Vote: the three that matter most',
    does: 'Open with the household gap, then walk through the portfolio and what competitors are launching. The seven trends come up one click at a time. After that, everyone votes for three on their phone, and the presenter view adds a vote by hand for anyone without one. The top three go into the Playbook. Finish by asking what we missed.',
  },
  school: {
    slides: 'Part 2, What flavor is, How cooling works, Flavor and OXYD-8, How a TheraBreath flavor is built, Four directions, then one scene per direction',
    does: 'Cover taste, smell and feel, and how cooling works. Explain why OXYD-8 is a hard place for flavor to live and how a TheraBreath flavor has to finish. Then show the four directions on one map and go through them one at a time. Two of them have samples in the tasting, and the other two are there for discussion.',
  },
  tasting: {
    slides: 'THE FLAVOR RACE, The blind tasting, Where each sample landed, Vote: what gets a next round',
    does: `At 10:40, THE FLAVOR RACE: a surprise for the room, so don’t announce it. Lights down, sound up, 2:24 of film. It starts only when you move onto it, and you can pause, restart or skip it from the presenter view or the keys. It ends on four glasses on a tray: lights up and bring out the samples. Its flavor montage shows the flight’s own fruits, the Mystery Flavor’s among them, so treat it as a hint. If we’re running late, skip it: nothing is decided on it. Then pour A and B in the Kids base and C and D in the Fresh Breath base. Everyone scores each sample on their phone or the paper scorecard, and the scores fill the screen as they come in. Type the paper cards into the presenter view as they’re handed in. ${MYSTERY} is the Mystery Flavor, so get everyone’s fruit guesses before the names go up. Then show where each sample landed, and have everyone place five chips on what should get a next round.`,
  },
  concepts: {
    slides: 'Part 3, Concepts, Vote: which ideas to develop',
    does: 'Take the directions with the most chips and write up to three concepts together. For each one, cover where it starts, who it’s for, the moment, its role in the range, the format, and whether it grows loyal users, new users or both. Type them straight into the cards on screen. Then everyone gets three dots on their phone to vote for the ones worth developing.',
  },
  pipeline: {
    slides: 'Part 4, Where TheraBreath fits in a day, Now, Next, Later',
    does: 'Walk through the day, moment by moment: where TheraBreath is today, the moment the pre-brief says is missing, and everything that’s still open. Click a cell to mark where each concept could fit. Then put each concept and direction under Now, Next or Later, one line each with its consumer or occasion, the flavor brief, the next test, a TFF owner, a C&D reviewer, the base, the date the next sample is due and the agreed next step. Type them on the board or in the presenter view. The top votes sit in a tray above the board: click one to start its line under Now.',
  },
  close: {
    slides: 'What we decided, What happens next, Thank you',
    does: 'The Playbook fills in from the votes and the board, and opens one chapter at a time so it can be read back, the plan with its owners last. Read it back, go through the three next steps and say thank you. The last slide is a thank-you card, and the time until 12:00 is for questions. Then lunch, hosted by Church & Dwight.',
  },
};
// The facilitator's view of each block: what it needs and what it should leave us with. Only what the run sheet and
// the presentation already say; suggestions are marked as suggestions.
const KIT: Record<string, Pick<BlockNotes, 'kit' | 'output' | 'after'>> = {
  welcome: { kit: 'Laptop on the TV as an extended display, the presenter view (P), the QR code on the arrival screen, Wi-Fi for the laptop.', output: 'Phones joined, and the pre-brief answers on screen if any came in.' },
  market: { kit: 'Phones for the trend vote; hand votes in the presenter view for anyone without one.', output: 'The three trends that matter most, and what we missed.' },
  school: { kit: 'The presentation only.', output: 'The room’s first reactions to each of the four directions, before anything is tasted.' },
  tasting: { kit: 'Speakers loud enough for THE FLAVOR RACE (checked before anyone arrives), the presenter view for its controls and the film saved on the laptop as a backup. Four samples in coded cups (A and B in the Kids base, C and D in the Fresh Breath base), water, spit cups, napkins, paper scorecards and pens, phones.', output: 'THE FLAVOR RACE (10:40 to 10:43, or skipped if we’re late). Scores for all four samples, the fruit guesses, the names revealed, and five chips each on what gets a next round.', after: 'Suggested transition: while the chips go in, clear the cups and pens so the table is free for the concept cards at 11:00.' },
  concepts: { kit: 'The concept cards on the TV, or typed in the presenter view; phones for the dot vote.', output: 'Up to three concepts, and the dot vote on which ones to develop.' },
  pipeline: { kit: 'The presenter view for Now, Next, Later (or type on the board).', output: 'Each direction under Now, Next or Later with its consumer or occasion, flavor brief, next test, TFF owner, C&D reviewer, base, next-sample date and agreed next step.' },
  close: { kit: 'The presenter view for the read-back, and the results page ready to save as a PDF.', output: 'The plan read back with its owners, and the results page saved as a PDF.' },
};

export const RUN_NOTES: Record<string, BlockNotes> = Object.fromEntries(Object.keys(TEXT).map((id) => [id, { ...TEXT[id], ...KIT[id] } as BlockNotes]));

// Two example concepts the hosts can offer if the room needs a starting point (team pages only). They build on the
// pre-brief's own choices and on directions already on screen; everything not yet known is marked as an assumption.
export type Example = { name: string; consumer: string; occasion: string; direction: string; sensory: string; test: string; assume: string[] };
export const EXAMPLES: Example[] = [
  {
    name: 'A calmer last rinse of the day',
    consumer: 'Loyal TheraBreath users',
    occasion: 'Wind-down, the last rinse before bed',
    direction: 'A softer botanical mint, in the Fresh Breath base, next to what Overnight Chamomile Mint already does',
    sensory: 'Gentle cooling that fades rather than lingers, no sting, a calm aromatic finish',
    test: 'Does softer cooling still read as clean to a loyal user? Do the botanical notes hold up in the base over time?',
    assume: ['Assumption: loyal users want a different feel at night than in the morning.', 'Assumption: the botanical notes stay stable in the base. That needs a bench check.'],
  },
  {
    name: 'A guessing game at the sink',
    consumer: 'Families with kids and tweens',
    occasion: 'The evening routine with the kids',
    direction: 'A fruit flavor sold as a mystery, in the Kids base, in the spirit of the Mystery Flavor sample',
    sensory: 'A fruit-forward start, mild cooling, a clean finish',
    test: 'Do kids enjoy guessing more than a named fruit? Do parents still see it as a real oral care product? How much cooling do kids accept?',
    assume: ['Assumption: the guessing makes kids want to rinse.', 'Assumption: a mystery name works for parents in store. Both need testing with families.'],
  },
];

// What to cut, in order, if the morning runs behind. The tasting and Now, Next, Later are what the morning is for.
export const BEHIND = [
  'A few minutes behind: press S. It skips the optional slides (How cooling works, Flavor and OXYD-8, how a flavor is built, and the two directions that aren’t in the tasting), and the presenter view shows the short version is on.',
  'Further behind: skip THE FLAVOR RACE (the right arrow or ] on it goes straight to the tasting), take the seven trends as headlines only and go straight to the vote, and write one concept together instead of three. Press ] to jump to the next part.',
  'Out of time: read back Now, Next, Later with its owners, then End goes straight to the thank-you card.',
  'Never cut: the blind tasting, the chips on what gets a next round, and the owners and next steps on Now, Next, Later.',
];


// The morning slide by slide, for the team: what each click shows on the TV, the question to put to the room, and what
// the phones do. The planned minutes and windows live in slideTimes.ts, which the presenter view also reads. Numbers are
// the presentation's own (the presenter view's Go to list): "Your pre-brief answers" is always 4, and is skipped while
// nobody has answered.
export type SlidePlan = { clicks?: string[]; ask?: string; phones?: string };
export const SLIDES: Record<string, SlidePlan> = {
  arrival: { clicks: ['The title, the QR code, the number of phones joined and their first names.'], ask: 'At 10:00: welcome, thank Ross, and set up the two hours: four objectives, four samples, a plan to leave with.', phones: 'Scan the code and type a first name.' },
  team: { clicks: ['The four of us, what we test in the lab and what we bring in from outside oral care.', 'Optional (S skips it): the four July themes, and Growth, November, lights up.'] },
  brief: { clicks: ['“We’ve built the morning around your four objectives.”', 'Objective 01 and its time, 10:10 to 10:25.', 'Objective 02, 10:25 to 11:00.', 'Objective 03, 11:00 to 11:20.', 'Objective 04, 11:20 to 11:40.', 'Ross’s goal, in his words.'] },
  prework: { clicks: ['Who the next flavor should be for, with any “Someone else” answers.', 'The moment TheraBreath is missing, and the group’s freshness profile.', 'What would feel off-brand, without names.'], ask: 'What makes each off-brand answer feel wrong for the brand?' },
  gap: { clicks: ['Objective 01. “TheraBreath took the burn out of mouthwash. The next job is giving more people a reason to want it.”', 'Two glasses fill: 65 for mouthwash, 14 for TheraBreath, with the record 26.8% share and its source (Church & Dwight’s Q3 call).', '“86 out of 100 households don’t buy TheraBreath yet”: 51 buy another mouthwash, 35 don’t buy mouthwash at all.', '“Flavor could give more of them a reason to try it.”'], ask: 'Which group is a new flavor for?' },
  market: { clicks: ['21 of 25 flavors are mint, across six formats, beside what competitors are launching.', '“There’s a lot of room around mint.”', 'Where TheraBreath stands.'], ask: 'TheraBreath already has what they’re chasing. What keeps it ahead?' },
  signals: { clicks: ['All seven trends, one line each with where the evidence comes from. The bars fill as phones vote.', 'The vote closes. Number 1 opens: its evidence, what it could mean and its question.', 'Number 2.', 'Number 3. The top three go into the Playbook.'], ask: 'Each trend’s own question on screen. Then, out loud only: what are you seeing that we missed?', phones: 'Pick three trends straight away. Hand votes in the presenter view for anyone without a phone.' },
  school: { clicks: ['Objective 02. Flavor in OXYD-8: “Most of what we call flavor is really smell. The rest is how it feels.” Taste, aroma and feel.', 'Cooling does two jobs: three curves, drawn to explain, not measured.', 'What we control in OXYD-8: pH, dissolving and protecting the flavor, materials that hold up. “It has to finish clean.”'], ask: 'Where has flavor been hardest to get right in OXYD-8 for you?' },
  map: { clicks: ['The map: familiar to adventurous, gentle to bold, all four directions. Our view, not data.', 'Plant-Powered Freshness: its profile card.', 'Optional (S skips it): Global Brightness.', 'Optional (S skips it): Modern Clean.', 'Next-Generation Kids.'], ask: 'Which direction feels most like TheraBreath, and which stretches it most? Click a direction to open its card.' },
  film: { clicks: ['THE FLAVOR RACE, 2:24, lights down and sound up. Don’t announce it. It ends on four glasses on a tray: lights up and bring out the samples.'], ask: 'Nothing: let it play. Its montage shows the flight’s fruits, so it doubles as a hint for the Mystery Flavor.', phones: 'Phones show “Phones down for a couple of minutes.”' },
  tasting: { clicks: ['Four coded samples and how many have scored. A and B first, then C and D, with water between.', 'Their one-word answers and fruit guesses.', `The names, after everyone has scored. ${MYSTERY} shows its name only.`], phones: 'Score each sample: appeal, fit with TheraBreath and newness from 1 to 5, who would buy it, which direction it comes from, whether to develop it, one word. Fruit guesses for the Mystery Flavor. Paper cards typed into the presenter view.' },
  nextround: { clicks: ['Each sample placed by fit with TheraBreath (across) and newness (up), sized by appeal, beside the chips vote.', 'The top three from the chips.'], ask: 'Of C and D, which feels more like TheraBreath? Top right is what Ross asked for: both at once. What would it take to move the others there? Then: what would set TheraBreath’s flavors apart from what competitors are launching?', phones: 'Five chips each on the four samples and the two directions not in the tasting, stacking allowed. Hand chips in the presenter view.' },
  whitespace: { clicks: ['Objective 03. A day from wake-up to wind-down, plus on the go, with a row for each of the top three from the chips.', 'Where TheraBreath is today: rinse, and lozenges, gum and sachets on the go.', 'The moment the pre-briefs say is missing, and their most common answer for who the next flavor is for.', 'Everything still open. Click a cell to mark where each could fit.'], ask: 'Where have we got today wrong? Where could each one fit?' },
  concepts: { clicks: ['Three concept cards to type into: where it starts, who it’s for, when, role in the range, format, what it grows.'], ask: 'Which moment of the day is TheraBreath missing? Who could a new flavor bring in? If the room is stuck, offer an example concept from this sheet.' },
  board: { clicks: ['Objective 04. Now, Next, Later, with the top votes in a tray above. Click one to start its line under Now.'], ask: 'What should go first, and what has to be true for it to work? For each line: consumer or occasion, flavor brief, next test, TFF owner, C&D reviewer, base, next sample date, agreed next step.' },
  playbook: { clicks: ['The Playbook assembles from the morning.', 'Chapter 1, the trends.', 'Chapter 2, the directions and the tasting.', 'Chapter 3, the concepts.', 'Chapter 4, the plan: read it back, owners and all.', 'Next step 1: an owner for each direction.', 'Next step 2: the write-up within 8 business days.', 'Next step 3: the next round of samples, in January 2027.'] },
  lunch: { clicks: ['The thank-you card.'], ask: 'Questions until 12:00, then lunch, hosted by Church & Dwight.' },
};
