// The planned minutes for every slide (each part adds up exactly to its window in RUN) and the planned window they give
// each slide. Our plan for pacing, not a script. The run sheet prints them and the presenter view shows the current
// slide's window next to the part's. Numbers only: the words for each slide stay in runNotes.ts, for the team pages.
import { RUN } from './content';
import { SCENES } from './scenes';

export const SLIDE_MIN: Record<string, number> = {
  arrival: 1,
  team: 2,
  brief: 2,
  prework: 5,
  gap: 3,
  market: 3,
  signals: 9,
  school: 4,
  map: 8,
  film: 3,
  tasting: 13,
  nextround: 7,
  whitespace: 5,
  concepts: 15,
  board: 20,
  playbook: 8,
  lunch: 12,
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
