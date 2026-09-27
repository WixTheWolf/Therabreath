import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Drop } from "./scenes/Drop";
import { Fresh } from "./scenes/Fresh";
import { Bottle } from "./scenes/Bottle";
import { Mosaic } from "./scenes/Mosaic";
import { Arc } from "./scenes/Arc";
import { End } from "./scenes/End";
import { BEAT, loadFonts } from "./theme";

loadFonts();

// 15 s at 30 fps. Cuts land on the 120 BPM grid of public/audio/music.wav (one beat = 15 frames).
export const SCENES = [
  { id: "Drop", from: 0, dur: 45, C: Drop },
  { id: "Fresh", from: 45, dur: 90, C: Fresh },
  { id: "Bottle", from: 135, dur: 105, C: Bottle },
  { id: "Mosaic", from: 240, dur: 75, C: Mosaic },
  { id: "Arc", from: 315, dur: 75, C: Arc },
  { id: "End", from: 390, dur: 60, C: End },
] as const;

const sfx = (file: string, from: number, volume = 1) => ({ file, from, volume });
const SFX = [
  sfx("drop", 22, 0.9),
  sfx("splash", 26, 0.9),
  sfx("whoosh", 38, 0.6),
  ...[1, 2, 3, 4, 5].map((k) => sfx("whip", 45 + k * BEAT - 2, 0.55)),
  sfx("whoosh", 131, 0.8),
  ...[0, 1, 2, 3, 4, 5].map((k) => sfx("pop", 150 + k * BEAT, 0.7)),
  ...[0, 1, 2, 3, 4, 5].map((k) => sfx("tick", 240 + k * 4, 0.45)),
  sfx("impact", 274, 0.6),
  sfx("whoosh", 300, 0.8),
  sfx("impact", 315, 0.8),
  sfx("impact", 345, 0.8),
  sfx("riser", 343, 0.55),
  sfx("impact", 375, 0.8),
  sfx("shimmer", 392, 0.6),
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
