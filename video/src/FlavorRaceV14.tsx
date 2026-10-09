import React from "react";
import { EpicTitle } from "./epic";
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { EndCard, Flash, Super, loadFonts } from "./FlavorRaceV12_2";

/* THE FLAVOR RACE · Version 14, cut from the clips generated on 6 October 2026 (the four chapters, the montages, the
   side-profile races and the inserts), telling the story the chapters lay out:
   I the surprise: backlit macro photography of what looks like an ordinary bottle (the hull against the light, the
   ribbed orange cap, the wordmark), a second bottle in amber, then two enormous silhouettes on a pad, held, and the
   stadium lights: THERABREATH VS. COMPETITOR · II launch: the count drives the cuts (three on the pad, two on the
   igniter spark, one in the nozzle), the bloom, the pad erupts, both rockets leave together, the long lens, into the
   cloud, above it at sunrise, a look back down, Earth through the glass, and silence at the edge of space · III the
   race, cut on the score's half-bars: neck and neck over Earth, the caps in the heat, the labels, the engines, both in
   front of the Moon, until TheraBreath gains a small, believable lead · IV discovery: TheraBreath flies into a field
   of refracted flavor; its sensors light, the field beads on the hull; at The Flavor Factory a colorless sample
   answers under the analyzer, it is sealed and transmitted, the signal reaches the hull, flows through the intake to
   the engines, and they reignite on the score's return · V the rival's warning light and smoke, TheraBreath streaks
   to the Moon · VI the Moon: the descent, the footpad (the Flavor has landed), the arm puts the flag out, the wide,
   it lifts off for home, and the rival lands too late · VII home: into the sunlight, down through the clouds, the
   rooftop at Church & Dwight headquarters, a gloved hand sets the sixth sample beside five, black, TASTE THE FUTURE.
   No faces. Every hero shot is the locked bottle: white, short ribbed orange cap. The rival is only ever COMPETITOR.
   Generated text never reads: it is pushed under the letterbox (a truck's lettering on the pad wides, the misspelled
   line under the wordmark in the label close-up, a mangled name on the transmitter) or softened in place (the
   beaker's print, that line where the wordmark is large, the transmitter's badge, a hatch sticker, the product
   bottle's small print and seal in the last lab shot), and the hatch shot ends before the flag opens.
   The timeline is a list of segments played back to back; a segment with x dissolves in over the one before. */
const FPS = 30;
const f = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// a softened region (the layer's own pixels, so it moves with the push-in): an elliptical, feathered blur over part
// of the frame, full strength inside 60% of its radii
type Blur = { x: number; y: number; w: number; h: number; px: number };
type Seg =
  | { id: string; dur: number; kind: "clip"; clip: string; from: number; zoom?: [number, number]; origin?: string; ty?: number; shake?: number; rate?: number; x?: number; grade?: string; blur?: Blur[] }
  | { id: string; dur: number; kind: "black" }
  | { id: string; dur: number; kind: "end" };

// the V12 Moon shots are warmer than the new ones: cool and desaturate them toward the grey regolith
const MOONGRADE = "saturate(0.55) contrast(1.06) brightness(1.03)";

const SEGS: Seg[] = [
  // I. THE SURPRISE. A beauty shoot for a bottle, lit from behind: the hull, the ribbed cap, the wordmark, a second
  // bottle in amber. Nothing that says rocket. Then the two silhouettes on the pad, held, and the lights.
  { id: "black0", dur: 1.0, kind: "black" },
  { id: "hull", dur: 2.8, kind: "clip", clip: "v14/39cc720b", from: 1.0, zoom: [1.0, 1.03] },                    // a dark hull against the light; the cap rises into frame
  { id: "cap", dur: 2.4, kind: "clip", clip: "v14/d9bc7723", from: 1.2, zoom: [1.0, 1.03] },                      // the ribbed orange cap
  { id: "label", dur: 1.45, kind: "clip", clip: "v14/d9bc7723", from: 6.2, zoom: [1.0, 1.02] },                   // the wordmark (it ends before the small print)
  { id: "rivalbody", dur: 3.0, kind: "clip", clip: "v14/39cc720b", from: 5.5, zoom: [1.0, 1.03] },               // an amber bottle, a dark cap
  { id: "lights", dur: 7.6, kind: "clip", clip: "v14/39cc720b", from: 10.2, zoom: [1.0, 1.04] },                  // two silhouettes, held; the lights come on at +4.59
  { id: "standoff", dur: 3.4, kind: "clip", clip: "v14/ca51b3b2", from: 5.4, zoom: [1.28, 1.31], origin: "50% 0%", ty: 118 },  // THERABREATH VS. COMPETITOR
  { id: "partners", dur: 2.85, kind: "black" },
  // II. LAUNCH. The count drives the cuts: three on the pad, two on the igniter spark, one in the nozzle; the bloom;
  // the pad erupts; both leave together; the long lens; into the cloud; above it at sunrise; the look back down;
  // Earth through the glass; the edge of space in silence.
  { id: "padcold", dur: 1.45, kind: "clip", clip: "v14/43cc78c6", from: 0.3, zoom: [1.28, 1.3], origin: "50% 0%", ty: 118 },
  { id: "ignite", dur: 1.0, kind: "clip", clip: "v14/3c07fc0f", from: 1.0, zoom: [1.0, 1.03] },                  // the igniter sparks (+0.25)
  { id: "nozzle", dur: 1.75, kind: "clip", clip: "v14/ca51b3b2", from: 2.5, zoom: [1.0, 1.06] },                  // inside the nozzle: it stutters (+0.33 to +0.75), then blooms (+1.4)
  { id: "erupt", dur: 2.2, kind: "clip", clip: "v14/ca51b3b2", from: 10.45, shake: 0.0 },                          // fire through the launch structure
  { id: "liftoff", dur: 1.9, kind: "clip", clip: "v14/a6c30478", from: 13.9, shake: 0.05 },                        // both rockets leave the pad together
  { id: "longlens", dur: 2.0, kind: "clip", clip: "v14/a6c30478", from: 16.0, zoom: [1.0, 1.04] },                 // miles away: a thread of fire rising
  { id: "climb", dur: 3.7, kind: "clip", clip: "v14/63efe8cb", from: 10.3 },                                       // both climb; the cloud swallows them
  { id: "dawn", dur: 1.9, kind: "clip", clip: "v14/087e5b6f", from: 3.92 },                                        // above the cloud at sunrise
  { id: "lookback", dur: 2.0, kind: "clip", clip: "v14/ca51b3b2", from: 18.0 },                                    // the launch site far below
  { id: "porthole", dur: 1.6, kind: "clip", clip: "v14/ca51b3b2", from: 20.35 },                                   // Earth's curve through the glass
  { id: "pitch", dur: 2.2, kind: "clip", clip: "v14/39797967", from: 7.0 },                                        // the edge of space: silence
  // III. THE RACE. Cut on the score's half-bars (0.75 s): neck and neck, the caps in the heat, the labels, the
  // engines, both in front of the Moon, and TheraBreath gains a small, believable lead.
  { id: "side", dur: 2.25, kind: "clip", clip: "v14/61fed641", from: 14.4 },                                       // neck and neck over Earth, the Moon ahead
  { id: "capheat", dur: 1.5, kind: "clip", clip: "v14/61fed641", from: 3.3, zoom: [1.0, 1.05] },                  // the orange cap in the heat
  { id: "rivalcap", dur: 1.5, kind: "clip", clip: "v14/61fed641", from: 5.7, zoom: [1.0, 1.05] },                 // the rival's dark cap
  { id: "neck", dur: 2.25, kind: "clip", clip: "v14/907e43a4", from: 12.0 },                                       // side by side, close
  { id: "engines", dur: 1.5, kind: "clip", clip: "v14/61fed641", from: 8.1 },                                      // TheraBreath's engine cluster
  { id: "amberfire", dur: 1.5, kind: "clip", clip: "v14/087e5b6f", from: 23.85 },                                  // the rival's engines
  { id: "tblabel", dur: 1.5, kind: "clip", clip: "v14/087e5b6f", from: 16.05, zoom: [1.13, 1.16], origin: "50% 0%", ty: 118 },  // the misspelled line under the wordmark sits under the letterbox
  { id: "rivallabel", dur: 1.5, kind: "clip", clip: "v14/087e5b6f", from: 18.05 },
  { id: "moonpair", dur: 2.25, kind: "clip", clip: "v14/61fed641", from: 20.2 },                                   // both in front of the Moon
  { id: "ahead", dur: 6.0, kind: "clip", clip: "v14/95526c0c", from: 11.0, rate: 1.5 },                            // TheraBreath gains a small lead; the rival falls back
  // IV. DISCOVERY. Into a field of refracted flavor; the sensors light; it beads on the hull. At The Flavor Factory a
  // colorless sample answers under the analyzer; it is sealed and transmitted; the signal reaches the hull, flows
  // through the intake to the engines, and they reignite on the score's return.
  { id: "field", dur: 6.0, kind: "clip", clip: "v14/95526c0c", from: 24.0 },                                       // into the field
  { id: "prisms", dur: 4.0, kind: "clip", clip: "v14/98d9a7c7", from: 1.6 },                                       // among the prisms; the sensors glow (+2.4)
  { id: "droplets", dur: 3.5, kind: "clip", clip: "v14/67c7fe12", from: 0.8,                                       // the field beads on the hull
    blur: [{ x: 690, y: 655, w: 230, h: 150, px: 6 }, { x: 880, y: 590, w: 400, h: 170, px: 6 }, { x: 1110, y: 595, w: 370, h: 175, px: 6 }, { x: 1290, y: 625, w: 220, h: 150, px: 6 }] },
  { id: "lab", dur: 3.5, kind: "clip", clip: "v14/67c7fe12", from: 11.3,                                           // The Flavor Factory: a gloved hand, a pipette, the analyzer
    blur: [{ x: 907, y: 528, w: 210, h: 300, px: 7 }, { x: 1127, y: 638, w: 130, h: 726, px: 7 }] },                // the beaker's print
  { id: "analysis", dur: 3.5, kind: "clip", clip: "v14/7d6339bf", from: 13.0 },                                    // the sample answers: the field on the monitor
  { id: "seal", dur: 2.3, kind: "clip", clip: "v14/67c7fe12", from: 18.2 },                                        // the vial goes into the transmitter
  { id: "transmit", dur: 2.2, kind: "clip", clip: "v14/7d6339bf", from: 23.3, zoom: [1.07, 1.09], origin: "50% 0%", ty: 118,  // the pulse (+0.5)
    blur: [{ x: 1480, y: 458, w: 230, h: 64, px: 6 }] },                                                            // the badge; the name on the front sits under the letterbox
  { id: "receive", dur: 2.3, kind: "clip", clip: "v14/67c7fe12", from: 23.4,                                       // the signal reaches the hull
    blur: [{ x: 220, y: 330, w: 240, h: 540, px: 11 }, { x: 315, y: 745, w: 170, h: 760, px: 11 }] },
  { id: "intake", dur: 2.6, kind: "clip", clip: "v14/98d9a7c7", from: 8.0 },                                       // through the intake to the engines
  { id: "reignite", dur: 1.5, kind: "clip", clip: "v14/67c7fe12", from: 26.05 },                                   // they reignite (+0.75): the score's return
  // V. THE RACE IS WON. TheraBreath turns for the Moon; the rival's warning light comes on and it smokes; TheraBreath
  // streaks away alone.
  { id: "tothemoon", dur: 2.25, kind: "clip", clip: "v14/7d6339bf", from: 26.8 },
  { id: "rivalred", dur: 2.25, kind: "clip", clip: "v14/58cfbf13", from: 11.3 },                                   // the rival's warning light, a trail of smoke
  { id: "rivalsmoke", dur: 1.5, kind: "clip", clip: "v14/58cfbf13", from: 18.7 },
  { id: "streak", dur: 2.3, kind: "clip", clip: "v14/58cfbf13", from: 23.0 },                                      // TheraBreath alone, the Moon ahead
  { id: "moonbound", dur: 2.2, kind: "clip", clip: "v14/087e5b6f", from: 27.8 },
  // VI. THE MOON. The descent in silence, the footpad, the flag, the wide; it lifts off for home, and only then does
  // the rival land.
  { id: "approach", dur: 3.0, kind: "clip", clip: "v14/82a87d95", from: 0.5 },
  { id: "descent", dur: 3.0, kind: "clip", clip: "v14/82a87d95", from: 8.0 },
  { id: "foot", dur: 2.2, kind: "clip", clip: "v14/82a87d95", from: 12.2 },                                        // the footpad touches down (+0.6)
  { id: "hatch", dur: 1.0, kind: "clip", clip: "v14/98d9a7c7", from: 22.25, blur: [{ x: 1108, y: 712, w: 160, h: 76, px: 6 }] },  // the arm raises the pole (it ends as the cloth appears)
  { id: "moonwide", dur: 3.6, kind: "clip", clip: "v12/g13_moonlift", from: 0.0, rate: 0.2625, zoom: [1.0, 1.02], ty: 105, grade: MOONGRADE },  // the flag, Earth behind: held
  { id: "moonlift", dur: 2.9, kind: "clip", clip: "v12/g13_moonlift", from: 0.95, zoom: [1.02, 1.035], ty: 105, grade: MOONGRADE },          // it lifts away
  { id: "gag", dur: 2.7, kind: "clip", clip: "v12/g9_late", from: 0.7, grade: MOONGRADE },                          // the rival finally lands (+1.7)
  // VII. HOME. Into the sunlight, down through the clouds, the rooftop at Church & Dwight headquarters, the sixth
  // sample, silence, black, the line.
  { id: "sunlight", dur: 2.6, kind: "clip", clip: "v14/8fed7431", from: 0.2,                                       // out of the Moon's shadow into the sun
    blur: [{ x: 795, y: 700, w: 430, h: 200, px: 6 }, { x: 1050, y: 732, w: 430, h: 210, px: 6 }] },
  { id: "clouds", dur: 2.4, kind: "clip", clip: "v14/8fed7431", from: 6.4 },
  { id: "hq", dur: 2.4, kind: "clip", clip: "v14/8fed7431", from: 9.4 },                                           // the rooftop pad
  { id: "touch", dur: 3.2, kind: "clip", clip: "v14/8fed7431", from: 12.3 },                                       // touchdown (+1.3)
  { id: "samples", dur: 4.4, kind: "clip", clip: "v14/8fed7431", from: 17.2, zoom: [1.0, 1.03],
    blur: [{ x: 1410, y: 540, w: 420, h: 820, px: 8 }, { x: 1405, y: 790, w: 416, h: 150, px: 14 }] },             // the sixth sample; the bottle's print and seal stay soft
  { id: "rack", dur: 1.4, kind: "clip", clip: "v14/8fed7431", from: 22.3 },                                        // six samples, in focus
  { id: "hush", dur: 1.0, kind: "black" },
  { id: "end", dur: 6.0, kind: "end" },
  { id: "black1", dur: 1.5, kind: "black" },
];

// Start time of every segment
const AT: Record<string, number> = {};
let acc = 0;
for (const sg of SEGS) { AT[sg.id] = acc; acc += sg.dur; }
export const RACE14_FRAMES = f(acc);
const t = (id: string, off = 0) => AT[id] + off;

/* ---------- picture ---------- */
const ClipLayer: React.FC<{ sg: Extract<Seg, { kind: "clip" }> }> = ({ sg }) => {
  const fr = useCurrentFrame();
  const dur = f(sg.dur + (sg.x || 0));
  const fade = sg.x ? interpolate(fr, [0, f(sg.x)], [0, 1], clamp) : 1;
  const [z0, z1] = sg.zoom || [1.0, 1.035];
  const z = interpolate(fr, [0, dur], [z0, z1]);
  let dx = 0, dy = 0;
  if (sg.shake !== undefined) {
    const k = fr - f(sg.shake + (sg.x || 0));
    const amp = k < 0 ? 0 : 16 * Math.exp(-k / 26);
    dx = Math.sin(k * 2.3) * amp; dy = Math.cos(k * 3.1) * amp;
  }
  const video = (
    <OffthreadVideo src={staticFile(`race/clips/${sg.clip}.mp4`)} muted startFrom={f(sg.from - (sg.x || 0))} playbackRate={sg.rate || 1} style={{ width: 1920, height: 1080, objectFit: "cover" }} />
  );
  // one blurred copy per strength, seen through the union of its regions (mask layers add)
  const ell = (b: Blur) => `radial-gradient(ellipse ${b.w / 2}px ${b.h / 2}px at ${b.x}px ${b.y}px, #000 60%, transparent 100%)`;
  const blurs = sg.blur || [];
  const strengths = blurs.map((b) => b.px).filter((px, i, a) => a.indexOf(px) === i);
  return (
    <AbsoluteFill style={{ opacity: fade, transform: `translate(${dx}px, ${dy + (sg.ty || 0)}px) scale(${z})`, transformOrigin: sg.origin || "50% 50%", filter: sg.grade }}>
      {video}
      {strengths.map((px) => {
        const mask = blurs.filter((b) => b.px === px).map(ell).join(", ");
        return <AbsoluteFill key={px} style={{ filter: `blur(${px}px)`, WebkitMaskImage: mask, maskImage: mask }}>{video}</AbsoluteFill>;
      })}
    </AbsoluteFill>
  );
};

// A super over a soft shadow of its own, so it reads on the bright lab bench and the sunlit rooftop
export const Super14: React.FC<{ dur: number; a: string; b: string }> = ({ dur, a, b }) => {
  const fr = useCurrentFrame();
  const o = interpolate(fr, [0, 10, dur - 10, dur], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: o, background: "radial-gradient(ellipse 760px 220px at 420px 885px, rgba(0,0,0,.8), rgba(0,0,0,0) 100%)" }} />
      <Super dur={dur} a={a} b={b} />
    </AbsoluteFill>
  );
};

// Film grain + letterbox for a theatrical frame
const Grain: React.FC = () => {
  const fr = useCurrentFrame();
  const seed = fr % 7;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1920" height="1080" style={{ position: "absolute", opacity: 0.07, mixBlendMode: "overlay" }}>
        <filter id={`g${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} /></filter>
        <rect width="1920" height="1080" filter={`url(#g${seed})`} />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.38) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 118, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 118, background: "#000" }} />
    </AbsoluteFill>
  );
};

/* ---------- sound ---------- */
type Cue = { f: string; at: number; v: number; from?: number; len?: number; fadeIn?: number; fadeOut?: number };
// Two lines: the count (it drives the cuts: three on the pad, two on the igniter spark, one in the nozzle) and the landing.
const VO: Cue[] = [
  { f: "v4_n_count", at: t("padcold", 0.5), v: 1 },
  { f: "v4_t_landed", at: t("foot", 0.7), v: 1 },
];
const LEN: Record<string, number> = { v4_n_count: 2.69, v4_t_landed: 3.97 };

// Effects are designed and rendered outside Remotion (video/sound, cues14.py) and mixed with these stems
const SFX: Cue[] = [];

// The V12 score (ElevenLabs), placed in four sections, each on the score's own clock (film = file + S), so nothing
// is time-stretched:
// 1. its dark opening drone wakes under the silhouettes, swells as the lights come on and carries the title and the
//    partners card; it stops on the cut to the pad, so the count, the spark and the bloom play in silence;
// 2. one unbroken run from the eruption to the Moon: the lift-off swell (36.0 s) peaks as both rockets clear the pad,
//    the race cuts sit on its half-bars from 51.0 s, its quiet glass section (from about 73 s) opens as TheraBreath
//    flies into the flavor field, its rise lands the return (103.4 s) as the engines reignite, and its drive carries
//    TheraBreath to the Moon; the edge of space and the descent are carved out in the mix;
// 3. it comes back rising on the flag wide, so its last accent (127.3 s) lands on the rival's late landing, warms for
//    home and fades under the sixth sample;
// 4. the final gesture (150.0 s) lands on TASTE THE FUTURE and its decay carries the card to black.
// The silences are carved in the mix: sound/events14.py, MUSIC_CUTS.
export const LIGHTS14 = t("lights", 4.59);     // the stadium lights come on
export const REIGNITE14 = t("reignite", 0.75);  // the engines reignite
const S1 = LIGHTS14 - 3.0, S2 = t("liftoff", 0.3) - 36.0, S3 = t("gag", 1.7) - 127.3, S4 = t("end", 0.35) - 150.0;
const sec = (at: number, until: number, S: number, fadeIn: number, fadeOut: number): Cue =>
  ({ f: "v12_flavor_score", at, from: at - S, v: 0.95, len: until - at, fadeIn, fadeOut });
const MUSIC: Cue[] = [
  sec(S1, t("padcold", 0.3), S1, 0.1, 0.3),
  sec(t("erupt", 0.15), t("approach", 1.4), S2, 0.25, 1.2),
  sec(t("moonwide", -0.1), t("samples", 3.0), S3, 2.2, 1.6),
  sec(t("end", 0.25), t("black1", 1.3), S4, 0.08, 1.2),
];

// Music dips gently under the lines; long ramps so the dip is felt, not heard
const DUCK = 0.8;
const duckAt = (g: number) => {
  let k = 1;
  for (const c of VO) {
    const a = c.at - 0.3, b = c.at + Math.min(c.len ?? 99, LEN[c.f] ?? 2) + 0.3;
    const r = 0.6;
    const w = g < a - r || g > b + r ? 0 : g < a ? (g - (a - r)) / r : g > b ? 1 - (g - b) / r : 1;
    k = Math.min(k, 1 - (1 - DUCK) * w);
  }
  return k;
};

// Master trim; the final mix also passes through a peak limiter after render
const GAIN = 0.62;

const CueAudio: React.FC<{ c: Cue; duck?: boolean }> = ({ c, duck }) => {
  const len = c.len ?? LEN[c.f] ?? 30;
  return (
    <Sequence from={f(c.at)} durationInFrames={Math.max(1, f(len + (c.len ? 0 : 0.4)))} layout="none">
      <Audio
        src={staticFile(`race/audio/${c.f}.mp3`)}
        startFrom={f(c.from || 0)}
        volume={(fr) => {
          const s = fr / FPS;
          let v = c.v * GAIN;
          if (c.fadeIn) v *= Math.min(1, s / c.fadeIn);
          if (c.fadeOut) v *= Math.min(1, Math.max(0, (len - s) / c.fadeOut));
          if (duck) v *= duckAt(c.at + s);
          return v;
        }}
      />
    </Sequence>
  );
};

export const FlavorRaceV14: React.FC<{ stem?: string }> = ({ stem = "all" }) => {
  loadFonts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SEGS.map((sg) => {
        const x = sg.kind === "clip" ? sg.x || 0 : 0;
        return (
          <Sequence key={sg.id} from={f(AT[sg.id] - x)} durationInFrames={f(sg.dur + x)} layout="none">
            {sg.kind === "clip" && <ClipLayer sg={sg} />}
            {sg.kind === "end" && <EndCard dur={f(sg.dur)} />}
          </Sequence>
        );
      })}

      <Sequence from={f(LIGHTS14)} durationInFrames={9} layout="none"><Flash k={0.35} /></Sequence>
      <Sequence from={f(t("erupt"))} durationInFrames={9} layout="none"><Flash /></Sequence>
      <Sequence from={f(REIGNITE14)} durationInFrames={10} layout="none"><Flash warm /></Sequence>

      <Sequence from={f(t("standoff", 0.1))} durationInFrames={f(3.0)} layout="none"><EpicTitle lines={["THE FLAVOR RACE"]} dur={f(3.0)} size={230} over hold /></Sequence>
      <Sequence from={f(t("partners"))} durationInFrames={f(2.85)} layout="none"><EpicTitle lines={["THERABREATH + THE FLAVOR FACTORY", "ONE MISSION: WHAT'S NEXT."]} dur={f(2.85)} size={104} /></Sequence>
      <Sequence from={f(t("lab", 0.1))} durationInFrames={f(3.2)} layout="none"><Super14 dur={f(3.2)} a="THE FLAVOR FACTORY" b="NORCO, CALIFORNIA · FLAVOR LAB" /></Sequence>
      <Sequence from={f(t("hq", 0.2))} durationInFrames={f(3.0)} layout="none"><Super14 dur={f(3.0)} a="EWING, NEW JERSEY" b="CHURCH & DWIGHT HEADQUARTERS" /></Sequence>

      <Grain />

      {(stem === "all" || stem === "music") && MUSIC.map((c, i) => <CueAudio key={`m${i}`} c={c} duck />)}
      {(stem === "all" || stem === "sfx") && SFX.map((c, i) => <CueAudio key={`x${i}`} c={c} />)}
      {(stem === "all" || stem === "vo") && VO.map((c, i) => <CueAudio key={`v${i}`} c={c} />)}
    </AbsoluteFill>
  );
};
