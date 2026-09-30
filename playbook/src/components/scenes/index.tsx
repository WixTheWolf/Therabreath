'use client';
import type { SceneProps } from './ui';
import { Arrival, Title, July, Brief, Prework, Thesis } from './Opening';
import { Climb, Gap, Portfolio, Market, Signal, SignalVote } from './ActI';
import { School, Cooling, Oxyd, Anatomy, Molecules } from './School';
import { MapScene, Territory, Tasting, Chips } from './Territories';
import { Missions, Seeds, Canvas, Pitches, Dots } from './CoCreate';
import { Pipeline, Calendar, Code } from './Build';
import { Assemble, Next, Lunch } from './Close';
import { Film, Vocab, Shifts, Clock, BenchScene } from './Hybrid';

// Scene id (without trailing digits) to view.
export const SCENE_VIEWS: Record<string, (p: SceneProps) => React.ReactNode> = {
  arrival: Arrival, title: Title, july: July, brief: Brief, prework: Prework, thesis: Thesis,
  climb: Climb, gap: Gap, portfolio: Portfolio, market: Market, signal: Signal, signalvote: SignalVote,
  school: School, cooling: Cooling, oxyd: Oxyd, anatomy: Anatomy, molecules: Molecules,
  map: MapScene, territory: Territory, tasting: Tasting, chips: Chips,
  missions: Missions, seeds: Seeds, canvas: Canvas, pitches: Pitches, dots: Dots,
  pipeline: Pipeline, calendar: Calendar, code: Code,
  film: Film, vocab: Vocab, shifts: Shifts, clock: Clock, bench: BenchScene,
  assemble: Assemble, next: Next, lunch: Lunch,
};
