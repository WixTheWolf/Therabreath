import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Flash, loadFonts } from "./FlavorRaceV12_2";
import { EndCard15 } from "./FlavorRaceV15";
import SIGN_MC1 from "../public/race/v15/sign_track_mc1.json";
import JACKET_MC1 from "../public/race/v15/jacket_track_mc1.json";
import LABEL_HULL from "../public/race/v15/label_track_hull.json";
import CD_SEAL from "../public/race/v15/cd_seal_track.json";

/* THE FLAVOR RACE · Version 18: V17's cut on the notes (docs/session/RACE18.md). What changed, and why:
   - The flash at 0:44 was the sun flare in the pitch shot flickering on and off from frame to frame in the generated
     footage; the shot now plays its flare-free tail, motion-interpolated to two thirds speed (clips/v18/g10_pitch_slow).
   - The bottle reveal is three hard cuts (the fade up from black stays): the condensation macro cuts to the stripe as
     the stripe enters its frame, the stripe cuts to the cap in steam. No dissolves until the Moon.
   - The plasma tunnel at 2:04 is gone: the re-entry punches straight into the cloud behind a white flash.
   - The FLAVOR TRANSFER READY button is back, after the vial locks and before the signal crosses the night side.
   - The flavor montage is eight shots on the score's beats (3, 4, 2, 2, 2, 2, 2, 7), every cut on a splash, a crack or
     a burst: tea, the drop on the orange, lime and cucumber, the coconut, the watermelon, the frosted mint, cucumber
     and tea in water, the yuzu. (The flight's own flavors stay out of the film so the tasting stays blind.)
   - The pass is one pass, with the rival first: the engines relight, the rival is still far ahead, TheraBreath climbs
     alone toward the Moon, charges the lens (the cap fills it), and only then draws level and past, from behind, the
     pass landing on a bar line; the room erupts; she streaks for the Moon with nobody in frame.
   - Eleven radio lines are five: the count, "Nice bottle", "running out of road", "Oh, that's new", "not ideal".
   - The long lens on the lift-off is shorter now that nobody speaks over it.
   Everything else is V17: every cut on a whole frame at 24 fps, durations n/24 so sound/timeline.py lands on the same
   frames as the render; `xf` is a dissolve into that segment, in frames, centred on the cut. No faces. Every hero
   shot is the locked bottle. The rival is only ever COMPETITOR. Real logos unaltered (tracked patches). */
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
  { id: "rivaleng", dur: 1.25, kind: "clip", clip: "v15/5d17c937", from: 11.86, zoom: [1.3, 1.31] },             // the competitor commits
  { id: "rivalaway", dur: 2.2083, kind: "clip", clip: "v15/5d17c937", from: 13.11, zoom: [1.31, 1.33] },         // and pulls away (one continuous take)
  { id: "pullaway", dur: 2.0, kind: "clip", clip: "v11/m1_pullaway", from: 1.9, zoom: [1.0, 1.03] },             // from TheraBreath's shoulder: the rival is a dot by the Moon
  { id: "warnlight", dur: 2.0833, kind: "clip", clip: "v15/px31", from: 1.792, zoom: [1.0, 1.0] },               // TheraBreath's warning light
  { id: "cutoff", dur: 2.3333, kind: "clip", clip: "h/c04_burner_cut", from: 1.683 },                            // the engines go quiet
  // IV. DISCOVERY
  { id: "mc2", dur: 2.0, kind: "clip", clip: "h/mc_ff", from: 5.295, zoom: [1.13, 1.15], origin: "50% 100%" },  // The Flavor Factory, searching
  // the montage on the score's beats (3, 4, 2, 2, 2, 2, 2, 7 at 152 BPM: six bars), one sound per cut, each cut on an impact
  { id: "tea", dur: 1.1667, kind: "clip", clip: "v15/77d3caa6", from: 1.0, zoom: [1.05, 1.1] },                  // tea leaves in the air
  { id: "drop", dur: 1.5833, kind: "clip", clip: "v15/7e9b6135", from: 0.1, zoom: [1.0, 1.04] },                 // one drop lands on the orange at +0.38; the crown; the droplets dance
  { id: "cuke", dur: 0.7917, kind: "clip", clip: "k/n04_cuke", from: 0.15, zoom: [1.05, 1.1] },                  // lime and cucumber tumble
  { id: "coconut", dur: 0.7917, kind: "clip", clip: "v15/a2c83349", from: 2.55 },                                // the coconut pops on the cut, splashes at +0.40
  { id: "melon", dur: 0.7917, kind: "clip", clip: "v15/15190f35", from: 1.55 },                                  // the watermelon bursts at +0.15
  { id: "mint", dur: 0.7917, kind: "clip", clip: "v15/1d8d16ab", from: 3.4, zoom: [1.1, 1.16] },                 // the frosted mint leaf; the drop glints
  { id: "cuketea", dur: 0.7917, kind: "clip", clip: "v15/62ef0a17", from: 2.6, zoom: [1.25, 1.32] },             // cucumber and tea in water
  { id: "yuzu", dur: 2.75, kind: "clip", clip: "k/n08_yuzu", from: 2.4, zoom: [1.2, 1.28] },                     // the one: the split at +0.3, the zest in the air
  { id: "pipette", dur: 2.0, kind: "clip", clip: "h/c06_lab_drop", from: 0.6 },                                  // the drop lands at +1.20
  { id: "prism", dur: 1.125, kind: "clip", clip: "h/c07_lab_prism", from: 1.9, zoom: [1.1, 1.14] },              // light through the vial at +0.25
  { id: "glove", dur: 1.625, kind: "clip", clip: "h/c09_lab_cell", from: 0.4 },                                  // the vial locks at +0.95; the cold comes off it
  { id: "transferbtn", dur: 1.5833, kind: "clip", clip: "v15/7e9b6135", from: 12.292 },                          // FLAVOR TRANSFER READY: the press at +0.60 (one bar; the prism, the glove and the transfer give it back so the bass still arrives on the pipette and the brass on the relight)
  { id: "orbit", dur: 1.5, kind: "clip", clip: "v11/22da0f7a", from: 5.75, zoom: [2.0, 2.06], origin: "8% 60%" },   // the signal crosses the night side; framed on the trails (the fruit at their head stays out of frame)
  { id: "transfer", dur: 2.2083, kind: "clip", clip: "v12/g12_transfer", from: 1.4 },                            // docked; the beam at +1.6: "Oh, that's new."
  { id: "life", dur: 1.9167, kind: "clip", clip: "v15/g5_life_fix", from: 0.0 },                                 // TheraBreath comes alive
  { id: "relight", dur: 1.7917, kind: "clip", clip: "v15/7e9b6135", from: 15.5, zoom: [1.3, 1.31] },             // dark bells; the relight at +0.67: the score's return
  // the last lap: the rival first, then the hero alone, then the charge, then the one pass
  { id: "rivalfar", dur: 1.25, kind: "clip", clip: "v15/5d17c937", from: 15.25, zoom: [1.3, 1.32] },             // the competitor, still far ahead
  { id: "hero", dur: 1.5, kind: "clip", clip: "v15/7e9b6135", from: 18.33, zoom: [1.3, 1.32] },                  // TheraBreath alone, the Moon ahead, climbing
  { id: "charge", dur: 1.5833, kind: "clip", clip: "v15/px27", from: 1.75, zoom: [1.0, 1.0] },                   // she charges the lens; the cap fills it (the occlusion hides the cut)
  { id: "pass", dur: 3.0, kind: "clip", clip: "v12/g6_pass", from: 0.75 },                                       // from behind: level at +0.6, past at +0.85 (a bar line), the rival falls behind in the green
  { id: "mcerupts", dur: 1.5, kind: "clip", clip: "v122/v122_mc_erupts", from: 0.9, zoom: [1.0, 1.03] },         // Mission Control erupts
  { id: "overtake", dur: 1.125, kind: "clip", clip: "v15/7e9b6135", from: 20.65, zoom: [1.3, 1.32] },            // and streaks for the Moon, nobody else in frame
  // V. THE MOON
  { id: "descent", dur: 4.4167, kind: "clip", clip: "v11/617c18bf", from: 0.3 },                                 // the descent, in silence
  { id: "dust", dur: 1.2083, kind: "clip", clip: "k/n14_dust", from: 0.7, xf: 20 },                              // (dissolve) the regolith, to the clip's own cut at 1.958
  { id: "foot", dur: 3.0, kind: "clip", clip: "k/n14_dust", from: 1.958 },                                       // the leg comes down (the clip's own cut, on the frame); touchdown at +1.94
  { id: "stand", dur: 2.2917, kind: "clip", clip: "v15/moon_stand_grey", from: 0.0 },
  { id: "pole", dur: 1.1667, kind: "clip", clip: "k/n28_flag", from: 8.837 },                                    // the pole enters the regolith at +0.55
  { id: "flagwide", dur: 3.2083, kind: "clip", clip: "v15/c7_flag_grey", from: 1.5, zoom: [1.0, 1.03] },         // and only then the flag
  { id: "earthrise", dur: 3.9167, kind: "clip", clip: "v15/fbfbe7c8", from: 2.9, zoom: [1.15, 1.18], xf: 24 },   // (dissolve) the Earthrise
  // VI. HOME
  { id: "moonlaunch", dur: 2.5, kind: "clip", clip: "v15/7f36146f", from: 0.0 },                                 // lift-off for home at +0.20
  { id: "homeward", dur: 2.5833, kind: "clip", clip: "h/c11_homeward", from: 0.25 },                                // (the plasma shot's time goes here and to the approach to the lawn, so the finale's last chord still lands on it)
  { id: "reentry", dur: 2.1667, kind: "clip", clip: "v15/1bba799d", from: 0.717 },                               // the re-entry; it punches into the cloud behind a white flash
  { id: "clouds", dur: 4.25, kind: "clip", clip: "v11/47b35301", from: 2.05 },                                   // out on src frame 150: the clip cuts to another aerial at 151 (V17 ran five frames past it)                                 // inside the whiteout of the cloud (src 2.0); out below it over New Jersey (one take)
  { id: "cdsign", dur: 5.9583, kind: "clip", clip: "v15/5b518a71", from: 1.0, patches: [{ img: "cd_seal_patch", track: CD_SEAL, sw: 1912, until: 1.45 }] },  // Church & Dwight, Ewing; the camera whips up through the tree to the sky; the contrail (one take)
  { id: "hqland", dur: 6.5833, kind: "clip", clip: "s11_hq", from: 2.5917 },                                     // the descent onto the lawn; touchdown at +3.89
  { id: "robot", dur: 5.0, kind: "clip", clip: "v12/g7_robot", from: 0.0 },                                      // six samples
  { id: "tasting", dur: 4.0, kind: "clip", clip: "v13/t1_tasting", from: 0.0 },
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
export const RACE18_FRAMES = f(acc);
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

export const LIGHTS18 = t("lights", 0.71);     // the pad floods with light
export const RELIGHT18 = t("relight", 0.67);   // the engines relight: the score's return

export const FlavorRaceV18: React.FC = () => {
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
      <Sequence from={f(RELIGHT18)} durationInFrames={8} layout="none"><Flash warm /></Sequence>
      <Sequence from={f(t("clouds")) - 2} durationInFrames={8} layout="none"><Flash /></Sequence>

      <Grain />
    </AbsoluteFill>
  );
};
