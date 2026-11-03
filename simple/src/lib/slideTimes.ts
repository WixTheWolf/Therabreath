// The planned minutes for every slide in the main flow (each block adds up exactly to its window in RUN) and the planned
// window they give each slide. Backup slides have no planned time. Our plan for pacing, not a script. The run sheet
// prints them and the presenter view shows the current slide's window next to the block's. Numbers only: the words for each slide stay in runNotes.ts, for the team pages.
import { RUN } from './content';
import { SCENES } from './scenes';

export const SLIDE_MIN: Record<string, number> = {
  // 10:00 to 10:10
  arrival: 0, title: 1, team: 3, brief: 2, prework: 3, thesis: 1,
  // 10:10 to 10:22. The part openers are a breath, not a minute.
  open1: 0, gap: 2, portfolio: 1, market: 2, trends: 5, directions: 2,
  // 10:22 to 10:25: Part 2 opens, then lights down for the film.
  open2: 0, film: 3,
  // 10:25 to 11:00. The 35 minutes are a target: the size of the group and the discussion set the pace.
  basics: 3, tasting: 32,
  // 11:00 to 11:20
  matrix: 3, react: 10, nextround: 7,
  // 11:20 to 11:40
  open3: 0, develop: 20,
  // 11:40 to 11:50
  playbook: 8, next: 2,
  // 11:50 to 12:00: the buffer, on the thank-you card.
  lunch: 10,
};

const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const clock = (m: number) => `${Math.floor(m / 60) % 12 || 12}:${String(m % 60).padStart(2, '0')}`;
// Each slide's planned window, worked out from its part's start and the minutes of the slides before it.
export const SLIDE_TIMES: Record<string, { from: string; to: string }> = (() => {
  const out: Record<string, { from: string; to: string }> = {};
  for (const b of RUN) {
    let m = toMin(b.t);
    for (const sc of SCENES.filter((s) => s.block === b.id)) { const d = SLIDE_MIN[sc.id] ?? 0; out[sc.id] = { from: clock(m), to: clock(m + d) }; m += d; }
  }
  return out;
})();
