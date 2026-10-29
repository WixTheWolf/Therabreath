// The talking points for every scene, for the team only: the presenter view (P), the notes on the TV (N), the Console
// and the presenter edition of the deck read them. They live apart from the run of show (scenes.ts), which every phone
// and attendee page loads, so nothing written for the team (THE FLAVOR RACE, which sample is which) ships to the room.
// Import this only from team-only pages and components. Nobody is named as presenting any part.
import { TOPICS, PORTFOLIO, SAMPLES, MYSTERY, PRIMARY_TERRITORIES } from './content';
import { SCENES, Scene } from './scenes';

const MINT = PORTFOLIO.filter((v) => /mint/i.test(v.flavor)).length;
const FRESH = SAMPLES.filter((x) => x.base.startsWith('Fresh')).map((x) => x.code).join(' and ');
const KIDS = SAMPLES.filter((x) => x.base.startsWith('Kids')).map((x) => x.code).join(' and ');

const POINTS: Record<string, string[]> = {
  arrival: ['At 9:30, Ross is meeting us to help with the Wi-Fi and the room.', 'Get the laptop on the TV and press F for full screen. Do the sound check on the rehearsal session before anyone arrives (see the run sheet).', 'No film to open: we start with our own welcome.', 'As people sit down, ask them to scan the code. Their names pop up on screen as they join.'],
  title: ['At 10:00, welcome everyone and thank Ross for inviting us.', 'Set up the two hours: the four things Ross asked for, four samples to taste and a plan to leave with.', 'Let them know phones will come out a few times, for the votes and the tasting.'],
  team: ['Introduce the four of us and what each of us does day to day.', 'Say a word about the range of our work: as a wholesale flavor manufacturer we make liquid and powder flavors for just about anything, with a focus on naturally derived flavors. A lot of it is custom work, developed with clients as their own proprietary flavors, and that range feeds what we bring to TheraBreath.', 'Ross asked to see our creativity, technical expertise and innovation capabilities. This morning is our chance to show all three.'],
  july: ['When they came to Norco in July, we talked about resiliency, innovation, operations and partnership.', 'Today is about the fifth: growth.'],
  brief: ['Read the four objectives just as Ross wrote them. They’re the agenda for the morning.', 'The last build is his goal: flavors that keep loyal users coming back and bring in new ones.'],
  prework: ['These are their pre-brief answers: the consumer they most want to win and the moment TheraBreath is missing.', 'Have some fun with the vetoes. There are no names on screen.', 'If nobody has answered yet, this scene skips itself.'],
  thesis: ['Give this one a second to land.', 'TheraBreath took the burn out of mouthwash. The next job is giving more people a reason to want it.'],
  gap: ['Some quick context first: 25.3% of US mouthwash in Q2 2026, up 4.5 points, and number 2 in the category.', 'Then let the glasses fill. 86 out of 100 US households still don’t buy TheraBreath.', 'Flavor is one of the best ways we have to reach them.'],
  portfolio: [`${MINT} of the ${PORTFOLIO.length} flavors are mint, and that’s a strength.`, 'The next build zooms out to show how much room there is around mint.'],
  market: ['Keep this one factual. Competitors are adding flavors, mostly as limited editions.', 'On the last build, point out that TheraBreath already has what they’re chasing: alcohol-free, dye-free, OXYD-8 and a kids line. Then ask what keeps it ahead.'],
  signals: ['Each click brings up one trend: the headline, two sources and what we think it means for TheraBreath.', 'No need to read every source out loud. Aim for about forty seconds each.', 'Ask which one surprised them most.'],
  signalvote: ['Phones out. Everyone picks three.', 'Watch the bars fill. If someone doesn’t have a phone, add their vote by hand in the presenter view.', 'Build 1 shows the top three, and those go into the Playbook.', `Build 2 asks: ${TOPICS[0].questions[1]}`],
  school: ['Taste is the tongue: sweet, sour, salty, bitter, umami.', 'Aroma is the nose, including what rises from the back of the mouth when you swallow.', 'Feel is the trigeminal nerve. That’s where cooling, tingle and warmth come from.'],
  cooling: ['Cooling does two jobs: the hit when you first rinse, and how long it lasts.', 'These curves are drawn to explain the idea. They aren’t measured data.'],
  oxyd: ['OXYD-8 is tough on the bacteria behind bad breath, and that makes it hard on flavor.', 'We have three things to work with: pH, how we dissolve and protect the flavor, and choosing materials that hold up.', 'Stick to public chemistry. No formula details.'],
  anatomy: ['Walk through the layers: first impression, main flavor, finish and how long it lasts.', 'Whatever it starts with, a TheraBreath flavor has to finish clean.'],
  map: ['Four directions on one map, from familiar to adventurous and from gentle to bold. It’s our view, not data.', 'The gentle, adventurous corner is where we think new users could come from.', 'Two of these are in today’s tasting.'],
  tasting: ['Phones out, or paper cards for anyone who prefers them. Score each sample as you go. Type the cards into the presenter view as they come in.', `${FRESH} are in the Fresh Breath base, and ${KIDS} are in the Kids base.`, `${MYSTERY} is the Mystery Flavor. Taste it last and have everyone write down the fruits they get.`, 'Leave time for water and a pause between samples. Remind everyone these are first reactions, not consumer research.', 'Build 1 shows their words and fruit guesses, and build 2 reveals the names.'],
  matrix: ['This chart comes straight from their scores. Across is feels like TheraBreath (loyal users), up is newness (new consumers), and the size of each bubble is appeal.', 'Top right is what Ross asked for: both at once.'],
  nextround: ['Everyone gets five chips for the samples and directions they’d develop next. Stacking is fine.', 'Add chips by hand in the presenter view for anyone without a phone.', 'Build 1 shows the top three.', `Then ask: ${TOPICS[1].questions[1]}`],
  concepts: ['Start from what scored well and what got chips.', 'Aim for up to three. For each one, cover where it starts, who it’s for, when they’d use it, its role in the range, the format and what it grows.', 'Type while they talk. The boxes suggest options from this morning, and everything saves to the session as you go.'],
  dots: ['Everyone gets three dots for the concepts or samples they’d develop. Stacking is fine.', 'Build 1 shows the top three.'],
  whitespace: ['This is a day from morning to night, with on the go set off to one side.', 'Build 1 shows where we think TheraBreath is today: rinse in the morning and at night, plus lozenges, gum and sachets on the go. Ask them to correct us.', 'Build 2 adds the moment their pre-brief answers say is missing, and build 3 shows everything that’s still open.', 'The rows are this morning’s concepts, or the samples and directions if none are written yet. Click a cell to mark where each one could fit.'],
  board: ['Put each concept and direction under Now, Next or Later, one line each.', 'Give each one its consumer or occasion, a flavor brief, a TFF owner, a C&D reviewer, the base and a date for the next sample.', TOPICS[3].questions[1]],
  playbook: ['This pulls together everything we decided this morning: the trends, the directions, the concepts and the plan.', 'Builds 1 to 4 open one chapter each at full size: the trends, the directions with the tasting, the concepts, and the plan. Read the plan back, owners and all.', 'The last build closes it into the cover. Let them know the write-up comes within 8 business days.'],
  next: ['Walk through the three next steps. The dates still need confirming before November 9.', 'Then thank everyone for their time.', 'Running late? Press End to skip the film and go straight to Lunch, or use Skip the film in the presenter view.'],
  film: ['At about 11:48, lights down and sound up. THE FLAVOR RACE runs 2:24. Don’t announce it.', 'Space or K pauses and plays, and R starts it again. The presenter view has the same buttons and the film’s clock.', 'Don’t talk over it. When it ends, the closing card stays up: Next goes to Lunch, Back to What happens next.'],
  lunch: ['Lunch at 12:00, hosted by Church & Dwight.'],
};
// The four part openers and the four directions follow one pattern each.
TOPICS.forEach((t, i) => { POINTS[`open${i + 1}`] = ['Read Ross’s words on screen, then talk it through:', ...t.points]; });
PRIMARY_TERRITORIES.forEach((t, i) => {
  const tasted = SAMPLES.some((x) => x.territory === t.id);
  POINTS[`platform${i + 1}`] = [`${t.name}: ${t.promise}`, tasted ? 'Two of today’s samples come from here. Don’t name them yet.' : 'This one isn’t in the tasting. We just want their opinion.', `Ask: ${t.q}`];
});
const LATE = 'This one’s optional. If we’re running late, press S to skip every optional slide, or ] to jump to the next part.';

// What the team calls a scene where the room's title stays neutral (the film keeps its name off the phones).
const HOST_TITLE: Record<string, string> = { film: 'THE FLAVOR RACE' };

export const pointsOf = (sc: Scene) => { const p = POINTS[sc.id] || []; return sc.optional ? [...p, LATE] : p; };
export const notesOf = (sc: Scene) => pointsOf(sc).join(' ');
export const titleOf = (sc: Scene) => HOST_TITLE[sc.id] || sc.title;
// Every scene with its points, for the checks that make sure none is missing.
export const ALL_POINTS = () => SCENES.map((sc) => ({ id: sc.id, points: pointsOf(sc) }));
