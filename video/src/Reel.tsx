import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Open } from "./scenes/Open";
import { Ask } from "./scenes/Ask";
import { Trends } from "./scenes/Trends";
import { Worlds, WORLD_LEN } from "./scenes/Worlds";
import { Wildcards, WILD_LEN } from "./scenes/Wildcards";
import { Playbook } from "./scenes/Playbook";
import { End } from "./scenes/End";
import { BEAT, loadFonts } from "./theme";

loadFonts();

// 32 s at 30 fps. Every scene starts on a bar of public/audio/music.wav
// (120 BPM: one beat = 15 frames, one bar = 60). Build 810-870, hit on 870.
export const SCENES = [
  { id: "Open", from: 0, dur: 90, C: Open },
  { id: "Ask", from: 90, dur: 120, C: Ask },
  { id: "Trends", from: 210, dur: 180, C: Trends },
  { id: "Worlds", from: 390, dur: 180, C: Worlds },
  { id: "Wildcards", from: 570, dur: 180, C: Wildcards },
  { id: "Playbook", from: 750, dur: 120, C: Playbook },
  { id: "End", from: 870, dur: 90, C: End },
] as const;
export const TOTAL = 960;

const sfx = (file: string, from: number, volume = 1) => ({ file, from, volume });
const SFX = [
  sfx("shimmer", 2, 0.4),
  sfx("drop", 14, 0.9),
  sfx("splash", 20, 0.8),
  sfx("whoosh", 80, 0.7),
  sfx("impact", 90, 0.7),
  ...[0, 1, 2, 3].map((k) => sfx("pop", 150 + k * BEAT, 0.7)),
  sfx("whoosh", 200, 0.7),
  ...Array.from({ length: 12 }, (_, k) => sfx(k % 2 ? "tick" : "whip", 210 + k * BEAT - (k % 2 ? 0 : 2), k % 2 ? 0.45 : 0.45)),
  sfx("whoosh", 382, 0.8),
  ...Array.from({ length: 6 }, (_, k) => sfx(k ? "splash" : "impact", 390 + k * WORLD_LEN, k ? 0.55 : 0.8)),
  ...Array.from({ length: 6 }, (_, k) => sfx("pop", 394 + k * WORLD_LEN, 0.5)),
  sfx("whoosh", 562, 0.8),
  ...Array.from({ length: 9 }, (_, k) => sfx("impact", 570 + k * WILD_LEN, 0.5)),
  sfx("whoosh", 742, 0.8),
  ...[0, 1, 2, 3].map((k) => sfx("impact", 750 + k * BEAT, 0.8)),
  sfx("impact", 810, 0.9),
  sfx("riser", 812, 0.5),
  ...Array.from({ length: 6 }, (_, k) => sfx("tick", 820 + k * 4, 0.45)),
  sfx("whoosh", 858, 0.8),
  sfx("shimmer", 872, 0.6),
];

export const Reel: React.FC = () => (
  <AbsoluteFill style={{ background: "#071C3C" }}>
    {SCENES.map(({ id, from, dur, C }) => (
      <Sequence key={id} name={id} from={from} durationInFrames={dur}>
        <C />
      </Sequence>
    ))}
    <Audio src={staticFile("audio/music.wav")} volume={0.85} />
    {SFX.map((s, i) => (
      <Audio key={i} from={s.from} src={staticFile(`audio/${s.file}.wav`)} volume={s.volume} />
    ))}
  </AbsoluteFill>
);
