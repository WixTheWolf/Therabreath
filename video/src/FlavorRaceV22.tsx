import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Flash, loadFonts } from "./FlavorRaceV12_2";
import { EndCard15 } from "./FlavorRaceV15";
import SIGN_MC1 from "../public/race/v15/sign_track_mc1.json";
import JACKET_MC1 from "../public/race/v15/jacket_track_mc1.json";
import LABEL_HULL from "../public/race/v15/label_track_hull.json";
import CD_SEAL from "../public/race/v15/cd_seal_track.json";

/* THE FLAVOR RACE · Version 22: V21 (docs/session/RACE21.md) with the last lap rebuilt and the fall replaced, on the
   note "I don't like shot 118.00 and 119.00. I also think the space race from 90.00 to 99.00 needs work". The last lap
   now reads as one race: the competitor far ahead (left to right, as the race has run), she draws alongside it, from
   behind the two are dead level, her engines kick on the score's bar 23 and she pulls away, Mission Control erupts,
   and the competitor coughs smoke as she closes on the Moon. Gone: the climb with the toy rival on legs, and the
   golden rocket that read as the competitor streaking for the Moon. The fall is now the view down past her engines
   as the cloud deck rushes up and swallows the lens. The last lap and the fall keep their V21 lengths, so every
   anchor of the score is where V21 had it. Every cut on a whole frame at 24 fps, durations n/24 so
   sound/timeline.py lands on the same frames as the render; `xf` is a dissolve into that segment, in frames, centred on
   the cut. No faces. Every hero shot is the locked bottle. The rival is only ever COMPETITOR. Real logos unaltered
   (tracked patches). */
const FPS = 24;
const f = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Track = { fps: number; from: number; frames: number[][] };
type Patch = { img: string; track: Track; sw?: number; until?: number };
type Soften = { track: Track; sw: number; sh: number; px: number; rx: number; ry: number; spots: [number, number][] };
type Seg =
  | { id: string; dur: number; kind: "clip"; clip: string; from: number; zoom?: [number, number]; origin?: string; flip?: boolean; rate?: number; grade?: string; patches?: Patch[]; soften?: Soften; xf?: number }
  | { id: string; dur: number; kind: "black"; xf?: number }
  | { id: string; dur: number; kind: "end"; xf?: number };

const SEGS: Seg[] = [
  // I. THE SURPRISE: a bottle, until the lights come on
  { id: "black0", dur: 0.75, kind: "black" },
  { id: "macro1", dur: 4.25, kind: "clip", clip: "v15/f864fd4b", from: 0.75, zoom: [1.3, 1.34], xf: 12 },       // condensation; the slow tilt down the bottle, up from black; out with the stripe in the frame (src 5.0)
  { id: "macro2", dur: 1.6667, kind: "clip", clip: "k/n28_flag", from: 3.05 },                                   // (hard cut, stripe to stripe) droplets on the orange stripe; out before the clip's own cut at 4.83
  { id: "every", dur: 1.4583, kind: "clip", clip: "v15/b92b53de", from: 0.25, zoom: [1.0, 1.03] },              // (hard cut) the cap in steam; out at 1.71, before its baked-in letters (they begin at 1.82)
  { id: "lights", dur: 6.8333, kind: "clip", clip: "v11/cc51b641", from: 0.667, zoom: [1.0, 1.02] },            // the dark pad; the lamps; two silhouettes; out on the searchlights' sweep
  { id: "rival", dur: 1.7917, kind: "clip", clip: "h/c01_comp_close", from: 1.2 },                               // COMPETITOR
  { id: "herocap", dur: 1.7917, kind: "clip", clip: "v11/58785409", from: 1.5, zoom: [1.35, 1.36] },             // TheraBreath; the push-in begins
  { id: "mc1", dur: 2.625, kind: "clip", clip: "h/mc_ff", from: 0.333, zoom: [1.0, 1.0], patches: [{ img: "sign_patch_mc", track: SIGN_MC1 }, { img: "jacket_patch_mc", track: JACKET_MC1 }] },  // the room, holding its breath
  { id: "cap", dur: 4.5, kind: "clip", clip: "v11/58785409", from: 5.15, zoom: [1.3, 1.36] },                    // the same push-in, further along: the cap in the cold; "three"
  { id: "umbilical", dur: 1.0417, kind: "clip", clip: "h/c14_umbilical", from: 1.57 },                           // the umbilical lets go on "two" (+0.33)
  { id: "button", dur: 0.9167, kind: "clip", clip: "v15/n02_button_fix", from: 0.042 },                          // the press on "one" (+0.26); cut on the action
  { id: "nozzle", dur: 2.25, kind: "clip", clip: "k/n18_nozzle", from: 0.875, zoom: [1.0, 1.06] },               // spark, catch, bloom: WHUMP
  // II. LAUNCH
  { id: "ignite", dur: 1.625, kind: "clip", clip: "v15/30f44324", from: 0.87 },                                  // both pads erupt
  { id: "crowd", dur: 1.3333, kind: "clip", clip: "v15/30f44324", from: 5.955 },                                 // the fans shield their eyes
  { id: "erupt", dur: 0.7917, kind: "clip", clip: "v14/ca51b3b2", from: 15.083, zoom: [1.3, 1.31] },             // the whiteout (the flash hides both cuts)
  { id: "liftoff", dur: 2.0417, kind: "clip", clip: "v14/ca51b3b2", from: 15.895, zoom: [1.3, 1.32] },           // both rockets clear the pad
  { id: "track", dur: 2.1667, kind: "clip", clip: "v12/g1_track", from: 0.25 },                                  // the long lens; nobody speaks over it now
  { id: "onboard", dur: 1.2917, kind: "clip", clip: "v12/g2_onboard", from: 0.25 },
  { id: "hull", dur: 4.125, kind: "clip", clip: "v14/8fed7431", from: 1.278, zoom: [1.3, 1.33],                  // the hull into the sun; the rival slides into frame at the end
    soften: { track: LABEL_HULL, sw: 1280, sh: 720, px: 8, rx: 55, ry: 38,
      spots: [[465, 436], [490, 440], [570, 450], [610, 458], [650, 465], [700, 490], [735, 520], [555, 470], [665, 500]] } },
  { id: "pitch", dur: 1.5417, kind: "clip", clip: "v18/g10_pitch_slow", from: 0.0 },                              // the edge of space: silence (the flare-free tail of g10_pitch, slowed; the flare flickered)
  // III. THE RACE
  { id: "both", dur: 3.1667, kind: "clip", clip: "v15/5d17c937", from: 1.7917, zoom: [1.3, 1.33] },              // both at full thrust over Earth: the race re-enters (src frame 43: frame 42 is the last frame of the clip's previous shot)
  { id: "chase", dur: 1.75, kind: "clip", clip: "v11/bd357d2b", from: 7.263 },                                   // the rival slides in close: "Nice bottle." (out before its pull-back, so the next shot is a new size)
  { id: "neck", dur: 2.5, kind: "clip", clip: "v12/g11_neck", from: 0.25 },
  { id: "px26", dur: 2.9583, kind: "clip", clip: "v15/px26", from: 0.0, zoom: [1.0, 1.0] },                      // both from below; the labels fly past; out as the bottle fills the lens
  { id: "rivaleng", dur: 1.25, kind: "clip", clip: "v20/race_lr", from: 0.6, zoom: [1.0, 1.02] },                // the competitor commits: its engines flare at +0.5 (left to right, as the race has run)
  { id: "rivalaway", dur: 2.2083, kind: "clip", clip: "v20/race_lr", from: 1.85, zoom: [1.02, 1.05] },          // and pulls away to the right (one continuous take)
  { id: "pullaway", dur: 2.0, kind: "clip", clip: "v11/m1_pullaway", from: 1.9, zoom: [1.0, 1.03] },             // from TheraBreath's shoulder: the rival is a dot by the Moon
  { id: "warnlight", dur: 2.0833, kind: "clip", clip: "v15/px31", from: 1.792, zoom: [1.0, 1.0] },               // TheraBreath's warning light
  { id: "cutoff", dur: 2.3333, kind: "clip", clip: "h/c04_burner_cut", from: 1.683 },                            // the engines go quiet
  // IV. DISCOVERY
  { id: "mc2", dur: 2.0, kind: "clip", clip: "h/mc_ff", from: 5.295, zoom: [1.13, 1.15], origin: "50% 100%" },  // The Flavor Factory, searching
  // the montage on the score's beats (3, 4, 2, 2, 2, 2, 2, 7 at 152 BPM: six bars), one sound per cut, each cut on an impact
  { id: "ginger", dur: 1.1667, kind: "clip", clip: "v15/4d855e65", from: 0.25, zoom: [1.04, 1.1] },              // ginger root and lime in a warm mist
  { id: "drop", dur: 1.5833, kind: "clip", clip: "v15/7e9b6135", from: 0.1, zoom: [1.0, 1.04] },                 // one drop lands on the orange at +0.38; the crown; the droplets dance
  { id: "lemon", dur: 0.7917, kind: "clip", clip: "h/c05_lab_citrus", from: 2.2, zoom: [1.06, 1.12] },           // a gloved hand squeezes the lemon into the beaker (the lab's own; the split would double the yuzu)
  { id: "berries", dur: 0.7917, kind: "clip", clip: "v19/berries", from: 1.15, zoom: [1.0, 1.04] },              // strawberries and cherries hit the water at +0.15
  { id: "melon", dur: 0.7917, kind: "clip", clip: "v15/15190f35", from: 1.55 },                                  // the watermelon bursts at +0.15
  { id: "mint", dur: 0.7917, kind: "clip", clip: "v15/1d8d16ab", from: 3.4, zoom: [1.1, 1.16] },                 // the frosted mint leaf; the drop glints
  { id: "blossom", dur: 0.7917, kind: "clip", clip: "v15/1fa2bddf", from: 0.6, zoom: [1.15, 1.22] },             // chamomile and vanilla in a lavender haze
  { id: "yuzu", dur: 2.75, kind: "clip", clip: "k/n08_yuzu", from: 2.4, zoom: [1.2, 1.28] },                     // the one: the split at +0.3, the zest in the air
  { id: "pipette", dur: 2.0, kind: "clip", clip: "h/c06_lab_drop", from: 0.6 },                                  // the drop lands at +1.20
  { id: "prism", dur: 1.125, kind: "clip", clip: "h/c07_lab_prism", from: 1.9, zoom: [1.1, 1.14] },              // light through the vial at +0.25
  { id: "glove", dur: 1.625, kind: "clip", clip: "h/c09_lab_cell", from: 0.4 },                                  // the vial locks at +0.95; the cold comes off it
  { id: "transferbtn", dur: 1.5833, kind: "clip", clip: "v15/7e9b6135", from: 12.292 },                          // FLAVOR TRANSFER READY: the press at +0.60 (one bar; the prism, the glove and the transfer give it back so the bass still arrives on the pipette and the brass on the relight)
  { id: "orbit", dur: 1.5, kind: "clip", clip: "v11/22da0f7a", from: 5.75, zoom: [2.0, 2.06], origin: "8% 60%" },   // the signal crosses the night side; framed on the trails (the fruit at their head stays out of frame)
  { id: "transfer", dur: 2.2083, kind: "clip", clip: "v12/g12_transfer", from: 1.4 },                            // docked; the beam at +1.6: "Oh, that's new."
  { id: "life", dur: 1.9167, kind: "clip", clip: "v20/life_mint", from: 0.0 },                                   // TheraBreath comes alive, the fill TheraBreath mint (g5_life_fix regraded)
  { id: "relight", dur: 1.7917, kind: "clip", clip: "v15/7e9b6135", from: 15.5, zoom: [1.3, 1.31] },             // dark bells; the relight at +0.67: the score's return
  // the last lap: the rival far ahead, she draws alongside, dead level from behind, the kick and the pass, the room, the rival spent
  { id: "rivalfar", dur: 1.25, kind: "clip", clip: "v20/race_lr", from: 4.5, zoom: [1.05, 1.06] },             // the competitor, still far ahead to the right: only its smoke is left in frame (the same take, later)
  { id: "level", dur: 2.6667, kind: "clip", clip: "v15/px27", from: 0.6667, zoom: [1.0, 1.0] },                 // and she has caught it: alongside the competitor, left to right; the lens closes on her label and the cap fills it (the occlusion hides the cut)
  { id: "neck2", dur: 1.375, kind: "clip", clip: "v12/g3_neck", from: 0.75, zoom: [1.0, 1.02] },                // from behind, dead level; her engines kick at +1.25 (src 2.0), on the score's bar 23; out on the flare's peak
  { id: "pass", dur: 1.9167, kind: "clip", clip: "v12/g6_pass", from: 0.375, zoom: [1.0, 1.02] },               // wider, the same side: she pulls away (ahead from +0.25), the mint trail behind her; the competitor has no answer
  { id: "mcerupts", dur: 1.5, kind: "clip", clip: "v122/v122_mc_erupts", from: 0.9, zoom: [1.24, 1.28], origin: "50% 100%" },   // Mission Control erupts (pushed in below the garbled sign and lettering)
  { id: "passtail", dur: 1.25, kind: "clip", clip: "v12/g6_pass", from: 2.7083, zoom: [1.02, 1.04] },           // back on the race: the competitor coughs smoke at +0.3 as she closes on the Moon
  // V. THE MOON
  { id: "descent", dur: 2.25, kind: "clip", clip: "v20/descent_true", from: 0.6, zoom: [1.0, 1.02] },            // on the surface: she descends into frame on her plume (enters at +0.15, touchdown at +2.4)
  { id: "foot", dur: 3.0, kind: "clip", clip: "k/n14_dust", from: 1.958 },                                       // the leg comes down (the clip's own cut, on the frame); touchdown at +1.94
  { id: "stand", dur: 2.2917, kind: "clip", clip: "v20/descent_true", from: 3.25, zoom: [1.02, 1.03] },         // the same wide, landed, the dust settling
  { id: "pole", dur: 1.1667, kind: "clip", clip: "k/n28_flag", from: 8.837 },                                    // the pole enters the regolith at +0.55
  { id: "flagwide", dur: 4.5417, kind: "clip", clip: "v15/c7_flag_grey", from: 1.45, zoom: [1.0, 1.04] },        // and only then the flag, the Earth behind it (held to the end of the take)
  // VI. HOME
  { id: "moonlaunch", dur: 2.0, kind: "clip", clip: "v15/7f36146f", from: 0.0 },                                 // lift-off for home at +0.20
  { id: "homeward", dur: 1.5, kind: "clip", clip: "v19/homeward_nomoon", from: 2.1667 },                       // for home, the Earth ahead and nothing else in the sky (c11_homeward with the stray Moon filled; in after the leg clears it)
  { id: "reentry", dur: 1.25, kind: "clip", clip: "v15/1bba799d", from: 0.717 },                                 // the re-entry: engines first, the plasma on the blunt end
  { id: "fall", dur: 1.375, kind: "clip", clip: "w/x_reentrypov", from: 5.75, zoom: [1.0, 1.04] },          // looking down past her engines: the cloud deck rushes up and swallows the lens (src 5.29 to 7.29; out as the cloud fills it); she punches into it behind a white flash
  { id: "clouds", dur: 2.75, kind: "clip", clip: "v11/47b35301", from: 3.25, grade: "sepia(0.3) saturate(1.2) brightness(0.97)" },   // inside the whiteout (src 2.0); out below it over New Jersey, warmed toward the golden hour (the clip cuts at src frame 151)
  { id: "cdsign", dur: 1.4583, kind: "clip", clip: "v15/5b518a71", from: 1.0, patches: [{ img: "cd_seal_patch", track: CD_SEAL, sw: 1912, until: 1.45 }] },
  { id: "whip", dur: 0.5, kind: "clip", clip: "v15/5b518a71", from: 2.4583, rate: 4.0, zoom: [1.03, 1.03] },        // the same take: the whip up through the tree, four times speed
  { id: "contrail", dur: 1.625, kind: "clip", clip: "v15/5b518a71", from: 4.4583, zoom: [1.03, 1.03] },              // and on: the contrail over the building (src 5.1)  // Church & Dwight, Ewing; the camera whips up through the tree to the sky; the contrail (one take)
  { id: "hqland", dur: 3.5833, kind: "clip", clip: "s11_hq", from: 3.9083 },                                     // the descent onto the lawn; touchdown at +3.89
  { id: "robot", dur: 3.5, kind: "clip", clip: "v19/robot_lawn", from: 2.6667, zoom: [1.0, 1.0] },            // on the lawn: the hatch at +0.33, the arm and the tray of four at +1.6, the glasses at the lens at +2.8; the take ends at +3.375 and its last frame holds under the fade
  { id: "hush", dur: 0.75, kind: "black", xf: 18 },                                                              // (fade) to black
  { id: "end", dur: 5.0, kind: "end" },
  { id: "black1", dur: 0.75, kind: "black" },
  // VII. THE STINGER
  { id: "stglate", dur: 5.0, kind: "clip", clip: "v15/g9_late_grey", from: 0.0, zoom: [1.45, 1.45], origin: "68% 70%" },  // the flag; the rival drops in beside it and lands at +2.1 (one take)
  { id: "black2", dur: 2.0, kind: "black" },
];

// Start time of every segment (the cut point; a dissolve is centred on it)
const AT: Record<string, number> = {};
let acc = 0;
for (const sg of SEGS) { AT[sg.id] = acc; acc += sg.dur; }
export const RACE22_FRAMES = f(acc);
const t = (id: string, off = 0) => AT[id] + off;
const lead = (i: number) => (SEGS[i].xf ? Math.floor((SEGS[i].xf as number) / 2) : 0);          // frames the incoming starts before its cut point
const tail = (i: number) => (i + 1 < SEGS.length && SEGS[i + 1].xf ? (SEGS[i + 1].xf as number) - lead(i + 1) : 0);   // frames the outgoing stays under the next

/* ---------- picture ---------- */
const SRC_W = 1916;
const LogoPatch: React.FC<{ p: Patch; idx: number; local: number }> = ({ p, idx, local }) => {
  const m = p.track.frames[Math.max(0, Math.min(idx, p.track.frames.length - 1))];
  const sw = p.sw || SRC_W;
  const s = 1920 / sw;
  const op = p.until === undefined ? 1 : interpolate(local, [f(p.until) - 4, f(p.until)], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, top: -(1080 * s - 1080) / 2, width: sw, height: 1080, transform: `scale(${s})`, transformOrigin: "0 0", opacity: op }}>
      <Img src={staticFile(`race/v15/${p.img}.png`)} style={{ position: "absolute", left: 0, top: 0, width: sw, height: 1080, transform: `matrix(${m.join(",")})`, transformOrigin: "0 0" }} />
    </div>
  );
};

const ClipLayer: React.FC<{ sg: Extract<Seg, { kind: "clip" }>; lead: number; total: number }> = ({ sg, lead, total }) => {
  const fr = useCurrentFrame();
  const local = fr - lead;                                   // frames since the cut point
  const [z0, z1] = sg.zoom || [1.0, 1.03];
  const z = interpolate(fr, [0, total], [z0, z1]);
  const video = <OffthreadVideo src={staticFile(`race/clips/${sg.clip}.mp4`)} muted startFrom={f(sg.from) - lead} playbackRate={sg.rate || 1} style={{ width: 1920, height: 1080, objectFit: "cover" }} />;
  const tidx = (tr: Track) => local + Math.round((sg.from - tr.from) * FPS);
  let soft: React.ReactNode = null;
  if (sg.soften) {
    const so = sg.soften;
    const [a, b, c, d, tx, ty] = so.track.frames[Math.max(0, Math.min(tidx(so.track), so.track.frames.length - 1))];
    const s = 1920 / so.sw, oy = -(so.sh * s - 1080) / 2, k = Math.hypot(a, b) * s;
    const mask = so.spots.map(([x, y]) => `radial-gradient(ellipse ${so.rx * k}px ${so.ry * k}px at ${(a * x + c * y + tx) * s}px ${(b * x + d * y + ty) * s + oy}px, #000 60%, transparent 100%)`).join(", ");
    soft = <AbsoluteFill style={{ filter: `blur(${so.px}px)`, WebkitMaskImage: mask, maskImage: mask }}>{video}</AbsoluteFill>;
  }
  return (
    <AbsoluteFill style={{ transform: `scale(${z})${sg.flip ? " scaleX(-1)" : ""}`, transformOrigin: sg.origin || "50% 50%", filter: sg.grade }}>
      {video}
      {soft}
      {(sg.patches || []).map((p) => <LogoPatch key={p.img} p={p} idx={tidx(p.track)} local={local} />)}
    </AbsoluteFill>
  );
};

// A dissolve into a segment: the incoming layer rises over `xf` frames while the outgoing keeps playing beneath it
const Fade: React.FC<{ xf: number; children: React.ReactNode }> = ({ xf, children }) => {
  const fr = useCurrentFrame();
  const op = xf ? interpolate(fr, [0, xf], [0, 1], clamp) : 1;
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
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

export const LIGHTS22 = t("lights", 0.71);     // the pad floods with light
export const RELIGHT22 = t("relight", 0.67);   // the engines relight: the score's return

export const FlavorRaceV22: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SEGS.map((sg, i) => {
        const ld = lead(i), total = f(sg.dur) + ld + tail(i);
        return (
          <Sequence key={sg.id} from={f(AT[sg.id]) - ld} durationInFrames={total} layout="none">
            <Fade xf={sg.xf || 0}>
              {sg.kind === "clip" && <ClipLayer sg={sg} lead={ld} total={total} />}
              {sg.kind === "black" && <AbsoluteFill style={{ background: "#000" }} />}
              {sg.kind === "end" && <EndCard15 dur={f(sg.dur)} />}
            </Fade>
          </Sequence>
        );
      })}

      <Sequence from={f(t("erupt"))} durationInFrames={8} layout="none"><Flash /></Sequence>
      <Sequence from={f(RELIGHT22)} durationInFrames={8} layout="none"><Flash warm /></Sequence>
      <Sequence from={f(t("pass")) - 2} durationInFrames={8} layout="none"><Flash k={0.4} /></Sequence>
      <Sequence from={f(t("clouds")) - 2} durationInFrames={8} layout="none"><Flash /></Sequence>

      <Grain />
    </AbsoluteFill>
  );
};
