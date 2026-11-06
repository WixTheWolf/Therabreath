// Slide by slide (v2 of the explainer): for every slide, why it's there, what to say and the question for the room.
// Every line is taken from the team's talking points and run sheet in final/src/lib (sceneNotes.ts, runNotes.ts and
// the SLIDES plan) as they stood on November 6, shortened to read on screen. Quotes are the team's own lines. Slide 13,
// the film, plays on its own and isn't covered. Screens are the same practice-data captures as v1, names swapped out.

export type SlideCard = {
  n: number; id: string; block: number; part: string; window: string; title: string;
  why: string; say: string[]; ask?: string; shots: string[];
};

export const SLIDE_CARDS: SlideCard[] = [
  {
    n: 1, id: "arrival", block: 0, part: "Welcome", window: "Before 10:00", title: "The Future of Freshness",
    why: "Every phone joins before we start, so the tasting and the votes just work.",
    say: ["As people sit down, ask them to scan the code. Their first names pop up.", "At 10:00, thank Ross for inviting us. Then: “By noon we’d like to agree what deserves another round, what you’d change and what the next step should be.”"],
    shots: ["01-arrival"],
  },
  {
    n: 2, id: "team", block: 0, part: "Welcome", window: "10:00 to 10:10", title: "Who we are, since July",
    why: "Ross asked to see our creativity, technical expertise and innovation. This is where we start showing all three.",
    say: ["One plain sentence each: who we are and what we do day to day.", "What we test in the lab and what we bring in from outside oral care. The point is the two together."],
    shots: ["02-team"],
  },
  {
    n: 3, id: "ours", block: 0, part: "Welcome", window: "10:00 to 10:10", title: "Our flavors in your range",
    why: "Proof that our flavors already work in a real base and a real product.",
    say: ["One minute. Don’t read out all 14: ten rinses and the four kids rinses.", "Flavor names only. Usage levels and flavor codes stay off the slide and out of what we say."],
    shots: ["03-ours"],
  },
  {
    n: 4, id: "brief", block: 0, part: "Welcome", window: "10:00 to 10:10", title: "Your four objectives",
    why: "It shows the morning is built around what Ross asked for, in his own words.",
    say: ["“We built the morning around these four objectives: what’s changing, where flavor could go, what we could make and what to do first.”", "His goal has two halves: loyal users and people who don’t buy TheraBreath yet. Keep both in view all morning."],
    ask: "Is there anything critical we should add?",
    shots: ["04-brief"],
  },
  {
    n: 5, id: "prework", block: 0, part: "Welcome", window: "10:00 to 10:10", title: "Their pre-brief answers",
    why: "We start from their own answers, so the room is talking about its own view from the first minutes.",
    say: ["Say how many answers there are. It’s a starting point, not consumer research, and a tie is a tie.", "Explore the off-brand answers: what makes each one feel wrong for the brand?"],
    ask: "Anything here you’d argue with?",
    shots: ["05-prework"],
  },
  {
    n: 6, id: "open1", block: 1, part: "Part 1", window: "10:10 to 10:25", title: "What’s changing",
    why: "Each part opens on Ross’s objective, so the room always knows which question we’re answering.",
    say: ["Ten or fifteen seconds. Don’t read the objective out.", "“First, what’s changing, and which of those changes deserves our attention for TheraBreath?”"],
    shots: ["06-open1"],
  },
  {
    n: 7, id: "gap", block: 1, part: "Part 1", window: "10:10 to 10:25", title: "Out of every 100 households",
    why: "It turns growth into three groups of people, so the room can choose who a new flavor is for.",
    say: ["65 households in 100 buy mouthwash and 14 buy TheraBreath. Then the three groups: 14, 51 and 35.", "Say it, it isn’t on screen: a record 26.8% share of mouthwash sales in Q3, number 2 in the category."],
    ask: "Who should the next flavor win over first? Hands up, then ask why.",
    shots: ["07-gap-0", "07-gap-3"],
  },
  {
    n: 8, id: "market", block: 1, part: "Part 1", window: "10:10 to 10:25", title: "The shelf",
    why: "Mint is a strength. The shelf shows it, and where there’s room next to it, before we talk trends.",
    say: ["Mint is home base: 24 of 29 products. Say products, not flavors, and ask them to correct anything we have wrong.", "Competitor launches are product, timing and positioning only, nothing about how well they sold."],
    ask: "Finish the sentence: “I’d choose TheraBreath for its flavor if it...”",
    shots: ["08-shelf"],
  },
  {
    n: 9, id: "signals", block: 1, part: "Part 1", window: "10:10 to 10:25", title: "Seven trends: vote, then discuss",
    why: "The room picks what we spend time on, so the discussion is theirs, not ours.",
    say: ["One sentence on each trend, then phones out. “The vote sets our focus. It doesn’t decide which ideas are right.”", "About two minutes on each of the top three. A food trend is a cue to discuss, not proof people want it in a rinse."],
    ask: "Each trend’s own question, on screen as it opens.",
    shots: ["09-trends-vote", "09-trends-top"],
  },
  {
    n: 10, id: "open2", block: 2, part: "Part 2", window: "10:25 to 11:00", title: "Where flavor could go",
    why: "We move from the market to the experience itself, and set up the tasting.",
    say: ["“Now, what can we change in the experience itself? We’ll show you four directions, then taste the samples we’ve made in your bases.”"],
    shots: ["10-open2"],
  },
  {
    n: 11, id: "school", block: 2, part: "Part 2", window: "10:25 to 11:00", title: "Flavor School",
    why: "Everyone tastes with the same three ideas: flavor is more than taste, cool has a shape, and it has to work in their base.",
    say: ["One question on each build. The cooling curves are an illustration, not data from these samples.", "Keep it a conversation, not a lesson. No formula details: they know their bases better than we do."],
    ask: "What’s the toughest flavor you’ve tried to keep alive in a sodium chlorite base? Then listen.",
    shots: ["11-school-0", "11-school-1", "11-school-2"],
  },
  {
    n: 12, id: "map", block: 2, part: "Part 2", window: "10:25 to 11:00", title: "Four directions",
    why: "First reactions to all four directions before anything is tasted, including the two we didn’t sample.",
    say: ["Our view, not data. Two of the four are in today’s tasting. Don’t say which samples yet.", "Give Global Brightness and Modern Clean a fair half minute each: the room can put chips on them."],
    ask: "Which one would you put on the shelf first? Which one would you argue against?",
    shots: ["12-map", "12-map-card"],
  },
  {
    n: 14, id: "tasting", block: 3, part: "Part 2", window: "10:40 to 11:00", title: "The blind tasting",
    why: "The heart of the morning: honest first reactions, scored before a name or an opinion can sway them.",
    say: ["A and B in the Kids base, C and D in Fresh Breath. Water between samples.", "“Score each one before we discuss it.” No averages until everyone’s done. Scores first, names after."],
    ask: "For the Mystery Flavor: write down the fruits you get.",
    shots: ["14-tasting-blind", "14-tasting-scores"],
  },
  {
    n: 15, id: "nextround", block: 3, part: "Part 2", window: "10:40 to 11:00", title: "What deserves the next round",
    why: "The scores become a choice about what goes back to the lab, without crowning a winner.",
    say: ["No winner on the chart: the kids and adult samples are for different people in different bases.", "Then five chips each. Stacking is fine. Hand chips go in from the presenter view."],
    ask: "If only one went back to the lab tomorrow, which one? What would you fix first?",
    shots: ["15-next-chart", "15-next-top"],
  },
  {
    n: 16, id: "open3", block: 4, part: "Part 3", window: "11:00 to 11:20", title: "What we could make",
    why: "From reacting to building. A chip lead is a starting priority, not yet a concept.",
    say: ["“Now let’s turn it into something specific enough to brief: who it’s for, when it helps and what the next version needs to do.”"],
    shots: ["16-open3"],
  },
  {
    n: 17, id: "whitespace", block: 4, part: "Part 3", window: "11:00 to 11:20", title: "Where TheraBreath fits in a day",
    why: "Each idea gets tied to a real moment, and that moment becomes the When on its concept card.",
    say: ["The rinse bookends the day, morning and night. That’s our read, so ask them to correct us.", "Tap a flavor, then a moment. Say out loud that its first place becomes its When."],
    ask: "Pick a moment. What should it taste like?",
    shots: ["17-day-1", "17-day-3"],
  },
  {
    n: 18, id: "concepts", block: 4, part: "Part 3", window: "11:00 to 11:20", title: "Concepts",
    why: "One or two ideas specific enough to brief, agreed with the room rather than handed to them.",
    say: ["Starter cards: nothing filled in is a decision until we agree it. One or two good cards beat three thin ones.", "Tap Mark as agreed only when the room says yes."],
    ask: "Picture one person who’d buy this. Who are they, and when do they reach for it?",
    shots: ["18-concepts"],
  },
  {
    n: 19, id: "open4", block: 5, part: "Part 4", window: "11:20 to 11:40", title: "What to do first",
    why: "The room should feel it’s reaching a decision, not starting another presentation.",
    say: ["“Let’s agree what moves now, what needs more evidence and what is worth keeping for later.”"],
    shots: ["19-open4"],
  },
  {
    n: 20, id: "board", block: 5, part: "Part 4", window: "11:20 to 11:40", title: "Now, Next, Later",
    why: "The morning becomes a plan: every Now line leaves with an owner and a next step.",
    say: ["Place an idea only when the group agrees. The board records a decision, it doesn’t make one.", "Each Now line gets a TFF owner, a C&D reviewer, a base and a date. Not sure yet? To confirm, and agree who will."],
    ask: "Is this the next piece of work we want to do? What must it show, who takes it forward and when should we review it?",
    shots: ["20-board"],
  },
  {
    n: 21, id: "playbook", block: 6, part: "Wrapping up", window: "11:40 to 12:00", title: "What we decided and what happens next",
    why: "We check we heard them right before anyone leaves.",
    say: ["Read the plan back, owners and all. Two to four minutes is enough.", "Three next steps: an owner for each direction, the write-up within 8 business days, samples in January 2027."],
    ask: "Is there anything here that doesn’t match what we agreed?",
    shots: ["21-playbook-4", "21-playbook-7"],
  },
  {
    n: 22, id: "lunch", block: 6, part: "Wrapping up", window: "11:40 to 12:00", title: "Thank you",
    why: "We finish on their view, not ours.",
    say: ["“Thank you for the time and the feedback.” Questions until 12:00, then lunch, hosted by Church & Dwight."],
    ask: "What surprised you this morning? And what have we missed?",
    shots: ["22-thanks"],
  },
];

// How long each slide stays up: time to read what's on it, at an easy pace, with a short hold at the end.
const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
export const PER_WORD = 7; // frames per word, about four words a second
export const LEAD = 22; // frames before the why appears
export const HOLD = 50; // frames after the last line lands
export const beats = (c: SlideCard) => {
  const why = LEAD;
  let t = why + Math.max(40, words(c.why) * PER_WORD);
  const say = c.say.map((p) => { const at = t; t += Math.max(36, words(p) * PER_WORD); return at; });
  const ask = c.ask ? t : -1;
  if (c.ask) t += Math.max(40, words(c.ask) * PER_WORD);
  return { why, say, ask, total: t + HOLD };
};
