// What the explainer says about each block of the morning. Every line comes from the run sheet and talking points in
// final/src/lib (RUN in content.ts, runNotes.ts, sceneNotes.ts, slideTimes.ts) as they stood on November 5. Screens are
// captured from a local build with practice data; sample names are swapped for their letters before each capture.
import { HUE } from "./ui";

export type Shot = { src: string; label: string };
export type Block = { id: string; part: string; t: string; end: string; title: string; slides: string; hue: number; shots: Shot[]; lines: string[]; cue: string; sec: number };

export const BLOCKS: Block[] = [
  {
    id: "welcome", part: "Welcome", t: "10:00", end: "10:10", title: "Who we are, and their four objectives", slides: "Slides 1 to 5", hue: HUE.welcome,
    shots: [{ src: "01-arrival", label: "1 · The arrival screen" }, { src: "02-team", label: "2 · Who we are" }, { src: "05-prework", label: "5 · Their pre-brief answers" }],
    lines: ["Phones join on the arrival screen. First names pop up.", "The four of us, our flavors in 14 rinses, Ross’s four objectives.", "Their pre-brief answers, if any came in."],
    cue: "9:30: Ross helps with the Wi-Fi. Sound check on the rehearsal session first.", sec: 14,
  },
  {
    id: "market", part: "Part 1", t: "10:10", end: "10:25", title: "What’s changing", slides: "Slides 6 to 9", hue: HUE.p1,
    shots: [{ src: "07-gap-3", label: "7 · Out of every 100 households" }, { src: "08-shelf", label: "8 · The shelf" }, { src: "09-trends-vote", label: "9 · Seven trends: the vote" }, { src: "09-trends-top", label: "9 · The top three, one at a time" }],
    lines: ["The household gap: 14, 51 and 35 out of 100.", "The shelf: mint is home base. Where’s the gap?", "Phones pick three of seven trends. The top three open one at a time."],
    cue: "Keys 1 to 7 open any trend. 0 goes back.", sec: 16,
  },
  {
    id: "school", part: "Part 2", t: "10:25", end: "10:40", title: "Where flavor could go", slides: "Slides 10 to 13", hue: HUE.p2,
    shots: [{ src: "11-school-0", label: "11 · Flavor School" }, { src: "11-school-2", label: "11 · Your base" }, { src: "12-map", label: "12 · Four directions" }, { src: "12-map-card", label: "12 · A direction’s card" }],
    lines: ["Flavor School: three things to know before you taste.", "Four directions on one map. Click one to open its card.", "10:37: THE FLAVOR RACE. Lights down, sound up."],
    cue: "Don’t announce the film. The trays come out as it ends.", sec: 16,
  },
  {
    id: "tasting", part: "Part 2", t: "10:40", end: "11:00", title: "The blind tasting", slides: "Slides 14 and 15", hue: HUE.p2,
    shots: [{ src: "14-tasting-blind", label: "14 · Scoring, blind" }, { src: "14-tasting-scores", label: "14 · The scores" }, { src: "15-next-chart", label: "15 · Where each sample landed" }, { src: "15-next-top", label: "15 · Five chips each" }],
    lines: ["A and B in the Kids base, C and D in Fresh Breath, scored on phones.", "Next click: the scores. The one after: the names.", "Then the chart, and five chips each on what gets a second round."],
    cue: "Paper card? Tap +1 paper card in the presenter view.", sec: 17,
  },
  {
    id: "concepts", part: "Part 3", t: "11:00", end: "11:20", title: "What we could make", slides: "Slides 16 to 18", hue: HUE.p3,
    shots: [{ src: "17-day-3", label: "17 · Pick a moment" }, { src: "18-concepts", label: "18 · Up to three concepts" }],
    lines: ["Tap a flavor, then a moment, to place it on the day.", "Up to three concept cards start themselves from the chips.", "Change any field by tapping in the presenter view."],
    cue: "Mark a card agreed only when the room says yes.", sec: 14,
  },
  {
    id: "pipeline", part: "Part 4", t: "11:20", end: "11:40", title: "What to do first", slides: "Slides 19 and 20", hue: HUE.p4,
    shots: [{ src: "20-board", label: "20 · Now, Next, Later" }],
    lines: ["Place each idea on Now, Next or Later when the group agrees.", "Every Now line gets a TFF owner, a C&D reviewer, a base and a date.", "Not sure yet? Tap To confirm, and agree who will."],
    cue: "The owners and next steps are what the morning is for.", sec: 14,
  },
  {
    id: "close", part: "Wrapping up", t: "11:40", end: "12:00", title: "What we decided", slides: "Slides 21 and 22", hue: HUE.close,
    shots: [{ src: "21-playbook-4", label: "21 · The plan, read back" }, { src: "21-playbook-7", label: "21 · What happens next" }, { src: "22-thanks", label: "22 · Thank you" }],
    lines: ["The Playbook reads back one chapter at a time.", "Next: an owner for each direction, the write-up within 8 business days, samples in January 2027.", "Questions until 12:00, then lunch."],
    cue: "Save the results page as a PDF before you leave.", sec: 15,
  },
];

// The run of show as a bar: minutes per block, from RUN.
export const SPANS = [
  { id: "welcome", short: "Welcome", min: 10, part: "" },
  { id: "market", short: "What’s changing", min: 15, part: "01" },
  { id: "school", short: "Flavor School and directions", min: 15, part: "02" },
  { id: "tasting", short: "The tasting", min: 20, part: "02" },
  { id: "concepts", short: "Concepts", min: 20, part: "03" },
  { id: "pipeline", short: "Now, Next, Later", min: 20, part: "04" },
  { id: "close", short: "Wrap-up", min: 20, part: "" },
];

// The presentation's keys (ShowApp.tsx).
export const KEYS: [string, string][] = [
  ["→ or click", "Next"],
  ["←", "Back"],
  ["] and [", "Next or previous part"],
  ["S", "Short version"],
  ["N", "Talking points"],
  ["P", "Presenter view"],
  ["F", "Full screen"],
  ["B", "Blank screen"],
  ["1 to 7", "Open a trend (slide 9)"],
];
