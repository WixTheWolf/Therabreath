import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Flash, loadFonts } from "./FlavorRaceV12_2";
import SIGN_MC1 from "../public/race/v15/sign_track_mc1.json";
import JACKET_MC1 from "../public/race/v15/jacket_track_mc1.json";
import LABEL_HULL from "../public/race/v15/label_track_hull.json";

/* THE FLAVOR RACE · Version 15, the final cut: the director's own edit of 12 October 2026 (Version 4's personality and
   spectacle, its title beats and Mission Control at The Flavor Factory), conformed shot for shot to the full-resolution
   sources and finished with what the later versions learned:
   I the surprise: macro photography of what looks like an ordinary giant bottle, EVERY CATEGORY HAS A RACE, the
   silhouettes and the stadium lights, the rival, Mission Control, the cap in the cold, the count, the burner
   II launch: ignition, the crowd, both rockets leave together, the long lens, the onboard look back, the pitch-over
   III the race: neck and neck, the competitor commits and pulls away, and TheraBreath's warning light comes on
   IV discovery: The Flavor Factory searches; the engines go quiet; a montage of flavor cut on the score's beats
   (botanicals, fruit, the cool notes, the one, then the pipette, the glove, FLAVOR TRANSFER READY, the world's
   flavors in orbit); the transfer, TheraBreath comes alive and the engines relight on the score's return;
   FOLLOW? OR LEAD?; it overtakes for the Moon
   V the Moon: the descent in silence, the footpad, TheraBreath on the Moon, the pole, and only then the flag
   (cause before effect), the Earthrise
   VI home: The Flavor Factory sees it, the lift-off for home, re-entry, down through the clouds to New Jersey, the
   campus, Church & Dwight headquarters, the landing, six samples, the tasting, silence, black, the line
   VII the stinger: back on the Moon, the competitor finally arrives.
   No faces, with one exception the director has to rule on: the warning beat (v15/px31, from the director's proxy)
   opens on a vintage control room where two men are seen in profile for about 1.6 s before the warning light. Every
   hero shot is the locked bottle: white, short ribbed orange cap. The rival is only ever COMPETITOR:
   the shot that spells it wrong is gone (the pull-away runs on instead). The Mission Control wall sign wore a
   generated copy of The Flavor Factory wordmark with a mangled R: it carries the real logo, tracked to the camera.
   Generated text the model misspelt is repaired: the small print in the hull shot stays soft (a tracked blur), the
   close-up as TheraBreath comes alive loses its small print, The Flavor Factory's monitors read THERABREATH ONE, and
   the launch button's garbled label is lifted off. Where the director's in-points caught a frame of the neighbouring
   source shot (the transfer button, the flagpole) or replayed frames across a cut (the eruption into the lift-off,
   the rival's engines into its pull-away), they are moved by a few frames; every cut point stays where the director
   put it.
   Shots 26, 27 and 31 of the director's edit (two race angles and the warning light) were not found in the Higgsfield
   library; until the originals arrive they play from the director's review proxy (v15/px26, px27, px31).
   The new clips (public/race/clips/v15/, named by the first 8 characters of their Higgsfield job id) are trimmed to the
   span the cut uses plus 1 s handles where that saves space, cut on whole seconds, so their from values are the
   Higgsfield originals' minus a whole number of seconds.
   24 fps, the sources' own rate, so every source frame plays once. The timeline is a list of segments played back to
   back. */
const FPS = 24;
const f = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SANS = '"Geist", "Helvetica Neue", Arial, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const IVORY = "#F4EDE0";

type Track = { fps: number; from: number; frames: number[][] };
type Patch = { img: string; track: Track };
// a softened region that follows a surface (track_sign.py): the layer's own pixels, blurred, seen through feathered
// ellipses (full strength inside 60% of their radii) placed in source pixels (sw x sh) and moved by the track
type Soften = { track: Track; sw: number; sh: number; px: number; rx: number; ry: number; spots: [number, number][] };
type Seg =
  | { id: string; dur: number; kind: "clip"; clip: string; from: number; zoom?: [number, number]; origin?: string; flip?: boolean; rate?: number; grade?: string; patches?: Patch[]; soften?: Soften }
  | { id: string; dur: number; kind: "black" }
  | { id: string; dur: number; kind: "end" };

const SEGS: Seg[] = [
  // I. THE SURPRISE
  { id: "macro1", dur: 4.917, kind: "clip", clip: "v15/f864fd4b", from: 0.0, zoom: [1.3, 1.34] },          // condensation on a white bottle
  { id: "macro2", dur: 1.25, kind: "clip", clip: "k/n28_flag", from: 2.855 },                               // droplets, the orange stripe
  { id: "every", dur: 4.291, kind: "clip", clip: "v15/b92b53de", from: 1.165, zoom: [1.0, 1.02] },          // EVERY CATEGORY HAS A RACE
  { id: "lights", dur: 6.334, kind: "clip", clip: "v11/cc51b641", from: 0.667, zoom: [1.0, 1.02] },          // two silhouettes; the lights come on
  { id: "rival", dur: 1.125, kind: "clip", clip: "h/c01_comp_close", from: 1.753 },
  { id: "herocap", dur: 0.416, kind: "clip", clip: "v11/58785409", from: 1.817, zoom: [1.35, 1.36] },
  { id: "mc1", dur: 2.625, kind: "clip", clip: "h/mc_ff", from: 0.333, zoom: [1.0, 1.0], patches: [{ img: "sign_patch_mc", track: SIGN_MC1 }, { img: "jacket_patch_mc", track: JACKET_MC1 }] },   // Mission Control: the real logo on the wall and the jacket
  { id: "cap", dur: 4.875, kind: "clip", clip: "v11/58785409", from: 5.15, zoom: [1.3, 1.36] },             // the cap in the cold: "three"
  { id: "umbilical", dur: 0.625, kind: "clip", clip: "h/c14_umbilical", from: 1.905 },                     // "two"
  { id: "button", dur: 0.75, kind: "clip", clip: "v15/n02_button_fix", from: 0.042 },  // "one": k/n02_mctense from frame 95 (3.958 s), its garbled label (LHARNCT) lifted off (scripts/fix_text.py)
  { id: "nozzle", dur: 2.25, kind: "clip", clip: "k/n18_nozzle", from: 0.875, zoom: [1.0, 1.06] },          // spark, catch, bloom: WHUMP
  // II. LAUNCH
  { id: "ignite", dur: 1.625, kind: "clip", clip: "v15/30f44324", from: 0.87 },                            // both pads erupt
  { id: "crowd", dur: 1.334, kind: "clip", clip: "v15/30f44324", from: 5.955 },                            // the fans shield their eyes
  { id: "erupt", dur: 0.791, kind: "clip", clip: "v14/ca51b3b2", from: 15.083, zoom: [1.3, 1.31] },
  { id: "liftoff", dur: 2.042, kind: "clip", clip: "v14/ca51b3b2", from: 15.895, zoom: [1.3, 1.32] },       // both rockets clear the pad
  { id: "track", dur: 3.792, kind: "clip", clip: "v12/g1_track", from: 0.25 },
  { id: "onboard", dur: 1.291, kind: "clip", clip: "v12/g2_onboard", from: 0.25 },
  { id: "hull", dur: 4.125, kind: "clip", clip: "v14/8fed7431", from: 1.278, zoom: [1.3, 1.33],
    // the small print under the wordmark is a generated, misspelt line (and a claim): it stays soft
    soften: { track: LABEL_HULL, sw: 1280, sh: 720, px: 8, rx: 55, ry: 38,
      spots: [[465, 436], [490, 440], [570, 450], [610, 458], [650, 465], [700, 490], [735, 520], [555, 470], [665, 500]] } },
  { id: "pitch", dur: 1.792, kind: "clip", clip: "v12/g10_pitch", from: 2.213 },
  // III. THE RACE
  { id: "side", dur: 1.208, kind: "clip", clip: "v15/5d17c937", from: 1.913, zoom: [1.3, 1.31] },
  { id: "chase", dur: 2.75, kind: "clip", clip: "v11/bd357d2b", from: 7.263 },                             // on the race's downbeat
  { id: "neck", dur: 2.5, kind: "clip", clip: "v12/g11_neck", from: 0.25 },
  { id: "apollo", dur: 2.959, kind: "clip", clip: "v15/964a96cd", from: 1.155 },
  { id: "px26", dur: 4.041, kind: "clip", clip: "v15/px26", from: 0.0, zoom: [1.0, 1.0] },                  // stand-in from the review proxy
  { id: "px27", dur: 3.5, kind: "clip", clip: "v15/px27", from: 0.0, zoom: [1.0, 1.0] },                    // stand-in from the review proxy
  { id: "rivaleng", dur: 1.25, kind: "clip", clip: "v15/5d17c937", from: 11.86, zoom: [1.3, 1.31] },       // the competitor commits
  { id: "rivalaway", dur: 3.125, kind: "clip", clip: "v15/5d17c937", from: 13.11, zoom: [1.3, 1.33] },      // and pulls away
  { id: "warn", dur: 3.875, kind: "clip", clip: "v15/px31", from: 0.0, zoom: [1.0, 1.0] },                  // stand-in: a vintage control room (faces, 1.6 s), then TheraBreath's warning light
  // IV. DISCOVERY
  { id: "search", dur: 1.875, kind: "clip", clip: "v15/5f1977e8", from: 0.0 },                             // The Flavor Factory: SEARCHING
  { id: "cutoff", dur: 2.334, kind: "clip", clip: "h/c04_burner_cut", from: 1.683 },                        // the engines go quiet
  { id: "mc2", dur: 2.0, kind: "clip", clip: "h/mc_ff", from: 5.295, zoom: [1.13, 1.15], origin: "50% 100%" },  // the sign's top is framed out
  // the montage, cut on the score's beats
  { id: "tea", dur: 1.301, kind: "clip", clip: "v15/77d3caa6", from: 1.0, zoom: [1.05, 1.1] },
  { id: "cuketea", dur: 1.487, kind: "clip", clip: "v15/62ef0a17", from: 2.6, zoom: [1.25, 1.3] },
  { id: "coconut", dur: 1.115, kind: "clip", clip: "v15/a2c83349", from: 2.6 },
  { id: "melon", dur: 1.115, kind: "clip", clip: "v15/15190f35", from: 1.4 },
  { id: "lime", dur: 0.743, kind: "clip", clip: "v15/4d855e65", from: 4.2, zoom: [1.3, 1.33] },
  { id: "cukedrop", dur: 0.743, kind: "clip", clip: "v15/7e9b6135", from: 1.985, zoom: [1.3, 1.32] },
  { id: "mint", dur: 1.115, kind: "clip", clip: "v15/1d8d16ab", from: 2.8 },
  { id: "chamomile", dur: 1.114, kind: "clip", clip: "v15/1fa2bddf", from: 2.3, zoom: [1.2, 1.24] },
  { id: "yuzu", dur: 2.602, kind: "clip", clip: "k/n08_yuzu", from: 2.4, zoom: [1.2, 1.28] },               // the one
  { id: "pipette", dur: 1.858, kind: "clip", clip: "h/c06_lab_drop", from: 0.6 },
  { id: "glove", dur: 1.486, kind: "clip", clip: "h/c09_lab_cell", from: 0.4 },
  { id: "transferbtn", dur: 1.487, kind: "clip", clip: "v15/7e9b6135", from: 12.292 },                      // FLAVOR TRANSFER READY
  { id: "orbit", dur: 1.182, kind: "clip", clip: "v11/22da0f7a", from: 0.85, zoom: [1.3, 1.34] },          // the world's flavors in orbit
  { id: "transfer", dur: 3.042, kind: "clip", clip: "v12/g12_transfer", from: 0.675 },
  { id: "life", dur: 1.75, kind: "clip", clip: "v15/g5_life_fix", from: 0.0 },        // v12/g5_life, its misspelt small print lifted off (scripts/fix_text.py)
  { id: "relight", dur: 0.667, kind: "clip", clip: "v15/7e9b6135", from: 16.113, zoom: [1.3, 1.31] },     // the engines relight: the score's return
  { id: "follow", dur: 3.833, kind: "clip", clip: "v15/58279c55", from: 1.213 },                          // FOLLOW? OR LEAD?
  { id: "overtake", dur: 1.917, kind: "clip", clip: "v15/7e9b6135", from: 20.145, zoom: [1.3, 1.32] },
  // V. THE MOON
  { id: "descent", dur: 4.625, kind: "clip", clip: "v11/617c18bf", from: 0.3 },
  { id: "dust", dur: 1.375, kind: "clip", clip: "k/n14_dust", from: 0.25 },
  { id: "foot", dur: 1.916, kind: "clip", clip: "k/n14_dust", from: 1.995 },                               // the Flavor has landed
  { id: "stand", dur: 2.667, kind: "clip", clip: "v122/moon_stand", from: 0.0 },
  { id: "pole", dur: 1.167, kind: "clip", clip: "k/n28_flag", from: 8.837 },                               // the pole enters the regolith
  { id: "flagwide", dur: 3.5, kind: "clip", clip: "w/c7_flag", from: 10.5, zoom: [1.0, 1.03] },            // and only then the flag
  { id: "earthrise", dur: 5.5, kind: "clip", clip: "v15/fbfbe7c8", from: 2.6, zoom: [1.15, 1.18] },
  // VI. HOME
  { id: "orbit2", dur: 2.042, kind: "clip", clip: "v15/f84aafa8", from: 0.8, zoom: [1.35, 1.4] },
  { id: "monitors", dur: 1.291, kind: "clip", clip: "v15/n02_monitors_fix", from: 0.0 },  // k/n02_mctense from 2.655 (frame 64), both headers reset as THERABREATH ONE (scripts/fix_text.py)
  { id: "moonlaunch", dur: 1.875, kind: "clip", clip: "v15/7f36146f", from: 0.0 },
  { id: "homeward", dur: 2.209, kind: "clip", clip: "h/c11_homeward", from: 0.25 },
  { id: "reentry", dur: 1.75, kind: "clip", clip: "v15/1bba799d", from: 0.717 },
  { id: "plasma", dur: 0.875, kind: "clip", clip: "v15/e9498b9a", from: 0.333, zoom: [1.5, 1.55] },
  { id: "clouds", dur: 3.541, kind: "clip", clip: "v11/47b35301", from: 0.33 },
  { id: "nj", dur: 2.084, kind: "clip", clip: "v11/47b35301", from: 3.945 },
  { id: "forest", dur: 3.166, kind: "clip", clip: "v15/af79764b", from: 0.083, zoom: [1.4, 1.45] },
  { id: "sage", dur: 1.667, kind: "clip", clip: "v15/d061bbeb", from: 0.0 },
  { id: "campus", dur: 2.0, kind: "clip", clip: "v15/5b518a71", from: 2.82, zoom: [1.5, 1.53] },
  { id: "flagpole", dur: 2.0, kind: "clip", clip: "v15/67b0baa3", from: 1.938, zoom: [1.5, 1.52] },
  { id: "cdsign", dur: 1.958, kind: "clip", clip: "v15/5b518a71", from: 0.0 },                             // Church & Dwight, Ewing, New Jersey
  { id: "cdsky", dur: 2.334, kind: "clip", clip: "v15/5b518a71", from: 4.953 },
  { id: "hqland", dur: 6.333, kind: "clip", clip: "s11_hq", from: 3.383 },
  { id: "robot", dur: 5.0, kind: "clip", clip: "v12/g7_robot", from: 0.0 },                                // six samples
  { id: "tasting", dur: 4.0, kind: "clip", clip: "v13/t1_tasting", from: 0.0 },
  { id: "hush", dur: 0.75, kind: "black" },
  { id: "end", dur: 5.0, kind: "end" },
  { id: "black1", dur: 0.75, kind: "black" },
  // VII. THE STINGER
  { id: "stgflag", dur: 1.875, kind: "clip", clip: "v12/g9_late", from: 0.0, zoom: [1.5, 1.52], origin: "75% 75%" },
  { id: "stglate", dur: 3.125, kind: "clip", clip: "v12/g9_late", from: 2.6, zoom: [1.45, 1.47], origin: "68% 70%" },
  { id: "black2", dur: 1.0, kind: "black" },
];

// Start time of every segment
const AT: Record<string, number> = {};
let acc = 0;
for (const sg of SEGS) { AT[sg.id] = acc; acc += sg.dur; }
export const RACE15_FRAMES = f(acc);
const t = (id: string, off = 0) => AT[id] + off;

/* ---------- picture ---------- */
// a logo patch (make_sign_patch.py) moved by its per-frame track (track_sign.py). The source is 1916x1080 for some
// generators; objectFit cover scales it to 1920 wide, so the patch (drawn in source pixels) follows the same mapping
const SRC_W = 1916;
const LogoPatch: React.FC<{ p: Patch }> = ({ p }) => {
  const fr = useCurrentFrame();
  const m = p.track.frames[Math.min(fr, p.track.frames.length - 1)];
  const s = 1920 / SRC_W;
  return (
    <div style={{ position: "absolute", left: 0, top: -(1080 * s - 1080) / 2, width: SRC_W, height: 1080, transform: `scale(${s})`, transformOrigin: "0 0" }}>
      <Img src={staticFile(`race/v15/${p.img}.png`)} style={{ position: "absolute", left: 0, top: 0, width: SRC_W, height: 1080, transform: `matrix(${m.join(",")})`, transformOrigin: "0 0" }} />
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

// Location super, bottom left, mono, like a mission log, over a soft shadow of its own
export const Super15: React.FC<{ dur: number; a: string; b: string }> = ({ dur, a, b }) => {
  const fr = useCurrentFrame();
  const o = interpolate(fr, [0, 8, dur - 8, dur], [0, 1, 1, 0], clamp);
  const n = Math.floor(interpolate(fr, [3, 27], [0, a.length], clamp));
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 0 120px 120px" }}>
      <AbsoluteFill style={{ opacity: o, background: "radial-gradient(ellipse 760px 220px at 420px 925px, rgba(0,0,0,.7), rgba(0,0,0,0) 100%)" }} />
      <div style={{ position: "relative", opacity: o, color: IVORY, textShadow: "0 2px 18px rgba(0,0,0,.8)" }}>
        <div style={{ font: `600 30px ${MONO}`, letterSpacing: "0.32em" }}>{a.slice(0, n)}<span style={{ opacity: fr % 13 < 7 ? 1 : 0 }}>_</span></div>
        <div style={{ font: `500 20px ${MONO}`, letterSpacing: "0.4em", marginTop: 12, color: "#FF7A3D" }}>{b}</div>
      </div>
    </AbsoluteFill>
  );
};

// The end card, in the director's words: THE FUTURE OF FRESHNESS, then LET'S TASTE WHAT'S NEXT., then the partners
const METAL = "linear-gradient(180deg, #FFFFFF 0%, #F7EEDD 34%, #C9A46A 50%, #FFF4DE 62%, #A7834F 100%)";
export const EndCard15: React.FC<{ dur: number }> = ({ dur }) => {
  const fr = useCurrentFrame();
  const ease = Easing.bezier(0.16, 1, 0.3, 1);
  const tIn = interpolate(fr, [0, f(0.8)], [0, 1], { ...clamp, easing: ease });
  const sIn = interpolate(fr, [f(0.7), f(1.4)], [0, 1], { ...clamp, easing: ease });
  const lIn = interpolate(fr, [f(1.3), f(2.0)], [0, 1], { ...clamp, easing: ease });
  const o = interpolate(fr, [dur - f(0.9), dur], [1, 0], clamp);
  const pill: React.CSSProperties = { background: "#fff", borderRadius: 20, padding: "20px 36px", display: "flex", boxShadow: "0 10px 40px rgba(0,0,0,.45)" };
  return (
    <AbsoluteFill style={{ opacity: o, background: "#000" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 42% at 50% 50%, rgba(120,70,30,.20), rgba(0,0,0,0) 70%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: tIn, transform: `translateY(-150px) scale(${1.03 - 0.03 * tIn + interpolate(fr, [0, dur], [0, 0.02])})`, filter: `blur(${(1 - tIn) * 8}px) drop-shadow(0 0 24px rgba(255,170,90,.28))`,
          font: `800 132px/0.9 "Archivo", "Arial Narrow", sans-serif`, fontStretch: "66%", letterSpacing: "0.06em", paddingLeft: "0.06em", whiteSpace: "nowrap",
          background: METAL, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>THE FUTURE OF FRESHNESS</div>
        <div style={{ position: "absolute", top: 520, opacity: sIn, transform: `translateY(${(1 - sIn) * 14}px)`, font: `500 40px ${SANS}`, letterSpacing: "0.28em", paddingLeft: "0.28em", color: IVORY }}>LET'S TASTE WHAT'S NEXT.</div>
        <div style={{ position: "absolute", top: 660, opacity: lIn, display: "flex", alignItems: "center", gap: 52, transform: `translateY(${(1 - lIn) * 22}px)` }}>
          <div style={pill}><Img src={staticFile("img/tff-logo.png")} style={{ height: 92 }} /></div>
          <span style={{ font: `300 60px ${SANS}`, color: IVORY, opacity: 0.75 }}>×</span>
          <div style={pill}><Img src={staticFile("img/therabreath-logo.png")} style={{ height: 92 }} /></div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Film grain and a soft vignette; the director's frame is full 16:9, so no letterbox
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

export const LIGHTS15 = t("lights", 4.58);   // the first floodlight bank
export const RELIGHT15 = t("relight", 0.06); // the engines relight

export const FlavorRaceV15: React.FC = () => {
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
      <Sequence from={f(RELIGHT15)} durationInFrames={8} layout="none"><Flash warm /></Sequence>

      <Sequence from={f(t("mc1", 0.1))} durationInFrames={f(2.45)} layout="none"><Super15 dur={f(2.45)} a="MISSION CONTROL" b="THE FLAVOR FACTORY · NORCO, CALIFORNIA" /></Sequence>
      <Sequence from={f(t("pipette", 0.1))} durationInFrames={f(3.1)} layout="none"><Super15 dur={f(3.1)} a="THE FLAVOR FACTORY" b="NORCO, CALIFORNIA · FLAVOR LAB" /></Sequence>

      <Grain />
    </AbsoluteFill>
  );
};
