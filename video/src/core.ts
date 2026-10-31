// Shared concept data, bottle drawing and generative flavor artwork from the
// site/deck (../../assets/playbook-core.js), so the reel always matches them.
import * as mod from "../../assets/playbook-core.js";

type Concept = { id: string; name: string; flavor: string; tag: string; acc: string; bg: string; hi: string; tone: "light" | "dark"; liquid: [string, string]; code: string };
type Art = { init: (r: () => number) => unknown; draw: (c: CanvasRenderingContext2D, w: number, h: number, t: number, s: unknown, p?: number) => void };
type Wild = { id: string; name: string; origin: string; trend: string; line: string; horizon: string; acc: string; sw: [string, string] };
type Trend = { id: string; lens: "flavor" | "sensory" | "consumer"; stage: number; h: string; tb: string };
type Lens = { h: string; c: string; q: string };
type Playbook = {
  ask: string; from: string;
  chapters: { n: string; h: string; o: string; p: string; c: string }[];
  plan: { d: string; h: string; p: string }[];
};
type Core = {
  CONCEPTS: Concept[];
  WILD: Wild[];
  TREND_DEEP: Trend[];
  LENSES: Record<string, Lens>;
  STAGES: string[];
  OBJECTIVES: { k: string; n: string; h: string; line: string; out: string }[];
  PLAYBOOK: Playbook;
  ART: Record<string, Art>;
  rng: (seed: number) => () => number;
  bottle: (o: { liq: [string, string]; band: string; flavor: string; sub?: string }) => string;
  logoSymbol: (href: string) => string;
  conceptBottleOpts: (c: Concept) => { liq: [string, string]; band: string; flavor: string; sub?: string };
};

const m = mod as unknown as { default?: Core } & Core;
export const TB: Core = m.default ?? m;

/* The site bottle animates bubbles with SMIL, which runs on wall-clock time.
   Strip it so every rendered frame is deterministic. */
export const bottleSvg = (o: Parameters<Core["bottle"]>[0]) =>
  TB.bottle(o).replace(/<animate(Transform)?\b[^>]*\/>/g, "");
