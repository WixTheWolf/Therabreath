import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Flash, loadFonts } from "./FlavorRaceV12_2";
import { EndCard15, Super15 } from "./FlavorRaceV15";
import SIGN_MC1 from "../public/race/v15/sign_track_mc1.json";
import JACKET_MC1 from "../public/race/v15/jacket_track_mc1.json";
import LABEL_HULL from "../public/race/v15/label_track_hull.json";
import CD_SEAL from "../public/race/v15/cd_seal_track.json";

/* THE FLAVOR RACE · Version 16: the full-length film, re-cut from V15.1 (the director's final cut with the 21 October
   polish) for flow, fun and sync. What changed, and why:
   - One idea, told cleanly: the rival runs on power, TheraBreath wins on flavor. Every shot that did not serve it is
     gone: the two 1960s control rooms (the film has one Mission Control, The Flavor Factory), the soft review proxy of
     TheraBreath passing, nine seconds of ferns, sage and a flagpole on the way to Church & Dwight, the fruit-in-orbit
     shots that showed the blind flight's own ingredients, the lime beside a ginger root, the chamomile.
   - The giant generated lettering is out. EVERY CATEGORY HAS A RACE is set in the film's own type (the end card's
     condensed metal) over the same shot before its baked-in text appears. FOLLOW? OR LEAD? is gone altogether: the
     two rockets at full thrust carry that beat on their own. SEARCHING, FLAVOR TRANSFER READY and THERABREATH ONE
     stay: they are things in the scene.
   - New beats: both rockets silhouetted against the full Moon (the finish line, seen before the race), the real
     overtake (TheraBreath passes the rival), Mission Control erupting as it takes the lead, light through the vial in
     the lab, the orange drop with its splash (the plink lands on the splash, not on a cucumber).
   - Every cut is at 24 fps on whole frames; durations are n/24 to three or four decimals so the sound engine's parse
     (sound/timeline.py) lands on the same frames as the render.
   - Picture events are measured per frame off the source clips (see sound/cues16.py) so every effect sits on its
     frame: the pipette drop lands at +1.20 (V15 played it at +0.90), the melon bursts at +0.15, the coconut pops on
     the cut and splashes at +0.40, the button goes at +0.60, the relight at +0.27.
   No faces. Every hero shot is the locked bottle: white, short ribbed orange cap. The rival is only ever COMPETITOR.
   Real logos unaltered (the wall sign and the jacket carry the real Flavor Factory logo, the monument the real Church
   & Dwight seal, all tracked). The Moon is one grey regolith (the graded clips from the V15 polish). */
const FPS = 24;
const f = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SANS = '"Geist", "Helvetica Neue", Arial, sans-serif';
const MONUMENT = '"Archivo", "Arial Narrow", sans-serif';
const IVORY = "#F4EDE0";
const METAL = "linear-gradient(180deg, #FFFFFF 0%, #F7EEDD 34%, #C9A46A 50%, #FFF4DE 62%, #A7834F 100%)";

type Track = { fps: number; from: number; frames: number[][] };
type Patch = { img: string; track: Track; sw?: number };
type Soften = { track: Track; sw: number; sh: number; px: number; rx: number; ry: number; spots: [number, number][] };
type Seg =
  | { id: string; dur: number; kind: "clip"; clip: string; from: number; zoom?: [number, number]; origin?: string; flip?: boolean; rate?: number; grade?: string; patches?: Patch[]; soften?: Soften }
  | { id: string; dur: number; kind: "black" }
  | { id: string; dur: number; kind: "end" };

const SEGS: Seg[] = [
  // I. THE SURPRISE
  { id: "black0", dur: 0.5, kind: "black" },
  { id: "macro1", dur: 4.0, kind: "clip", clip: "v15/f864fd4b", from: 0.0, zoom: [1.3, 1.34] },                // condensation on a white bottle
  { id: "macro2", dur: 1.25, kind: "clip", clip: "k/n28_flag", from: 2.855 },                                   // droplets, the orange stripe
  { id: "every", dur: 1.75, kind: "clip", clip: "v15/b92b53de", from: 0.0, zoom: [1.0, 1.03] },                // the cap in steam; the title is set over it
  { id: "titlehold", dur: 1.5, kind: "black" },                                                                  // EVERY CATEGORY HAS A RACE holds on black
  { id: "lights", dur: 6.0, kind: "clip", clip: "v11/cc51b641", from: 0.667, zoom: [1.0, 1.02] },               // two silhouettes; the lights come on
  { id: "padmoon", dur: 2.5, kind: "clip", clip: "m/n01_padmoon", from: 1.0, zoom: [1.0, 1.03] },               // both against the full Moon: the finish line
  { id: "rival", dur: 1.125, kind: "clip", clip: "h/c01_comp_close", from: 1.753 },
  { id: "herocap", dur: 0.4167, kind: "clip", clip: "v11/58785409", from: 1.817, zoom: [1.35, 1.36] },
  { id: "mc1", dur: 2.625, kind: "clip", clip: "h/mc_ff", from: 0.333, zoom: [1.0, 1.0], patches: [{ img: "sign_patch_mc", track: SIGN_MC1 }, { img: "jacket_patch_mc", track: JACKET_MC1 }] },
  { id: "cap", dur: 4.875, kind: "clip", clip: "v11/58785409", from: 5.15, zoom: [1.3, 1.36] },                 // the cap in the cold: "three"
  { id: "umbilical", dur: 0.625, kind: "clip", clip: "h/c14_umbilical", from: 1.905 },                          // "two"
  { id: "button", dur: 0.75, kind: "clip", clip: "v15/n02_button_fix", from: 0.042 },                           // "one"
  { id: "nozzle", dur: 2.25, kind: "clip", clip: "k/n18_nozzle", from: 0.875, zoom: [1.0, 1.06] },              // spark, catch, bloom: WHUMP
  // II. LAUNCH
  { id: "ignite", dur: 1.625, kind: "clip", clip: "v15/30f44324", from: 0.87 },                                 // both pads erupt
  { id: "crowd", dur: 1.3333, kind: "clip", clip: "v15/30f44324", from: 5.955 },                                // the fans shield their eyes
  { id: "erupt", dur: 0.7917, kind: "clip", clip: "v14/ca51b3b2", from: 15.083, zoom: [1.3, 1.31] },
  { id: "liftoff", dur: 2.0417, kind: "clip", clip: "v14/ca51b3b2", from: 15.895, zoom: [1.3, 1.32] },          // both rockets clear the pad
  { id: "track", dur: 3.0, kind: "clip", clip: "v12/g1_track", from: 0.25 },
  { id: "onboard", dur: 1.2917, kind: "clip", clip: "v12/g2_onboard", from: 0.25 },
  { id: "hull", dur: 3.2083, kind: "clip", clip: "v14/8fed7431", from: 1.278, zoom: [1.3, 1.33],
    soften: { track: LABEL_HULL, sw: 1280, sh: 720, px: 8, rx: 55, ry: 38,
      spots: [[465, 436], [490, 440], [570, 450], [610, 458], [650, 465], [700, 490], [735, 520], [555, 470], [665, 500]] } },
  { id: "pitch", dur: 1.7917, kind: "clip", clip: "v12/g10_pitch", from: 2.213 },                               // the edge of space: silence
  // III. THE RACE
  { id: "side", dur: 1.2083, kind: "clip", clip: "v15/5d17c937", from: 1.913, zoom: [1.3, 1.31] },
  { id: "chase", dur: 2.75, kind: "clip", clip: "v11/bd357d2b", from: 7.263 },                                  // the rival slides in close: "Nice bottle."
  { id: "neck", dur: 2.5, kind: "clip", clip: "v12/g11_neck", from: 0.25 },
  { id: "px26", dur: 2.2083, kind: "clip", clip: "v15/px26", from: 0.0, zoom: [1.0, 1.0] },                     // both from below, the labels fly past
  { id: "rivaleng", dur: 1.25, kind: "clip", clip: "v15/5d17c937", from: 11.86, zoom: [1.3, 1.31] },            // the competitor commits
  { id: "rivalaway", dur: 2.2083, kind: "clip", clip: "v15/5d17c937", from: 13.11, zoom: [1.3, 1.33] },         // and pulls away
  { id: "pullaway", dur: 2.0, kind: "clip", clip: "v11/m1_pullaway", from: 1.9, zoom: [1.0, 1.03] },            // from TheraBreath's shoulder: the rival is a dot by the Moon
  { id: "warnlight", dur: 2.1667, kind: "clip", clip: "v15/px31", from: 1.708, zoom: [1.0, 1.0] },              // TheraBreath's warning light
  { id: "cutoff", dur: 2.3333, kind: "clip", clip: "h/c04_burner_cut", from: 1.683 },                           // the engines go quiet
  // IV. DISCOVERY
  { id: "search", dur: 1.875, kind: "clip", clip: "v15/5f1977e8", from: 0.0 },                                  // The Flavor Factory: SEARCHING
  { id: "mc2", dur: 1.1667, kind: "clip", clip: "h/mc_ff", from: 5.295, zoom: [1.13, 1.15], origin: "50% 100%" },
  // the montage on the score's beats (three, three, three, three, two, two, eight at 152 BPM), one sound per cut, each on its frame
  { id: "tea", dur: 1.1667, kind: "clip", clip: "v15/77d3caa6", from: 1.0, zoom: [1.05, 1.1] },
  { id: "cuketea", dur: 1.2083, kind: "clip", clip: "v15/62ef0a17", from: 2.6, zoom: [1.25, 1.3] },
  { id: "coconut", dur: 1.1667, kind: "clip", clip: "v15/a2c83349", from: 2.55 },                               // pops on the cut, splashes at +0.40
  { id: "melon", dur: 1.2083, kind: "clip", clip: "v15/15190f35", from: 1.55 },                                 // bursts at +0.15
  { id: "drop", dur: 0.7917, kind: "clip", clip: "v15/7e9b6135", from: 0.1, zoom: [1.0, 1.04] },                // one drop lands on the orange at +0.40
  { id: "mint", dur: 0.7917, kind: "clip", clip: "v15/1d8d16ab", from: 2.8 },
  { id: "yuzu", dur: 3.1667, kind: "clip", clip: "k/n08_yuzu", from: 2.4, zoom: [1.2, 1.28] },                  // the one
  { id: "pipette", dur: 1.9167, kind: "clip", clip: "h/c06_lab_drop", from: 0.6 },                              // the drop lands at +1.20
  { id: "prism", dur: 1.2917, kind: "clip", clip: "h/c07_lab_prism", from: 1.9, zoom: [1.1, 1.14] },            // light through the vial
  { id: "glove", dur: 1.5, kind: "clip", clip: "h/c09_lab_cell", from: 0.4 },                                   // the vial locks at +0.95
  { id: "transferbtn", dur: 1.5, kind: "clip", clip: "v15/7e9b6135", from: 12.292 },                            // FLAVOR TRANSFER READY: the press at +0.60
  { id: "orbit", dur: 1.2083, kind: "clip", clip: "v11/22da0f7a", from: 4.5, zoom: [1.1, 1.14] },               // the signal crosses the night side
  { id: "transfer", dur: 3.0, kind: "clip", clip: "v12/g12_transfer", from: 0.675 },
  { id: "life", dur: 1.9167, kind: "clip", clip: "v15/g5_life_fix", from: 0.0 },                                // TheraBreath comes alive
  { id: "relight", dur: 1.0, kind: "clip", clip: "v15/7e9b6135", from: 15.9, zoom: [1.3, 1.31] },               // dark bells; the relight at +0.27: the score's return
  { id: "follow", dur: 3.2917, kind: "clip", clip: "v15/5d17c937", from: 2.0, zoom: [1.3, 1.34] },              // both at full thrust over Earth, clean, no lettering
  { id: "pass", dur: 2.4167, kind: "clip", clip: "v12/g6_pass", from: 0.4 },                                    // TheraBreath passes the rival
  { id: "mcerupts", dur: 1.5, kind: "clip", clip: "v122/v122_mc_erupts", from: 0.9, zoom: [1.0, 1.03] },        // Mission Control erupts
  { id: "overtake", dur: 1.4167, kind: "clip", clip: "v15/7e9b6135", from: 20.2, zoom: [1.3, 1.32] },           // and streaks for the Moon
  // V. THE MOON
  { id: "descent", dur: 4.4167, kind: "clip", clip: "v11/617c18bf", from: 0.3 },
  { id: "dust", dur: 1.375, kind: "clip", clip: "k/n14_dust", from: 0.25 },
  { id: "foot", dur: 1.9167, kind: "clip", clip: "k/n14_dust", from: 1.995 },                                   // touchdown at +0.55: the Flavor has landed
  { id: "stand", dur: 2.2917, kind: "clip", clip: "v15/moon_stand_grey", from: 0.0 },
  { id: "pole", dur: 1.1667, kind: "clip", clip: "k/n28_flag", from: 8.837 },                                   // the pole enters the regolith at +0.55
  { id: "flagwide", dur: 3.2083, kind: "clip", clip: "v15/c7_flag_grey", from: 1.5, zoom: [1.0, 1.03] },        // and only then the flag
  { id: "earthrise", dur: 3.9167, kind: "clip", clip: "v15/fbfbe7c8", from: 2.9, zoom: [1.15, 1.18] },
  // VI. HOME
  { id: "monitors", dur: 1.2917, kind: "clip", clip: "v15/n02_monitors_fix", from: 0.0 },                       // THERABREATH ONE
  { id: "moonlaunch", dur: 1.875, kind: "clip", clip: "v15/7f36146f", from: 0.0 },                              // lift-off for home at +0.20
  { id: "homeward", dur: 2.0, kind: "clip", clip: "h/c11_homeward", from: 0.25 },
  { id: "reentry", dur: 1.75, kind: "clip", clip: "v15/1bba799d", from: 0.717 },
  { id: "plasma", dur: 0.5833, kind: "clip", clip: "v15/e9498b9a", from: 0.333, zoom: [1.5, 1.55] },
  { id: "clouds", dur: 2.7917, kind: "clip", clip: "v11/47b35301", from: 0.33 },
  { id: "nj", dur: 2.0833, kind: "clip", clip: "v11/47b35301", from: 3.945 },
  { id: "cdsign", dur: 1.9583, kind: "clip", clip: "v15/5b518a71", from: 0.0, patches: [{ img: "cd_seal_patch", track: CD_SEAL, sw: 1912 }] },   // Church & Dwight, Ewing, New Jersey
  { id: "cdsky", dur: 2.0, kind: "clip", clip: "v15/5b518a71", from: 4.953 },
  { id: "hqland", dur: 5.7917, kind: "clip", clip: "s11_hq", from: 3.383 },                                     // touchdown on the lawn at +3.10
  { id: "robot", dur: 5.0, kind: "clip", clip: "v12/g7_robot", from: 0.0 },                                     // six samples
  { id: "tasting", dur: 4.0, kind: "clip", clip: "v13/t1_tasting", from: 0.0 },
  { id: "hush", dur: 0.75, kind: "black" },
  { id: "end", dur: 5.0, kind: "end" },
  { id: "black1", dur: 0.75, kind: "black" },
  // VII. THE STINGER
  { id: "stgflag", dur: 1.875, kind: "clip", clip: "v15/g9_late_grey", from: 0.0, zoom: [1.5, 1.52], origin: "75% 75%" },
  { id: "stglate", dur: 3.125, kind: "clip", clip: "v15/g9_late_grey", from: 2.6, zoom: [1.45, 1.47], origin: "68% 70%" },  // the rival lands beside the flag at +1.25
  { id: "black2", dur: 2.0, kind: "black" },
];

// Start time of every segment
const AT: Record<string, number> = {};
let acc = 0;
for (const sg of SEGS) { AT[sg.id] = acc; acc += sg.dur; }
export const RACE16_FRAMES = f(acc);
const t = (id: string, off = 0) => AT[id] + off;

/* ---------- picture ---------- */
const SRC_W = 1916;
const LogoPatch: React.FC<{ p: Patch }> = ({ p }) => {
  const fr = useCurrentFrame();
  const m = p.track.frames[Math.min(fr, p.track.frames.length - 1)];
  const sw = p.sw || SRC_W;
  const s = 1920 / sw;
  return (
    <div style={{ position: "absolute", left: 0, top: -(1080 * s - 1080) / 2, width: sw, height: 1080, transform: `scale(${s})`, transformOrigin: "0 0" }}>
      <Img src={staticFile(`race/v15/${p.img}.png`)} style={{ position: "absolute", left: 0, top: 0, width: sw, height: 1080, transform: `matrix(${m.join(",")})`, transformOrigin: "0 0" }} />
    </div>
  );
};

const ClipLayer: React.FC<{ sg: Extract<Seg, { kind: "clip" }> }> = ({ sg }) => {
  const fr = useCurrentFrame();
  const dur = f(sg.dur);
  const [z0, z1] = sg.zoom || [1.0, 1.03];
  const z = interpolate(fr, [0, dur], [z0, z1]);
  const video = <OffthreadVideo src={staticFile(`race/clips/${sg.clip}.mp4`)} muted startFrom={f(sg.from)} playbackRate={sg.rate || 1} style={{ width: 1920, height: 1080, objectFit: "cover" }} />;
  let soft: React.ReactNode = null;
  if (sg.soften) {
    const so = sg.soften;
    const [a, b, c, d, tx, ty] = so.track.frames[Math.min(fr, so.track.frames.length - 1)];
    const s = 1920 / so.sw, oy = -(so.sh * s - 1080) / 2, k = Math.hypot(a, b) * s;
    const mask = so.spots.map(([x, y]) => `radial-gradient(ellipse ${so.rx * k}px ${so.ry * k}px at ${(a * x + c * y + tx) * s}px ${(b * x + d * y + ty) * s + oy}px, #000 60%, transparent 100%)`).join(", ");
    soft = <AbsoluteFill style={{ filter: `blur(${so.px}px)`, WebkitMaskImage: mask, maskImage: mask }}>{video}</AbsoluteFill>;
  }
  return (
    <AbsoluteFill style={{ transform: `scale(${z})${sg.flip ? " scaleX(-1)" : ""}`, transformOrigin: sg.origin || "50% 50%", filter: sg.grade }}>
      {video}
      {soft}
      {(sg.patches || []).map((p) => <LogoPatch key={p.img} p={p} />)}
    </AbsoluteFill>
  );
};

/* ---------- type ---------- */
// The film's own lettering for its two title beats: the end card's condensed metal, blurred and tracked in, held,
// then a hard cut out. A word arrives over `inAt` frames; `hold` keeps it to the end of the sequence.
const Word: React.FC<{ text: string; at: number; size: number; x: number; y: number; align?: "left" | "right" | "center"; small?: boolean }> = ({ text, at, size, x, y, align = "center", small }) => {
  const fr = useCurrentFrame();
  const ease = Easing.bezier(0.16, 1, 0.3, 1);
  const u = interpolate(fr, [at, at + 14], [0, 1], { ...clamp, easing: ease });
  if (u <= 0) return null;
  const track = interpolate(u, [0, 1], [small ? 0.6 : 0.3, small ? 0.42 : 0.05]);
  const style: React.CSSProperties = {
    position: "absolute", left: align === "center" ? "50%" : align === "left" ? x : undefined, right: align === "right" ? 1920 - x : undefined, top: y,
    transform: `${align === "center" ? "translateX(-50%) " : ""}translateY(${(1 - u) * 18}px) scale(${1.06 - 0.06 * u})`, transformOrigin: align === "left" ? "0 50%" : align === "right" ? "100% 50%" : "50% 50%",
    opacity: u, filter: `blur(${(1 - u) * 10}px) drop-shadow(0 6px 26px rgba(0,0,0,.75))`, whiteSpace: "nowrap",
    font: small ? `500 ${size}px ${SANS}` : `800 ${size}px/0.9 ${MONUMENT}`, fontStretch: small ? undefined : "66%", letterSpacing: `${track}em`, paddingLeft: `${track}em`,
    ...(small ? { color: IVORY } : { background: METAL, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }),
  };
  return <div style={style}>{text}</div>;
};

// EVERY CATEGORY HAS A RACE. Over the cap in steam, then holding on black; out on the cut to the dark pad.
const TitleEvery: React.FC<{ dur: number }> = ({ dur }) => {
  const fr = useCurrentFrame();
  const shade = interpolate(fr, [0, 12], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: fr < dur ? 1 : 0 }}>
      <AbsoluteFill style={{ opacity: shade, background: "radial-gradient(ellipse 70% 50% at 50% 56%, rgba(0,0,0,.6), rgba(0,0,0,.1) 100%)" }} />
      <Word text="EVERY CATEGORY" at={0} size={40} x={960} y={392} small />
      <Word text="HAS A RACE." at={5} size={212} x={960} y={456} />
    </AbsoluteFill>
  );
};

// Film grain and a soft vignette; full 16:9, no letterbox
const Grain: React.FC = () => {
  const fr = useCurrentFrame();
  const seed = fr % 7;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1920" height="1080" style={{ position: "absolute", opacity: 0.06, mixBlendMode: "overlay" }}>
        <filter id={`g${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} /></filter>
        <rect width="1920" height="1080" filter={`url(#g${seed})`} />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 58%, rgba(0,0,0,.32) 100%)" }} />
    </AbsoluteFill>
  );
};

export const LIGHTS16 = t("lights", 0.71);     // the pad floods with light
export const RELIGHT16 = t("relight", 0.27);   // the engines relight: the score's return
const TITLE_AT = t("every", 0.6);
const TITLE_END = t("lights");

export const FlavorRaceV16: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SEGS.map((sg) => (
        <Sequence key={sg.id} from={f(AT[sg.id])} durationInFrames={f(sg.dur)} layout="none">
          {sg.kind === "clip" && <ClipLayer sg={sg} />}
          {sg.kind === "end" && <EndCard15 dur={f(sg.dur)} />}
        </Sequence>
      ))}

      <Sequence from={f(t("erupt"))} durationInFrames={8} layout="none"><Flash /></Sequence>
      <Sequence from={f(RELIGHT16)} durationInFrames={8} layout="none"><Flash warm /></Sequence>

      <Sequence from={f(TITLE_AT)} durationInFrames={f(TITLE_END) - f(TITLE_AT)} layout="none"><TitleEvery dur={f(TITLE_END) - f(TITLE_AT)} /></Sequence>

      <Sequence from={f(t("mc1", 0.1))} durationInFrames={f(2.45)} layout="none"><Super15 dur={f(2.45)} a="MISSION CONTROL" b="THE FLAVOR FACTORY · NORCO, CALIFORNIA" /></Sequence>
      <Sequence from={f(t("pipette", 0.1))} durationInFrames={f(3.0)} layout="none"><Super15 dur={f(3.0)} a="THE FLAVOR FACTORY" b="NORCO, CALIFORNIA · FLAVOR LAB" /></Sequence>

      <Grain />
    </AbsoluteFill>
  );
};
