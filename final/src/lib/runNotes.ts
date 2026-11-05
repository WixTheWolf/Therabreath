// What the team does in each block of the morning, for the run sheet (team only, printed): the slides, what happens,
// the technology and materials, what the block should leave us with, and any transition. Kept apart from RUN in
// content.ts, which ships to attendee pages, so nothing written for the team (THE FLAVOR RACE above all) reaches them.
// Import this only from team-only pages.
import { MYSTERY, PORTFOLIO } from './content';

export type BlockNotes = { slides: string; does: string; kit: string; output: string; after?: string };

const TEXT: Record<string, Pick<BlockNotes, 'slides' | 'does'>> = {
  welcome: {
    slides: 'The Future of Freshness (1), Who we are, since July (2), Our flavors in your range (3), Your four objectives (4), Your pre-brief answers (5, only if answers came in)',
    does: 'As people sit down, the arrival screen shows the title, the QR code and the first names as phones join. At 10:00, thank Ross for having us. Introduce the four of us, with the July row if there’s time. Then the TheraBreath products our flavors are in today. Read Ross’s four objectives and his goal, and show the pre-brief answers if any came in.',
  },
  market: {
    slides: 'Part 1: What’s changing (6), Out of every 100 households (7), The shelf (8), Seven trends: vote, then discuss (9)',
    does: 'The Part 1 slide carries Ross’s first objective in his words. Open on why we’re here, then the household gap, all in households out of 100: 14 buy TheraBreath, 51 buy mouthwash but not TheraBreath and 35 don’t buy mouthwash. Ask which a new flavor should focus on first. The record 26.8% share of sales is said, not shown. Put the portfolio next to what competitors are launching, and ask where flavor could add another reason to choose TheraBreath. Then all seven trends go up at once and everyone votes for three on their phone straight away; the presenter view adds a vote by hand for anyone without one. The next click closes the vote and the top three open one at a time for discussion. They go into the Playbook. Ask out loud what we missed.',
  },
  school: {
    slides: 'Part 2: Where flavor could go (10), Flavor School: flavor and sodium chlorite (11), Four directions (12), THE FLAVOR RACE (13)',
    does: 'The Part 2 slide carries Ross’s second objective. Then one slide on flavor, three things to know: taste, aroma and feel, cooling, then how the flavor has to work in the actual base and what we do, ending on the clean finish. Then the four directions on one map: click a direction to open its profile card. Two have samples in the tasting; the other two are optional cards that S skips. At 10:37, THE FLAVOR RACE: a surprise for the room, so don’t announce it. Lights down, sound up, 2:24 of film. It starts only when you move onto it, and you can pause, restart or skip it from the presenter view or the keys. The tray of four glasses comes at about 2:09, then the Let’s taste what’s next card and a short coda on the Moon; it goes to black at about 2:22. Bring the lights up and the covered trays out at black, not at the first tray. Its flavor montage shows the flight’s own fruits, the Mystery Flavor’s among them, so treat it as a hint. If we’re running late, skip it: nothing is decided on it.',
  },
  tasting: {
    slides: 'The blind tasting (14), What deserves the next round (15)',
    does: `At 10:40, uncover the trays poured during setup: A and B in the Kids base, C and D in the Fresh Breath base. Everyone scores each sample on their phone (how much they like the flavor, how well it fits TheraBreath, how different it is from current mouthwash flavors, and whether the sweetness and cooling are right). While they score, the screen shows only how many have finished all four, never the averages. The next build puts the scores up and closes scoring on the phones; if anyone is still scoring, the first press says how many and a second press goes on. The loaner phone or tablet is there for anyone without one; paper cards are the last resort. For each paper card handed in, tap +1 paper card in the presenter view; we type them in after the morning. ${MYSTERY} is the Mystery Flavor, so get everyone’s fruit guesses before the names go up. Then the bubble chart from the scores: talk about it first, with the chips still closed. The next build opens the chips, and everyone places five on the flavors or directions we should develop next (the four they tasted, plus the two directions not tasted today). Then the top three go up.`,
  },
  concepts: {
    slides: 'Part 3: What we could make (16), Where TheraBreath fits in a day (17), Concepts (18)',
    does: 'The Part 3 slide carries Ross’s third objective. Then walk through the day, moment by moment: where TheraBreath is today, the occasions the pre-brief would most like to explore, and which occasions TheraBreath could serve better. The top three from the chips sit in a tray: tap one, then a moment on the arc, to place it. Then the concept cards start themselves from those three, with When from the marks. Every card is a starting point for discussion: change any field by tapping in the presenter view, or swap a card for one from our library (the two example concepts are in it), and tap Mark as agreed when the room says yes. One or two well-defined cards are enough; a third is optional. Nothing to type: an answer the options don’t hold goes on the notes sheet, tapped as Other, in the notes.',
  },
  pipeline: {
    slides: 'Part 4: What to do first (19), Now, Next, Later (20)',
    does: 'The Part 4 slide carries Ross’s fourth objective. Then place each idea when the group agrees: tap a concept or direction in the tray (More ideas holds the rest), then tap Now, Next or Later. Tap a line to move it or take it back. In the presenter view, tap its fields: the consumer or occasion, the next version or question to test, the next test, a TFF owner, a C&D reviewer (confirm the person in the room), the base, the date the next sample is due (To confirm until the room agrees one) and the agreed next step. The flavor brief drafts itself, from the tasting for a sample or the map for a direction, and stays a draft until the write-up. Tap To confirm where nobody can say yet.',
  },
  close: {
    slides: 'What we decided and what happens next (21), Thank you (22)',
    does: 'The Playbook fills in from the votes and the board and opens one chapter at a time so it can be read back in two to four minutes: the concepts marked agreed or proposed, the plan with its owners last and anything still open. Then the three next steps, and thank you. The last slide is a thank-you card, and the time until 12:00 is for questions. Then lunch, hosted by Church & Dwight.',
  },
};
// The facilitator's view of each block: what it needs and what it should leave us with. Only what the run sheet and
// the presentation already say; suggestions are marked as suggestions.
const KIT: Record<string, Pick<BlockNotes, 'kit' | 'output' | 'after'>> = {
  welcome: { kit: 'Laptop on the TV as an extended display, the presenter view (P), the QR code on the arrival screen, Wi-Fi for the laptop, the loaner phone or tablet joined.', output: 'Phones joined, and the pre-brief answers on screen if any came in.' },
  market: { kit: 'Phones for the trend vote; hand votes in the presenter view for anyone without one.', output: 'The three trends that matter most, and what we missed.' },
  school: { kit: 'The presentation; speakers loud enough for THE FLAVOR RACE (checked before anyone arrives), the presenter view for its controls and the film saved on the laptop as a backup.', output: 'The room’s first reactions to the four directions, before anything is tasted, and THE FLAVOR RACE at 10:37 (or skipped if we’re late).' },
  tasting: { kit: 'The four samples pre-poured into coded cups (A to D) on covered trays, water, spit cups, napkins, phones and the loaner phone or tablet. A few paper scorecards and pens as a last resort.', output: 'Scores for all four samples, the fruit guesses, the names revealed, and five chips each on what gets a next round.', after: 'Suggested transition: while the chips go in, clear the cups and pens so the table is free at 11:00.' },
  concepts: { kit: 'The day-map cells on the TV, and the concept cards in the presenter view. All taps. A notes sheet and pen for answers the options don’t hold.', output: 'One or two well-defined concepts (up to three), each with where it starts, who it’s for, when, its role in the range, the format, the intended growth opportunity and the next version or question to test, marked agreed once the room says yes.' },
  pipeline: { kit: 'The presenter view for Now, Next, Later (all taps), or tap the board on the TV. The same notes sheet.', output: 'Each idea under Now, Next or Later, placed when the group agreed, with its consumer or occasion, flavor brief (drafted), next version or question to test, next test, TFF owner, C&D reviewer, base, next sample date and agreed next step, or To confirm with who will confirm it.' },
  close: { kit: 'The presenter view for the read-back, the notes sheet to read back, and the results page ready to save as a PDF.', output: 'The plan read back with its owners and open items, and the results page saved as a PDF.' },
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
  'A few minutes behind: press S. It skips the optional build (the July row on Who we are), and the presenter view shows the short version is on. Global Brightness and Modern Clean still get their cards, briefly: the room can put chips on them.',
  'Further behind: skip THE FLAVOR RACE (the right arrow or ] on it goes straight to the tasting, and the map’s presenter view has a button for it), discuss two of the top three trends instead of three, and keep one concept card instead of three. Press ] to jump to the next part.',
  'Out of time: read back Now, Next, Later with its owners, then End goes straight to the thank-you card.',
  'Never cut: the blind tasting, the chips on what gets a next round, and the owners and next steps on Now, Next, Later.',
];


// The morning slide by slide, for the team: what each click shows on the TV, the question to put to the room, and what
// the phones do. The planned minutes and windows live in slideTimes.ts, which the presenter view also reads. Numbers are
// the presentation's own (the presenter view's Go to list): "Your pre-brief answers" is always 5, and is skipped while
// nobody has answered.
export type SlidePlan = { clicks?: string[]; ask?: string; phones?: string };
export const SLIDES: Record<string, SlidePlan> = {
  arrival: { clicks: ['The title and the QR code. Once phones join, how many and their first names.'], ask: 'At 10:00: welcome, thank Ross, and say what the morning is for: what deserves another round, what you’d change and the next step.', phones: 'Scan the code and type a first name.' },
  team: { clicks: ['The four of us, what we test in the lab and what we bring in from outside oral care.', 'Optional (S skips it): the four July themes, and Growth, November, lights up.'] },
  ours: { clicks: ['The 14 TheraBreath rinses on shelf today with our flavors in them, each bottle with its flavor and product line.'] },
  brief: { clicks: ['“We’ve built the morning around your four objectives,” all four at once, each with its time and part.', 'Ross’s goal, in his words.'], ask: 'Is there anything critical we should add?' },
  prework: { clicks: ['Which audience a new flavor should focus on first, with any “Someone else” answers.', 'The occasion most useful to explore together, with any “Another occasion” answers, and their own taste in freshness.', 'What would feel off-brand, without names.'], ask: 'What makes each off-brand answer feel wrong for the brand?' },
  open1: { clicks: ['Part 1 of 4, 10:10 to 10:25: What’s changing, with Ross’s first objective in his words.'] },
  gap: { clicks: ['“TheraBreath built a strong position on a rinse without the burn. The next job is giving more people a reason to want it.”', 'Out of every 100 households: two glasses fill, 65 buy mouthwash and 14 buy TheraBreath. “TheraBreath is already number 2 in mouthwash.” Say the record 26.8% share of sales out loud; it isn’t on screen.', 'Three groups that add up to 100: 14 buy TheraBreath, 51 buy mouthwash but not TheraBreath, 35 don’t buy mouthwash.', '“Flavor could give more of these households a reason to try it.”'], ask: 'Which should a new flavor focus on first: the 14, the 51 or the 35?' },
  market: { clicks: [`“Mint is the center of the range”: ${PORTFOLIO.filter((v) => /mint/i.test(v.flavor)).length} of ${PORTFOLIO.length} products, across six formats, a dot for each product, mint in blue, and only the others named. Beside it, four competitor launches. Say that TheraBreath has its own Target exclusive too (Eucalyptus Mint).`, '“Where could flavor add something useful?”', 'Where TheraBreath stands.'], ask: 'Where can flavor add another reason to choose TheraBreath?' },
  signals: { clicks: ['All seven trends, one line each with where the evidence comes from. The bars fill as phones vote.', 'The vote closes. Number 1 opens: its evidence, what it could mean and its question. Equal votes share a place (Tied for first), and a tie that puts more than three in the top places is flagged: the room picks which three to open. No votes: the first three are shown as topics to discuss.', 'Number 2.', 'Number 3. The top three go into the Playbook. At any build, the keys 1 to 7 open that trend for more discussion; the same key again, or 0, goes back.'], ask: 'Each trend’s own question on screen. Then, out loud only: what are you seeing that we missed?', phones: 'Pick three trends straight away. Hand votes in the presenter view for anyone without a phone.' },
  open2: { clicks: ['Part 2 of 4, 10:25 to 11:00: Where flavor could go, with Ross’s second objective.'] },
  school: { clicks: ['Flavor School, three things to know. “Flavor combines taste, aroma and mouthfeel.” Taste, aroma and feel.', 'Cooling does two jobs: three curves over onset, peak and linger, drawn to explain, not measured, with no times.', '“The flavor has to work in the actual base, from the first rinse through shelf life.” What we do: compatible materials, incorporation and protection, stability in the agreed base. “The finish needs to feel clean.”'], ask: 'Where has flavor been hardest to get right with sodium chlorite for you?' },
  map: { clicks: ['The map: familiar to adventurous, gentle to bold, all four directions. Our view, not data.', 'Plant-Powered Freshness: its profile card.', 'Global Brightness, not tasted: a short, fair explanation, since it’s on the chips.', 'Modern Clean, not tasted: the same.', 'Next-Generation Kids.'], ask: 'Which direction feels most like TheraBreath, and which stretches it in a useful way? Click a direction to open its card.' },
  film: { clicks: ['THE FLAVOR RACE, 2:24, lights down and sound up. Don’t announce it. The tray of four glasses comes at about 2:09, then the Let’s taste what’s next card and a short coda on the Moon. At black (about 2:22), lights up and bring out the samples.'], ask: 'Nothing: let it play. Its montage shows the flight’s fruits, so it doubles as a hint for the Mystery Flavor.', phones: 'Phones show “Phones down for a couple of minutes.”' },
  tasting: { clicks: ['Four coded samples and how many phones have scored each one, with how many have finished all four. No averages yet. A and B first, then C and D, with water between.', 'The scores (averages, the number of scores per sample, and every sweetness and cooling answer as low, right, high), their one-word answers and fruit guesses. Scoring closes on the phones. If anyone is still scoring, the first press says so; press again to go on.', `The names. ${MYSTERY} shows its name only. Once the scores have been up, going back doesn’t reopen scoring (Reopen scoring in the presenter view does).`], phones: 'Score each sample: how much you like the flavor, how well it fits TheraBreath and how different it is from current mouthwash flavors, each from 1 to 5, with both ends named. Then sweetness and cooling: not enough, just right or too much. All five are needed to save a sample; one word, if they want. Fruit guesses for the Mystery Flavor. Paper cards counted with +1 in the presenter view and typed in after the morning.' },
  nextround: { clicks: ['“What deserves the next round?” Each sample placed by fit with TheraBreath (across) and perceived difference (up), 1 to 5 as scored, sized by how much they liked it, with the number of scores per sample. Under it, the two questions for the room. The chips are still closed: the phones say they open in a moment.', 'The chip question takes the place of the two questions, and the chips open on the phones.', 'The top three from the chips, ties shown as ties. The chips close on the phones.'], ask: 'Of C and D, which feels more like TheraBreath? Which of these deserves another round, and what would you change? If there’s time: what would set TheraBreath’s flavors apart from what competitors are launching?', phones: '“Which flavors or directions should we develop next?” Five chips each, stacking allowed: the four samples under Tasted today, and Global Brightness and Modern Clean under New directions, not tasted today. Hand chips in the presenter view: anyone without a phone has five too, so ask where their five go and tap once per chip.' },
  open3: { clicks: ['Part 3 of 4, 11:00 to 11:20: What we could make, with Ross’s third objective.'] },
  whitespace: { clicks: ['One arc from wake-up to wind-down, with on the go in the middle, and the top three from the chips in a tray below.', '“The rinse bookends the day: morning and night.” Rinse lights up at both ends, lozenges, gum and sachets on the go.', 'How many pre-briefs named each moment; the most named one glows (ties all glow).', '“Which occasions could TheraBreath serve better?” The other moments say To explore. Tap a flavor, then a moment, to place it: the first place for each becomes its concept’s When, in the pre-brief’s own words.'], ask: 'Where have we got today wrong? For each idea, what need would it serve better than what’s already there?' },
  concepts: { clicks: ['“What should each idea become?” Up to three starter cards from the top three chips, each marked Starting point for discussion, under a label that says what’s filled in is a proposal until we agree it: where it starts, who it’s for, when, role in the range, format, intended growth opportunity, next version or question to test. Change any field by tapping in the presenter view, swap a card from the library, and mark it agreed when the room says yes. A tie in the chips at the cutoff leaves a card open for the room’s pick, and a change to an agreed card takes the agreement off until it’s read back.'], ask: '“These are starter cards. None of the filled-in fields is a decision until we agree it. For this first idea, who is it for, what would it add and what should the next sample do differently?” If the room is stuck, swap in one of the two example concepts.' },
  open4: { clicks: ['Part 4 of 4, 11:20 to 11:40: What to do first, with Ross’s fourth objective.'] },
  board: { clicks: ['Now, Next, Later, with the concepts and the top chips in a tray and More ideas for the rest. Place an idea when the group agrees: tap it, then tap Now, Next or Later.'], ask: '“Is this the next piece of work we want to do? What must it show, who takes it forward and when should we review it?” For each line, tap in the presenter view: consumer or occasion, next version or question to test, next test, TFF owner, C&D reviewer, base, next sample date (To confirm until agreed), agreed next step. The flavor brief drafts itself and is finished in the write-up.' },
  playbook: { clicks: ['The Playbook assembles from the morning.', 'Chapter 1, the trends.', 'Chapter 2, the directions and the tasting.', 'Chapter 3, the concepts, each marked agreed or proposed.', 'Chapter 4, the plan: read it back, owners and all, and ask what doesn’t match what we agreed.', 'Next step 1: an owner for each direction.', 'Next step 2: the write-up within 8 business days.', 'Next step 3: the next round of samples, in January 2027.'] },
  lunch: { clicks: ['The thank-you card.'], ask: '“Thank you for the time and the feedback. Before we finish, what have we missed or left unclear?” Questions until 12:00, then lunch, hosted by Church & Dwight.' },
};
