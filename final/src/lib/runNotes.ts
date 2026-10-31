// What the team does in each block of the morning, for the run sheet (team only, printed): the slides, what happens,
// the technology and materials, what the block should leave us with, and any transition. Kept apart from RUN in
// content.ts, which ships to attendee pages, so nothing written for the team (THE FLAVOR RACE above all) reaches them.
// Import this only from team-only pages.
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
    slides: 'The blind tasting, Where each sample landed, Vote: what gets a next round',
    does: 'Pour A and B in the Fresh Breath base and C and D in the Kids base. Everyone scores each sample on their phone or the paper scorecard, and the scores fill the screen as they come in. Type the paper cards into the presenter view as they’re handed in. D is the Mystery Flavor, so get everyone’s fruit guesses before the names go up. Then show where each sample landed, and have everyone place five chips on what should get a next round.',
  },
  concepts: {
    slides: 'Part 3, Concepts, Vote: which ideas to develop',
    does: 'Take the directions with the most chips and write up to three concepts together. For each one, cover where it starts, who it’s for, the moment, its role in the range, the format, and whether it grows loyal users, new users or both. Type them straight into the cards on screen. Then everyone gets three dots on their phone to vote for the ones worth developing.',
  },
  pipeline: {
    slides: 'Part 4, Where TheraBreath fits in a day, Now, Next, Later',
    does: 'Walk through the day, moment by moment: where TheraBreath is today, the moment the pre-brief says is missing, and everything that’s still open. Click a cell to mark where each concept could fit. Then put each concept and direction under Now, Next or Later, one line each with its consumer or occasion, the flavor brief, a TFF owner, a C&D reviewer, the base and the date the next sample is due. Type them on the board or in the presenter view. The top votes sit in a tray above the board: click one to start its line under Now.',
  },
  close: {
    slides: 'What we decided, What happens next, THE FLAVOR RACE, Lunch',
    does: 'The Playbook fills in from the votes and the board, and opens one chapter at a time so it can be read back, the plan with its owners last. Read it back, go through the three next steps and say thank you. Then, at about 11:48, THE FLAVOR RACE: a surprise for the room, so don’t announce it. Give it three minutes: lights down, sound up, 2:24 of film, and a moment after. It starts only when you move onto it, and you can pause, restart or skip it from the presenter view or the keys. If we’re running late, skip it: every decision and owner is already saved before it, and the Lunch slide keeps the Now rows on screen. Then lunch, hosted by Church & Dwight.',
  },
};
// The facilitator's view of each block: what it needs and what it should leave us with. Only what the run sheet and
// the presentation already say; suggestions are marked as suggestions.
const KIT: Record<string, Pick<BlockNotes, 'kit' | 'output' | 'after'>> = {
  welcome: { kit: 'Laptop on the TV as an extended display, the presenter view (P), the QR code on the arrival screen, Wi-Fi for the laptop.', output: 'Phones joined, and the pre-brief answers on screen if any came in.' },
  market: { kit: 'Phones for the trend vote; hand votes in the presenter view for anyone without one.', output: 'The three trends that matter most, and what we missed.' },
  school: { kit: 'The presentation only.', output: 'The room’s first reactions to each of the four directions, before anything is tasted.' },
  tasting: { kit: 'Four samples in coded cups (A and B in the Fresh Breath base, C and D in the Kids base), water, spit cups, napkins, paper scorecards and pens, phones.', output: 'Scores for all four samples, the fruit guesses, the names revealed, and five chips each on what gets a next round.', after: 'Suggested transition: while the chips go in, clear the cups and pens so the table is free for the concept cards at 11:00.' },
  concepts: { kit: 'The concept cards on the TV, or typed in the presenter view; phones for the dot vote.', output: 'Up to three concepts, and the dot vote on which ones to develop.' },
  pipeline: { kit: 'The presenter view for Now, Next, Later (or type on the board).', output: 'Each direction under Now, Next or Later with its consumer or occasion, flavor brief, TFF owner, C&D reviewer, base and next-sample date.' },
  close: { kit: 'Speakers loud enough for THE FLAVOR RACE (checked before anyone arrives), the presenter view for its controls, and the film saved on the laptop as a backup.', output: 'The plan read back with its owners, the results page saved as a PDF, and the film (about 11:48 to 11:51, or skipped if we’re late).' },
};

export const RUN_NOTES: Record<string, BlockNotes> = Object.fromEntries(Object.keys(TEXT).map((id) => [id, { ...TEXT[id], ...KIT[id] } as BlockNotes]));
