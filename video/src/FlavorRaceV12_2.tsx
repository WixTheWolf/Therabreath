import React from "react";
import { EpicTitle } from "./epic";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";

/* THE FLAVOR RACE · Version 12.2, the team-screening cut with the director's V12.1 notes: V12.1's story and pacing,
   with three new Seedance shots (the droplet, both rockets beyond the firing-room glass, Mission Control erupting), the
   fans showing both launch towers, a new Moon landing, V12's discovery shots and robot arm back, and a race that
   builds to the end:
   I the surprise: only macro photography of what looks like an ordinary TheraBreath bottle, a cold droplet sliding
   across the stripe, then the wide silhouette of two enormous bottles in the dark, then the stadium lights, bank,
   bank, blast: THERABREATH VS. COMPETITOR · II show off: the machinery, Mission Control, the partnership · III launch:
   the count, the burner close-up, the pad erupts, both rockets leave together, both climb past the firing-room window,
   the fans in front of both towers, back to the rockets, and silence at the edge of space · IV the race: neck and
   neck, the rival edges ahead, TheraBreath chooses to stop · V discovery: the botanicals, the lab, the prism,
   Mission Control, the transmission, the relight; Mission Control erupts, TheraBreath reels the rival in, dead
   level, the rival coughs, TheraBreath inches ahead and surges past, the rival sputters black smoke, TheraBreath
   streaks to the Moon · VI the Moon: the descent in silence, the foot, TheraBreath standing on the Moon, the pole
   goes in, and only then the wide · the late rival · VII home, the robot arm with six samples, black, TASTE THE
   FUTURE.
   No faces. Every hero shot is the locked bottle: white, short ribbed orange cap. The rival is only ever COMPETITOR.
   The timeline is a list of segments played back to back; a segment with x dissolves in over the one before. */
const FPS = 30;
const f = (sec: number) => Math.round(sec * FPS);

const SANS = '"Geist", "Helvetica Neue", Arial, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const IVORY = "#F4EDE0";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

let loaded = false;
const loadFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  [
    new FontFace("Archivo", `url(${staticFile("fonts/archivo-normal-latin.woff2")})`, { weight: "100 900", stretch: "62% 125%" }),
    new FontFace("Geist", `url(${staticFile("fonts/Geist-Variable.woff2")})`, { weight: "100 900" }),
    new FontFace("JetBrains Mono", `url(${staticFile("fonts/jetbrainsmono-latin.woff2")})`, { weight: "400 800" }),
  ].forEach((ff) => document.fonts.add(ff));
};

type Seg =
  | { id: string; dur: number; kind: "clip"; clip: string; from: number; zoom?: [number, number]; origin?: string; ty?: number; shake?: number; rate?: number; x?: number; grade?: string }
  | { id: string; dur: number; kind: "black" }
  | { id: string; dur: number; kind: "end" };

const SEGS: Seg[] = [
  // I. THE SURPRISE. Slow, deliberate macro photography of a bottle: plastic catching light, the ribbed cap, cold
  // condensation, a droplet sliding across the stripe through cold vapor, the label. Nothing that says rocket. Then the
  // wide silhouette, held. Then the lights.
  { id: "black0", dur: 1.0, kind: "black" },
  { id: "sheen", dur: 1.45, kind: "clip", clip: "v11/02b1b193", from: 0.0, rate: 0.72, zoom: [1.0, 1.04] },     // white plastic, a highlight, the cap slides in
  { id: "drops", dur: 1.9, kind: "clip", clip: "k/n01_beauty", from: 1.7, rate: 0.85, zoom: [1.0, 1.05] },       // the ribbed cap beaded with cold
  { id: "droplet", dur: 2.2, kind: "clip", clip: "v122/v122_droplet", from: 1.8, zoom: [1.0, 1.04] },           // a droplet slides down across the stripe, cold vapor drifts through
  { id: "label", dur: 1.0, kind: "clip", clip: "v11/02b1b193", from: 2.35, rate: 0.6, zoom: [1.35, 1.38], origin: "90% 46%" },  // the label; the gantry stays out of frame
  { id: "dark", dur: 2.0, kind: "clip", clip: "h/s10_reveal", from: 0.0, rate: 0.4, zoom: [1.0, 1.01] },          // two enormous shapes in the dark
  { id: "lights", dur: 7.0, kind: "clip", clip: "h/s10_reveal", from: 0.8, zoom: [1.01, 1.04] },                  // bank (+0.26), bank (+2.06), blast (+3.24), full (+5.2)
  // II. SHOW OFF. The mystery is solved, so the machinery can move quickly.
  { id: "tbpush", dur: 1.8, kind: "clip", clip: "v11/58785409", from: 0.5 },
  { id: "umbi", dur: 1.5, kind: "clip", clip: "h/c14_umbilical", from: 1.0, zoom: [1.0, 1.03] },                  // the umbilical lets go at +0.55
  { id: "frost", dur: 1.2, kind: "clip", clip: "k/n17_macro1", from: 0.3, zoom: [1.0, 1.04] },                    // frost and cold vapor on a valve
  { id: "rival", dur: 1.8, kind: "clip", clip: "h/c01_comp_close", from: 1.6 },
  { id: "bells", dur: 1.5, kind: "clip", clip: "k/n01_beauty", from: 4.05, zoom: [1.0, 1.04] },                   // the engine cluster venting
  { id: "standoff", dur: 2.6, kind: "clip", clip: "v11/cc51b641", from: 7.4 },
  { id: "mcwide", dur: 3.0, kind: "clip", clip: "h/mc_ff", from: 0.0, rate: 0.84, zoom: [1.0, 1.04] },
  { id: "partners", dur: 2.85, kind: "black" },
  // III. LAUNCH. The count drives the cuts (three, two, one), then near silence and the burner close-up: sparks, the
  // catch, the flame builds, WHUMP. Detail, then consequence: the pad erupts, both rockets leave together, both climb
  // past the firing-room window, the fans in front of both towers, and straight back to the rockets. The sound drops
  // away at the edge of space.
  { id: "padcold", dur: 1.6, kind: "clip", clip: "h/c02_pad_cold", from: 0.0, rate: 0.83, zoom: [1.0, 1.03] },
  { id: "gauge", dur: 0.9, kind: "clip", clip: "v121/gauge", from: 0.25, zoom: [1.42, 1.46], origin: "50% 2%" },          // the needle climbs; the dial lettering stays under the letterbox
  { id: "button", dur: 0.72, kind: "clip", clip: "k/n02_mctense", from: 4.06, rate: 0.75, zoom: [1.0, 1.03] },  // the glove already on the button; it cuts before the finger lifts (4.65)
  { id: "nozzle", dur: 2.25, kind: "clip", clip: "k/n18_nozzle", from: 0.3, rate: 0.8, zoom: [1.0, 1.1] },       // bloom at +2.0
  { id: "padign", dur: 1.2, kind: "clip", clip: "v11/250290ca", from: 0.4, shake: 0.0 },                          // from above: fire and vapor erupt
  { id: "liftoff", dur: 3.8, kind: "clip", clip: "v12/15046252", from: 4.2, shake: 0.05 },                        // both bottles leave the pad together
  { id: "window", dur: 2.3, kind: "clip", clip: "v122/v122_window", from: 1.6, zoom: [1.16, 1.22], origin: "50% 40%" },  // the firing room: both rockets climb past the glass
  { id: "crowd", dur: 1.7, kind: "clip", clip: "v122/fans2", from: 0.45, zoom: [1.33, 1.37], origin: "62% 58%" },  // the fans in front of both towers: shielding their eyes, then cheering
  { id: "tbfire", dur: 1.7, kind: "clip", clip: "v12/ef0019e6", from: 1.2, shake: 0.0 },                          // back to the rockets at the peak
  { id: "track", dur: 2.8, kind: "clip", clip: "v12/g1_track", from: 0.2 },
  { id: "onboard", dur: 2.0, kind: "clip", clip: "v12/g2_onboard", from: 1.0 },
  { id: "pitch", dur: 2.6, kind: "clip", clip: "v12/g10_pitch", from: 0.5 },                                       // the edge of space: silence
  // IV. THE RACE. Neck and neck; the rival sizes us up and edges ahead, never far; TheraBreath chooses to stop.
  { id: "side", dur: 2.0, kind: "clip", clip: "v11/bd357d2b", from: 0.0 },
  { id: "neck", dur: 2.6, kind: "clip", clip: "v12/g11_neck", from: 0.4 },
  { id: "rivalcu", dur: 1.2, kind: "clip", clip: "v11/bd357d2b", from: 5.4 },
  { id: "edge", dur: 1.0, kind: "clip", clip: "v11/m1_pullaway", from: 0.4, rate: 0.75 },                         // the rival edges ahead by a length, no more
  { id: "choice", dur: 2.8, kind: "clip", clip: "v13/c1_cutoff", from: 0.0, zoom: [1.0, 1.03] },                  // the engines die (+0.6 to +0.95)
  // V. DISCOVERY. What TheraBreath sees, the botanicals, the lab, one liquid macro, the prism, the aroma, the
  // formulation, Mission Control leans in and sends it, the transmission, and the relight.
  { id: "sees", dur: 2.4, kind: "clip", clip: "v11/22da0f7a", from: 1.6, x: 0.5 },
  { id: "yuzu", dur: 1.0, kind: "clip", clip: "k/n08_yuzu", from: 2.4 },
  { id: "citrus", dur: 1.8, kind: "clip", clip: "h/c05_lab_citrus", from: 2.0, zoom: [1.0, 1.04] },
  { id: "tea", dur: 0.6, kind: "clip", clip: "k/n06_tea", from: 1.2, grade: "brightness(1.3) contrast(1.05) saturate(1.2)" },
  { id: "cuke", dur: 0.7, kind: "clip", clip: "k/n04_cuke", from: 0.6 },
  { id: "rose", dur: 0.5, kind: "clip", clip: "k/n05_rose", from: 0.6, grade: "brightness(1.12) saturate(1.1)" },
  { id: "drop", dur: 2.4, kind: "clip", clip: "h/c06_lab_drop", from: 1.4, rate: 0.9 },
  { id: "prism", dur: 1.6, kind: "clip", clip: "h/c07_lab_prism", from: 1.2, zoom: [1.02, 1.08] },
  { id: "aroma", dur: 1.6, kind: "clip", clip: "h/c08_lab_aroma", from: 0.6, zoom: [1.0, 1.04] },
  { id: "cell", dur: 3.4, kind: "clip", clip: "h/c09_lab_cell", from: 0.0, zoom: [1.0, 1.04] },                    // the new flavor goes into the fuel cell
  { id: "lean", dur: 1.6, kind: "clip", clip: "h/mc_ff", from: 5.25 },
  { id: "press", dur: 1.8, kind: "clip", clip: "v12/g4_ready_txt", from: 0.6 },
  { id: "signal", dur: 2.4, kind: "clip", clip: "v11/m2_signal", from: 0.4 },
  { id: "transfer", dur: 3.0, kind: "clip", clip: "v12/g12_transfer", from: 0.5 },                                 // the flavor physically enters TheraBreath
  // THE COMEBACK. The relight, Mission Control erupts, and the race builds to the end; the cuts quicken on the score's
  // half-bars (0.75 s) until TheraBreath surges past, then the rival sputters and TheraBreath streaks to the Moon.
  { id: "life", dur: 2.55, kind: "clip", clip: "v12/g5_life", from: 0.3 },                                         // the flavor floods the bottle (+1.0)
  { id: "mcerupt", dur: 1.5, kind: "clip", clip: "v122/v122_mc_erupts", from: 1.05, zoom: [1.13, 1.16], origin: "50% 100%" },  // the team springs up, arms high; the wall sign stays under the letterbox
  { id: "throttle", dur: 1.5, kind: "clip", clip: "v12/ef0019e6", from: 8.1, zoom: [1.0, 1.04] },                // TheraBreath at full throttle
  { id: "reel", dur: 1.5, kind: "clip", clip: "v122/m1_reel", from: 0.05 },                                       // it reels the rival in: the gap closes
  { id: "level", dur: 1.5, kind: "clip", clip: "v122/850bde0e", from: 0.2 },                                       // dead level; the rival's red light, one puff
  { id: "inch", dur: 0.75, kind: "clip", clip: "v12/g11_neck", from: 3.0, zoom: [1.04, 1.06] },                  // TheraBreath's nose inches ahead
  { id: "surge", dur: 2.25, kind: "clip", clip: "v13/o1_overtake", from: 1.2 },                                   // it surges past and away
  { id: "sputter", dur: 1.5, kind: "clip", clip: "w/s6_comp", from: 6.7 },                                        // the rival sputters black smoke
  { id: "winner", dur: 2.25, kind: "clip", clip: "v13/f1_flicker", from: 0.2 },                                   // TheraBreath a bright star at the Moon; the rival flickers
  // VI. THE MOON. Cause, then effect: the descent in silence, the foot, TheraBreath standing on the Moon, the pole goes
  // into the soil, and only then the wide.
  { id: "approach", dur: 2.6, kind: "clip", clip: "v11/617c18bf", from: 0.5 },
  { id: "foot", dur: 1.7, kind: "clip", clip: "k/n14_dust", from: 2.95 },                                          // the pad meets the regolith (+0.4)
  { id: "stand", dur: 3.0, kind: "clip", clip: "v122/moon_stand", from: 0.3, zoom: [1.0, 1.02], ty: 80 },          // landed: Earth rising behind it (Seedance 7e918801)
  { id: "pole", dur: 1.95, kind: "clip", clip: "k/n28_flag", from: 8.52, zoom: [1.0, 1.03] },                     // the pole enters the soil (+0.73)
  { id: "moonwide", dur: 3.15, kind: "clip", clip: "v12/g13_moonlift", from: 0.0, rate: 0.3, zoom: [1.0, 1.02], ty: 105 },  // the planted flag, Earth behind: held (the shot is still until 0.96)
  { id: "moonlift", dur: 2.9, kind: "clip", clip: "v12/g13_moonlift", from: 0.95, zoom: [1.02, 1.035], ty: 105 },          // the engines flare and it lifts away
  { id: "gag", dur: 2.7, kind: "clip", clip: "v12/g9_late", from: 0.7 },                                           // the rival finally lands (+1.7)
  // VII. HOME. The landing at home, the robot arm with six samples, silence, black, the line.
  { id: "homeward", dur: 2.4, kind: "clip", clip: "h/c11_homeward", from: 1.0 },
  { id: "descent", dur: 2.8, kind: "clip", clip: "v11/47b35301", from: 2.5 },
  { id: "touch", dur: 4.0, kind: "clip", clip: "s11_hq", from: 3.4, shake: 3.1 },                                  // touchdown at +3.1
  { id: "robot", dur: 5.4, kind: "clip", clip: "v12/g7_robot", from: 0.0, rate: 0.92 },                            // the hatch (+1.1), the arm brings out six samples
  { id: "hush", dur: 1.0, kind: "black" },
  { id: "end", dur: 6.0, kind: "end" },
  { id: "black1", dur: 1.5, kind: "black" },
];

// Start time of every segment
const AT: Record<string, number> = {};
let acc = 0;
for (const sg of SEGS) { AT[sg.id] = acc; acc += sg.dur; }
export const RACE12_2_FRAMES = f(acc);
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
  return (
    <AbsoluteFill style={{ opacity: fade, transform: `translate(${dx}px, ${dy + (sg.ty || 0)}px) scale(${z})`, transformOrigin: sg.origin || "50% 50%", filter: sg.grade }}>
      <OffthreadVideo src={staticFile(`race/clips/${sg.clip}.mp4`)} muted startFrom={f(sg.from - (sg.x || 0))} playbackRate={sg.rate || 1} style={{ width: 1920, height: 1080, objectFit: "cover" }} />
    </AbsoluteFill>
  );
};

// One clean end card: the line resolves quietly (no slam, no embers), then TheraBreath × The Flavor Factory, large, on white
const METAL = "linear-gradient(180deg, #FFFFFF 0%, #F7EEDD 34%, #C9A46A 50%, #FFF4DE 62%, #A7834F 100%)";
const EndCard: React.FC<{ dur: number }> = ({ dur }) => {
  const fr = useCurrentFrame();
  const ease = Easing.bezier(0.16, 1, 0.3, 1);
  const tIn = interpolate(fr, [0, f(0.8)], [0, 1], { ...clamp, easing: ease });
  const lIn = interpolate(fr, [f(0.6), f(1.3)], [0, 1], { ...clamp, easing: ease });
  const o = interpolate(fr, [dur - f(0.9), dur], [1, 0], clamp);
  const pill: React.CSSProperties = { background: "#fff", borderRadius: 20, padding: "22px 40px", display: "flex", boxShadow: "0 10px 40px rgba(0,0,0,.45)" };
  return (
    <AbsoluteFill style={{ opacity: o, background: "#000" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 42% at 50% 52%, rgba(120,70,30,.20), rgba(0,0,0,0) 70%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: tIn, transform: `translateY(-112px) scale(${1.03 - 0.03 * tIn + interpolate(fr, [0, dur], [0, 0.02])})`, filter: `blur(${(1 - tIn) * 8}px) drop-shadow(0 0 24px rgba(255,170,90,.28))`,
          font: `800 150px/0.9 "Archivo", "Arial Narrow", sans-serif`, fontStretch: "66%", letterSpacing: "0.06em", paddingLeft: "0.06em", whiteSpace: "nowrap",
          background: METAL, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>TASTE THE FUTURE.</div>
        <div style={{ position: "absolute", top: 600, opacity: lIn, display: "flex", alignItems: "center", gap: 56, transform: `translateY(${(1 - lIn) * 22}px)` }}>
          <div style={pill}><Img src={staticFile("img/therabreath-logo.png")} style={{ height: 104 }} /></div>
          <span style={{ font: `300 64px ${SANS}`, color: IVORY, opacity: 0.75 }}>×</span>
          <div style={pill}><Img src={staticFile("img/tff-logo.png")} style={{ height: 104 }} /></div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Flash: React.FC<{ warm?: boolean; k?: number }> = ({ warm, k = 0.75 }) => {
  const fr = useCurrentFrame();
  return <AbsoluteFill style={{ background: warm ? "#FFB060" : "#fff", opacity: interpolate(fr, [0, 2, 9], [0, k, 0], clamp), mixBlendMode: "screen" }} />;
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

// Location super, bottom left, mono, like a mission log
const Super: React.FC<{ dur: number; a: string; b: string }> = ({ dur, a, b }) => {
  const fr = useCurrentFrame();
  const o = interpolate(fr, [0, 10, dur - 10, dur], [0, 1, 1, 0], clamp);
  const n = Math.floor(interpolate(fr, [4, 34], [0, a.length], clamp));
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 0 160px 120px" }}>
      <div style={{ opacity: o, color: IVORY, textShadow: "0 2px 18px rgba(0,0,0,.8)" }}>
        <div style={{ font: `600 30px ${MONO}`, letterSpacing: "0.32em" }}>{a.slice(0, n)}<span style={{ opacity: fr % 16 < 8 ? 1 : 0 }}>_</span></div>
        <div style={{ font: `500 20px ${MONO}`, letterSpacing: "0.4em", marginTop: 12, color: "#FF7A3D" }}>{b}</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- sound ---------- */
type Cue = { f: string; at: number; v: number; from?: number; len?: number; fadeIn?: number; fadeOut?: number };
// Two lines: the count (it drives the cuts: three on the pad, two on the gauge, one on the button) and the landing.
const VO: Cue[] = [
  { f: "v4_n_count", at: t("padcold", 0.5), v: 1 },
  { f: "v4_t_landed", at: t("foot", 0.5), v: 1 },
];
const LEN: Record<string, number> = { v4_n_count: 2.69, v4_t_landed: 3.97 };

// Effects are designed and rendered outside Remotion (video/sound, cues12_2.py) and mixed with these stems
const SFX: Cue[] = [];

// One score (ElevenLabs, composed to the V12 picture), placed in five sections, each on the score's own clock
// (film = file + S), so nothing is time-stretched:
// 1. its dark opening drone wakes on the first light bank and swells under the blast; it stops on the cut to the cold
//    pad, so the count, the burner and the WHUMP play in silence;
// 2. the lift-off section starts in the pad eruption; its swell peaks (36.0 s) as both rockets clear the pad, and it
//    winds down with TheraBreath's engines;
// 3. the glass section rises under the discovery and lands its return (103.4 s) as the flavor floods the bottle; its
//    drive carries the comeback, the race cuts sit on its half-bars, and it is cut off (with a long throw) on the
//    descent to the Moon at 117.7 s;
// 4. it comes back at 119.55 s, rising gently on the wide, so its last accent (127.3 s) lands on the rival's late
//    landing; it warms for home and fades under the robot arm, gone before the black;
// 5. the final gesture (150.0 s) lands on TASTE THE FUTURE and its decay carries the card to black.
// The silences inside a section (the edge of space, the engines dying, the descent) are carved in the mix:
// sound/events12_2.py, MUSIC_CUTS.
export const LIFE122 = t("life", 1.0);   // the flavor floods the bottle
const S1 = t("lights", 0.24), S2 = t("liftoff", 0.3) - 36.0, S3 = LIFE122 - 103.4, S3b = t("moonwide") - 119.55, S4 = t("end", 0.35) - 150.0;
const sec = (at: number, until: number, S: number, fadeIn: number, fadeOut: number): Cue =>
  ({ f: "v12_flavor_score", at, from: at - S, v: 0.95, len: until - at, fadeIn, fadeOut });
const MUSIC: Cue[] = [
  sec(S1, t("padcold", 0.3), S1, 0.1, 0.3),
  sec(t("padign", 0.15), t("choice", 2.2), S2, 0.25, 0.6),
  sec(t("sees", -0.5), t("approach", 1.4), S3, 2.0, 1.2),
  sec(t("moonwide", -0.1), t("robot", 3.6), S3b, 2.2, 1.6),
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

export const FlavorRaceV12_2: React.FC<{ stem?: string }> = ({ stem = "all" }) => {
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

      <Sequence from={f(t("lights", 3.24))} durationInFrames={9} layout="none"><Flash k={0.35} /></Sequence>
      <Sequence from={f(t("padign"))} durationInFrames={9} layout="none"><Flash /></Sequence>
      <Sequence from={f(LIFE122)} durationInFrames={10} layout="none"><Flash warm /></Sequence>

      <Sequence from={f(t("standoff", 0.1))} durationInFrames={f(2.5)} layout="none"><EpicTitle lines={["THE FLAVOR RACE"]} dur={f(2.5)} size={230} over hold /></Sequence>
      <Sequence from={f(t("mcwide", 0.2))} durationInFrames={f(2.8)} layout="none"><Super dur={f(2.8)} a="NORCO, CALIFORNIA" b="THE FLAVOR FACTORY · MISSION CONTROL" /></Sequence>
      <Sequence from={f(t("partners"))} durationInFrames={f(2.85)} layout="none"><EpicTitle lines={["THERABREATH + THE FLAVOR FACTORY", "ONE MISSION: WHAT'S NEXT."]} dur={f(2.85)} size={104} /></Sequence>
      <Sequence from={f(t("citrus", 0.1))} durationInFrames={f(2.6)} layout="none"><Super dur={f(2.6)} a="THE FLAVOR FACTORY" b="FLAVOR LAB" /></Sequence>
      <Sequence from={f(t("touch", 0.3))} durationInFrames={f(2.8)} layout="none"><Super dur={f(2.8)} a="EWING, NEW JERSEY" b="1847 HOURS" /></Sequence>

      <Grain />

      {(stem === "all" || stem === "music") && MUSIC.map((c, i) => <CueAudio key={`m${i}`} c={c} duck />)}
      {(stem === "all" || stem === "sfx") && SFX.map((c, i) => <CueAudio key={`x${i}`} c={c} />)}
      {(stem === "all" || stem === "vo") && VO.map((c, i) => <CueAudio key={`v${i}`} c={c} />)}
    </AbsoluteFill>
  );
};
