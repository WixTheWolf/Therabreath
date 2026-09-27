// Shared concept data, bottle drawing and generative flavor artwork from the
// site/deck (../../assets/playbook-core.js), so the reel always matches them.
import * as mod from "../../assets/playbook-core.js";

type Concept = { id: string; name: string; flavor: string; tag: string; acc: string; bg: string; liquid: [string, string]; code: string };
type Art = { init: (r: () => number) => unknown; draw: (c: CanvasRenderingContext2D, w: number, h: number, t: number, s: unknown) => void };
type Core = {
  CONCEPTS: Concept[];
  ART: Record<string, Art>;
  rng: (seed: number) => () => number;
  bottle: (o: { liq: [string, string]; band: string; flavor: string; sub?: string }) => string;
  logoSymbol: (href: string) => string;
};

const m = mod as unknown as { default?: Core } & Core;
export const TB: Core = m.default ?? m;

/* The site bottle animates bubbles with SMIL, which runs on wall-clock time.
   Strip it so every rendered frame is deterministic. */
export const bottleSvg = (o: Parameters<Core["bottle"]>[0]) =>
  TB.bottle(o).replace(/<animate(Transform)?\b[^>]*\/>/g, "");
