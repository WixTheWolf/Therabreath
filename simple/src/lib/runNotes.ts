// What the team does in each block of the morning, for the run sheet (team only, printed): the slides, what happens,
// the technology and materials, what the block should leave us with, and any transition. Kept apart from RUN in
// content.ts, which ships to attendee pages, so nothing written for the team (THE FLAVOR RACE above all) reaches them.
// Import this only from team-only pages.
import { MYSTERY } from './content';

export type BlockNotes = { slides: string; does: string; kit: string; output: string; after?: string };

const TEXT: Record<string, Pick<BlockNotes, 'slides' | 'does'>> = {
  welcome: {
    slides: 'Arrival, Title, Who we are, What we want to accomplish, Your pre-brief answers (only if answers came in), Why we’re here (optional)',
    does: 'As people sit down, the arrival screen shows the QR code and counts the phones as they join. Thank Ross for having us, introduce the four of us, and go round the table for names. Then set up the morning around three things, built on Ross’s four objectives: what’s changing, what the samples tell us, and what we should work on next. Show the pre-brief answers if any came in.',
  },
  market: {
    slides: 'Part 1, 86 out of 100 households, The portfolio today (optional), What competitors are launching, Three conversations about trends, Four directions',
    does: 'Market highlights first: the household gap, the portfolio and what competitors are launching. Then three short conversations instead of seven trend slides and a vote: the feel of freshness, botanicals and herbs, and fruit and playful flavors, one click each with its sources and one question. Finish with all four directions on one slide: two are in the tasting, and Global Brightness and Modern Clean are ideas for discussion with no samples today. No sample letters or names next to the directions.',
  },
  film: {
    slides: 'Part 2, THE FLAVOR RACE',
    does: 'Part 2 opens in a breath, then lights down: THE FLAVOR RACE, a surprise for the room, so don’t announce it. 2:24 of film. It starts only when you move onto it, and you can pause, restart or skip it from the presenter view or the keys. It ends on four glasses on a tray: lights up and bring out the samples. Its flavor montage shows the flight’s own fruits, the Mystery Flavor’s among them, so treat it as a hint. If we’re running late, skip it: nothing is decided on it. It isn’t on the attendee agenda, which goes straight from 10:10 to 10:25.',
  },
  tasting: {
    slides: 'What to taste for, The blind tasting',
    does: `While the samples are poured, a short word on flavor, cooling, the finish and the base (the full Flavor School slides are in the backup, for questions). Then A and B in the Kids base and C and D in the Fresh Breath base. For each sample, everyone completes the three scores, flavor appeal, fit with TheraBreath and newness, on their phone or the paper scorecard; the other questions are optional. ${MYSTERY} is the Mystery Flavor, so anyone who wants to can note the fruits they get. Everyone scores all four before the names go up. Type the paper cards into the presenter view as they’re handed in, or collect them to type in later. 35 minutes is the target: the size of the group and the discussion set the pace.`,
  },
  choose: {
    slides: 'Where each sample landed, What stood out?, Vote: what gets a next round',
    does: 'Show where each sample landed, from their scores. Then ask: What stood out? What would you keep, and what would you change? Type what they say under Keep and Change for each sample. Then the one vote of the morning: five chips each across the four samples and the two directions we didn’t taste. If the room has already reached a clear agreement in the discussion, skip the vote and capture that instead.',
  },
  build: {
    slides: 'Part 3, What we work on next',
    does: 'Concept building and the roadmap in one. Take the one or two strongest opportunities and, for each, capture: who might it be for, and when might they use it? What should the flavor and experience be like? What needs to change or be tested in the next sample? What are the next steps and timing, if both teams can agree? Type them on the TV or in the presenter view. Anything else promising goes on the explore-later list so it doesn’t disappear. Treat the scores as the group’s reactions, not proof of what consumers will buy.',
  },
  readback: {
    slides: 'What we decided, What happens next',
    does: 'Read the plan back, one chapter at a time: the tasting with what they’d keep and change, the chips, the one or two ideas with their next steps and timing, and the explore-later list. Make sure everyone agrees. Then the three next steps.',
  },
  buffer: {
    slides: 'Thank you',
    does: 'Ten minutes for more discussion, questions or anything that ran long. The backup slides are ready if Ross’s team wants more on a topic. Then lunch, hosted by Church & Dwight.',
  },
};
// The facilitator's view of each block: what it needs and what it should leave us with. Only what the run sheet and
// the presentation already say; suggestions are marked as suggestions.
const KIT: Record<string, Pick<BlockNotes, 'kit' | 'output' | 'after'>> = {
  welcome: { kit: 'Laptop on the TV as an extended display, the presenter view (P), the QR code on the arrival screen, Wi-Fi for the laptop.', output: 'Phones joined, names around the table, and the pre-brief answers on screen if any came in.' },
  market: { kit: 'The presentation only. The seven trends and the trend vote are in the backup if someone wants to dig deeper.', output: 'The room’s read on the three trend conversations, and on the four directions before anything is tasted.' },
  film: { kit: 'Speakers loud enough for THE FLAVOR RACE (checked before anyone arrives), the presenter view for its controls and the film saved on the laptop as a backup.', output: 'THE FLAVOR RACE (10:22 to 10:25, or skipped if we’re late), then the samples come out.' },
  tasting: { kit: 'Four samples in coded cups (A and B in the Kids base, C and D in the Fresh Breath base), water, spit cups, napkins, paper scorecards and pens, phones.', output: 'The three scores for all four samples from everyone, the optional answers where people gave them, the fruit guesses, and the names revealed.', after: 'Suggested transition: collect the paper cards as people finish, even if there isn’t time to type them in yet.' },
  choose: { kit: 'Phones for the chips; hand chips in the presenter view for anyone without one. The Keep and Change boxes on the TV.', output: 'What the room would keep and change for each sample, and the chips (or the agreement) on what gets a next round.' },
  build: { kit: 'What we work on next on the TV, or the presenter view.', output: 'One or two ideas, each with who it’s for and when, the flavor and experience, what to test in the next sample, and next steps and timing where both teams agree, plus an explore-later list.' },
  readback: { kit: 'The presenter view for the read-back, and the results page ready to save as a PDF.', output: 'The plan read back and agreed.' },
  buffer: { kit: 'The backup slides (Go to, in the presenter view).', output: 'Questions answered, and the results page saved as a PDF before the laptop closes.' },
};
export const RUN_NOTES: Record<string, BlockNotes> = Object.fromEntries(Object.keys(TEXT).map((id) => [id, { ...TEXT[id], ...KIT[id] } as BlockNotes]));

// Two example ideas the hosts can offer on What we work on next if the room needs a starting point (team pages only). They build on the
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

// What to cut, in order, if the morning runs behind. The tasting, the reactions and the one or two ideas with their next
// steps are what the morning is for. The 11:50 to 12:00 buffer is there to absorb a slow tasting.
export const BEHIND = [
  'A few minutes behind: press S. It skips the optional slides (Why we’re here and The portfolio today), and the presenter view shows the short version is on.',
  'Further behind: skip THE FLAVOR RACE (the right arrow or ] on it goes straight on, and the presenter view has a button on the slide before it), take the trend conversations as headlines only, and skip the chips if the room already agrees.',
  'The tasting runs long: let it. The ten minutes of buffer at 11:50 are there for it. Flesh out one idea instead of two.',
  'Out of time: read back the one idea with its next steps, then End goes straight to the thank-you card.',
  'Never cut: the blind tasting, What stood out, and the next steps for whatever we pick.',
];


// The morning slide by slide, for the team: what each click shows on the TV, the question to put to the room, and what
// the phones do. The planned minutes and windows live in slideTimes.ts, which the presenter view also reads. Numbers are
// the presentation's own (the presenter view's Go to list): "Your pre-brief answers" is always 5, and is skipped while
// nobody has answered. The backup slides come after the thank-you card and have no planned time.
export type SlidePlan = { clicks?: string[]; ask?: string; phones?: string };
export const SLIDES: Record<string, SlidePlan> = {
  arrival: { clicks: ['The QR code, the number of phones joined and their first names.'], phones: 'Scan the code and type a first name.' },
  title: { ask: 'Welcome, thank Ross, and set up the two hours: what’s changing, what the samples tell us, what we work on next.' },
  team: { clicks: ['Who we are, what we test in the lab, and what we bring in from outside oral care.'], ask: 'A quick round of names around the table.' },
  brief: { clicks: ['“Three things this morning, built around your four objectives.”', 'Part 1, What’s changing, 10:10 to 10:22: objective 01.', 'Part 2, What the samples tell us, 10:22 to 11:20: objective 02.', 'Part 3, What we work on next, 11:20 to 11:50: objectives 03 and 04.', 'Ross’s goal, in his words.'] },
  prework: { clicks: ['Who the next flavor should be for, with any “Someone else” answers.', 'The moment TheraBreath is missing, and the group’s freshness profile.', 'What would feel off-brand, without names.'], ask: 'What makes each off-brand answer feel wrong for the brand?' },
  thesis: { clicks: ['“TheraBreath took the burn out of mouthwash.”', '“The next job is giving more people a reason to want it.”'] },
  open1: { clicks: ['Part 1 of 3, 10:10 to 10:22: objective 01 in Ross’s words.'] },
  gap: { clicks: ['Two glasses fill: 65 for mouthwash, 14 for TheraBreath (Church & Dwight’s Q3 call), with the record 26.8% share.', '“86 out of 100 households don’t buy TheraBreath yet,” and “The other 86.”', '“Flavor could give more of them a reason to try it.”'], ask: 'Of the 86 households, 35 don’t buy mouthwash at all. Which group is a new flavor for?' },
  portfolio: { clicks: ['21 of 25 flavors are mint, across six formats.', '“There’s a lot of room around mint.”'] },
  market: { clicks: ['“Your competitors are launching flavors, mostly as limited editions.”', 'Listerine Watermelon Mint, July 2025.', 'Listerine Citrus Mint, March 2026.', 'TheraBreath Eucalyptus Mint, March 2026.', 'Listerine’s range of intensities, June 2026.', 'Hismile tie-ins, 2025 to 2026.', 'Where TheraBreath stands.'], ask: 'TheraBreath already has what they’re chasing. What keeps it ahead?' },
  trends: { clicks: ['Seven trends, three conversations: the list.', 'The feel of freshness: milder mouthwash, how it feels, dry mouth and changed taste.', 'Botanicals and herbs: botanicals in daily routines, warm spices in fresh flavors.', 'Fruit and playful flavors: fruit growing up, sweeter and more playful flavors.'], ask: 'One question each: what should TheraBreath feel like in the first ten seconds, and after a minute? Which moment of the day could a botanical own? Where is the line between fun and too sweet?' },
  directions: { clicks: ['The four directions on one slide: two in the tasting (with their bases), two for discussion with no samples today.', '“Which direction feels most like TheraBreath, and which one stretches it the most?”'] },
  open2: { clicks: ['Part 2 of 3, 10:22 to 11:20: objective 02 in Ross’s words. A breath, then lights down.'] },
  film: { clicks: ['THE FLAVOR RACE, 2:24, lights down and sound up. Don’t announce it. It ends on four glasses on a tray: lights up and bring out the samples.'], ask: 'Nothing: let it play. Its montage shows the flight’s fruits, so it doubles as a hint for the Mystery Flavor.', phones: 'Phones show “Phones down for a couple of minutes.”' },
  basics: { clicks: ['Flavor: mostly smell, plus how it feels.', 'Cooling: the first hit, and how long it lasts.', 'The finish: it has to finish clean.', 'The base: OXYD-8 is tough on flavor, so everything is made in your bases.'], ask: 'While the samples are poured. Questions on the chemistry? The Flavor School slides are in the backup.' },
  tasting: { clicks: ['Four coded samples and how many have scored. A and B first, then C and D, with water between.', 'Their one-word answers and fruit guesses.', `The names, after everyone has scored all four. ${MYSTERY} shows its name only.`], phones: 'For each sample: flavor appeal, fit with TheraBreath and newness, 1 to 5. The rest is optional and folded away: who would buy it, which direction, whether to develop it, one word, and the Mystery Flavor’s fruits. Paper cards typed into the presenter view, now or later.' },
  matrix: { clicks: ['Each sample placed by fit with TheraBreath (across) and newness (up), sized by appeal.', 'The names on the bubbles, and “first reactions, not consumer research.”'], ask: 'Top right is what Ross asked for: both at once.' },
  react: { clicks: ['The four samples with their names and averages, each with Keep and Change boxes to type into.'], ask: 'What stood out? What would you keep, and what would you change?' },
  nextround: { clicks: ['The vote: four samples and two untasted directions.', 'The top three.'], phones: 'Five chips each, stacking allowed. Hand chips in the presenter view. Skip it if the room already agrees.' },
  open3: { clicks: ['Part 3 of 3, 11:20 to 11:50: objectives 03 and 04 in Ross’s words.'] },
  develop: { clicks: ['The top chips in a tray, up to two opportunity cards, and the explore-later list.'], ask: 'For each: Who might it be for, and when might they use it? What should the flavor and experience be like? What needs to change or be tested in the next sample? What are the next steps and timing, if both teams can agree?' },
  playbook: { clicks: ['The Playbook assembles from the morning.', 'Chapter 1, the tasting, with what they’d keep and change.', 'Chapter 2, what gets a next round.', 'Chapter 3, the one or two ideas, with next steps and timing.', 'Chapter 4, the explore-later list.', 'The cover. The write-up comes within 8 business days.'], ask: 'Does everyone agree?' },
  next: { clicks: ['“Thank you. Here’s what happens next.”', 'Next steps for what we pick.', 'The write-up within 8 business days.', 'The next round of samples, in January 2027.'] },
  lunch: { clicks: ['The thank-you card.'], ask: 'Ten minutes for questions, more discussion or anything that ran long. Then lunch, hosted by Church & Dwight.' },
  // Backup
  july: { clicks: ['The four July themes.', 'Growth, November, lights up.'] },
  signals: { clicks: ['The seven trends as a list.', 'Clicks 1 to 7: one trend each, with its evidence and where it comes from, what it could mean, and a question for the room.'], ask: 'Which one surprised you most?' },
  signalvote: { clicks: ['The vote: seven bars fill as phones vote.', 'The top three.', '“What are you seeing that we missed?”'], phones: 'Pick three trends. Hand votes in the presenter view for anyone without a phone.' },
  school: { clicks: ['“Most of what we call flavor is really smell. The rest is how it feels.”', 'Taste: the tongue.', 'Aroma: the nose, both ways.', 'Feel: the trigeminal nerve.'] },
  cooling: { clicks: ['Classic menthol’s curve (drawn to explain, not measured).', 'A long-lasting cooler.', 'A signature curve.', '“We tune both.”'] },
  oxyd: { clicks: ['OXYD-8 is tough on bacteria, and on flavor.', 'Controlling pH.', 'Dissolving and protecting the flavor.', 'Choosing materials that hold up.'] },
  anatomy: { clicks: ['“It has to finish clean.”', 'First impression.', 'Main flavor.', 'Finish.', 'How long it lasts.'] },
  map: { clicks: ['The map: familiar to adventurous, gentle to bold. Our view, not data.', 'The four directions.', '“Two of these are in today’s tasting.”'] },
  platform1: { clicks: ['Plant-Powered Freshness: its flavor arc and profile.', 'Where it stands, what it tastes like, who it’s for.'] },
  platform2: { clicks: ['Global Brightness: its flavor arc and profile.', 'Where it stands, what it tastes like, who it’s for.'], ask: 'Is there a citrus that could sit comfortably next to your mints?' },
  platform3: { clicks: ['Modern Clean: its flavor arc and profile.', 'Where it stands, what it tastes like, who it’s for.'], ask: 'Can a gentle flavor still feel fresh enough?' },
  platform4: { clicks: ['Next-Generation Kids: its flavor arc and profile.', 'Where it stands, what it tastes like, who it’s for.'], ask: 'Would a mystery flavor get kids more interested in rinsing?' },
  concepts: { clicks: ['Three concept cards to type into: where it starts, who it’s for, when, role in the range, format, what it grows.'] },
  dots: { clicks: ['The vote: the concepts and the four samples.', 'The top three.'], phones: 'Three dots each, stacking allowed.' },
  whitespace: { clicks: ['A day from wake-up to wind-down, plus on the go, with a row per idea (or per sample and direction).', 'Where TheraBreath is today: rinse, and lozenges, gum and sachets on the go.', 'The moment the pre-briefs say is missing.', 'Everything still open. Click a cell to mark where an idea fits.'] },
  board: { clicks: ['Now, Next, Explore later, with the top votes in a tray above. Click one to start its line under Now.'], ask: 'The longer roadmap, if Ross’s team wants it: the same rows as What we work on next, with owners and the base.' },
};
