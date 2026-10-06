import React from "react";
import { EpicTitle } from "./epic";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";

/* THE FLAVOR RACE · Version 9.
   Told the way Pixar tells a story: almost wordless, carried by picture and one continuous score.
   The rockets first: a slow reveal on the pad, the hero, then the rival beside it. Then Flavor Control polls the room
   (one pause too long on Sweetness), the count, the big red button, and ignition. It raced the rival side by side, until the rival pulled ahead.
   So Flavor Control went looking for something new, from everywhere on Earth. Because of that, TheraBreath One
   found a new burn, the rival smoked out and fell behind, and the Flavor landed first. Then it came home to be tasted.
   A handful of radio lines, most of them jokes. No faces. Every hero shot is the locked bottle: white, short ribbed orange cap.
   The timeline is a list of segments played back to back; a segment with x dissolves in over the one before. */
const FPS = 30;
const f = (sec: number) => Math.round(sec * FPS);

const MONUMENT = '"Archivo", "Arial Narrow", sans-serif'; // condensed theatrical titles
const SANS = '"Geist", "Helvetica Neue", Arial, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const IVORY = "#F4EDE0";
const ease = Easing.bezier(0.2, 0.7, 0.1, 1);
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
  | { id: string; dur: number; kind: "clip"; clip: string; from: number; zoom?: [number, number]; shake?: number; rate?: number; x?: number; grade?: string; bright?: [number, number][]; smoke?: number; soft?: number }
  | { id: string; dur: number; kind: "black" }
  | { id: string; dur: number; kind: "card"; lines: string[]; size?: number; slam?: boolean }
  | { id: string; dur: number; kind: "logos" }
  | { id: string; dur: number; kind: "end" };

const SEGS: Seg[] = [
  // I. MACRO: we do not know what we are looking at. Sheen on white plastic, cap ribs, droplets, a cap against the night.
  // (no logo text in any macro: it is saved for the reveal)
  { id: "black0", dur: 1.0, kind: "black" },
  { id: "macro1", dur: 1.6, kind: "clip", clip: "s01_macro", from: 0.0, rate: 0.55, zoom: [1.0, 1.04] },
  { id: "capmacro", dur: 2.0, kind: "clip", clip: "k/n01_beauty", from: 1.85, rate: 0.6, zoom: [1.0, 1.04] },
  { id: "macro3", dur: 1.8, kind: "clip", clip: "w/c1_tease", from: 8.0, rate: 0.6, zoom: [1.0, 1.03] },
  { id: "macro4", dur: 1.6, kind: "clip", clip: "v_cap", from: 8.4, rate: 0.6, zoom: [1.0, 1.04] },
  { id: "dip", dur: 0.5, kind: "black" },
  // II. THE REVEAL, one held take: two silhouettes in the dark, then the stadium lights slam on bank by bank
  { id: "dark", dur: 2.5, kind: "clip", clip: "h/s10_reveal", from: 0.0, rate: 0.4, zoom: [1.0, 1.012] },
  { id: "reveal", dur: 8.6, kind: "clip", clip: "h/s10_reveal", from: 1.0, zoom: [1.012, 1.05] },
  { id: "rival", dur: 2.0, kind: "clip", clip: "h/c01_comp_close", from: 0.0, rate: 0.9 },  // the COMPETITOR, floodlit
  // the plant: one bolt backed out of the rival's hull
  { id: "plant", dur: 1.5, kind: "clip", clip: "h/s02_screw_loose", from: 2.0, zoom: [1.0, 1.04] },
  { id: "title", dur: 3.2, kind: "clip", clip: "v_reveal", from: 6.7 },
  // FLAVOR CONTROL: the roll call, on a metronome. Aroma, go. Sweetness, go. Cooling, go. Finish, go.
  { id: "mcwide", dur: 3.5, kind: "clip", clip: "v_mc", from: 0.2, zoom: [1.0, 1.04], grade: "sepia(0.28) saturate(1.45) hue-rotate(-6deg) brightness(1.04)" },
  // READY is composited onto the blank button in the clip itself (tracked, masked under the finger); cut on the touch
  { id: "tablet", dur: 2.2, kind: "clip", clip: "h/s11_tablet_ready_txt", from: 0.0, rate: 0.77, zoom: [1.0, 1.03] },
  { id: "lean", dur: 2.2, kind: "clip", clip: "v_mc", from: 4.4, zoom: [1.04, 1.1], grade: "sepia(0.28) saturate(1.45) hue-rotate(-6deg) brightness(1.04)" },
  { id: "gauge1", dur: 1.6, kind: "clip", clip: "k3b_ignite", from: 0.3, zoom: [1.0, 1.05] },  // pressure rising
  { id: "gauge2", dur: 2.8, kind: "clip", clip: "k3a_ignite", from: 0.0, rate: 0.75, zoom: [1.0, 1.06] },
  // go for flavor, three, two, one: one slow push on the pad, then the button, then silence
  { id: "padgo", dur: 2.9, kind: "clip", clip: "h/c02_pad_cold", from: 0.0, zoom: [1.0, 1.03] },  // still on the pad, engines cold, vapor venting
  { id: "count", dur: 1.9, kind: "clip", clip: "h/s10_reveal", from: 6.0, rate: 1.1, zoom: [1.02, 1.06] },  // the lit hero wide again, nothing moving yet
  // on "one" the fuel umbilical snaps off the hull in a burst of cryo vapor (upper hull held soft: focus on the connector)
  { id: "umbi", dur: 1.3, kind: "clip", clip: "h/c14_umbilical", from: 1.15, zoom: [1.0, 1.03], soft: 0.33 },
  { id: "button", dur: 0.6, kind: "clip", clip: "k/n02_mctense", from: 4.02, zoom: [1.0, 1.05] },
  { id: "spark", dur: 1.3, kind: "clip", clip: "k/n18_nozzle", from: 0.0, zoom: [1.0, 1.08] },
  { id: "hush", dur: 1.0, kind: "black" },
  // III. LIFTOFF: on the pad from above, then off the pad at ground level, then up through the clouds
  { id: "bell", dur: 2.1, kind: "clip", clip: "w/s4_ignite", from: 3.0, shake: 0.25 },
  { id: "thunder", dur: 4.8, kind: "clip", clip: "w/s4_ignite", from: 0.0, rate: 0.6, shake: 0, smoke: 3.3 },  // held until the smoke wipes the frame
  { id: "topdown", dur: 1.7, kind: "clip", clip: "v_clouds", from: 0.6, zoom: [1.0, 1.05] },
  { id: "lift", dur: 4.5, kind: "clip", clip: "s02_launch", from: 5.3, shake: 0 },
  { id: "breach", dur: 2.6, kind: "clip", clip: "w/s4_ignite", from: 11.8 },
  { id: "climb", dur: 3.4, kind: "clip", clip: "v_clouds", from: 6.0, x: 0.6 },
  // IV. ORBIT: the engines cut, a breath, a long drift over the Earth, then a relight and the race is on
  { id: "burn", dur: 1.9, kind: "clip", clip: "w/s8_teams", from: 10.4 },
  { id: "hull", dur: 2.1, kind: "clip", clip: "h/c04_burner_cut", from: 0.3, zoom: [1.0, 1.03] },  // the burners throttle down and go dark
  { id: "float", dur: 2.5, kind: "clip", clip: "w/x_drift", from: 4.1, x: 0.6, zoom: [1.0, 1.02] },
  { id: "reignite", dur: 1.6, kind: "clip", clip: "w/x_drift", from: 9.1 },
  { id: "race", dur: 3.04, kind: "clip", clip: "w/c4_race", from: 0.5 },
  // one continuous shot: side by side, then the rival shoulders in close and pushes past
  { id: "shoulder", dur: 6.76, kind: "clip", clip: "s03_orbit", from: 1.64 },
  // V. THE FLAVOR FACTORY LAB: the ingredients, quickly, then made into clear liquid flavor and sealed
  { id: "yuzu", dur: 0.6, kind: "clip", clip: "k/n08_yuzu", from: 2.4 },
  { id: "rose", dur: 0.5, kind: "clip", clip: "k/n05_rose", from: 0.6, grade: "brightness(1.12) saturate(1.1)" },
  { id: "tea", dur: 0.5, kind: "clip", clip: "k/n06_tea", from: 1.2, grade: "brightness(1.3) contrast(1.05) saturate(1.2)" },
  { id: "cuke", dur: 0.5, kind: "clip", clip: "k/n04_cuke", from: 0.6 },
  { id: "dropper", dur: 1.5, kind: "clip", clip: "h/c05_lab_citrus", from: 2.0, zoom: [1.0, 1.04] },  // citrus oil misting into clear liquid
  { id: "drip", dur: 1.4, kind: "clip", clip: "h/c06_lab_drop", from: 1.5, rate: 0.9 },  // one clear drop, ripples bending the light
  { id: "swirl", dur: 1.6, kind: "clip", clip: "h/c08_lab_aroma", from: 0.6, zoom: [1.0, 1.04] },  // the aroma takes shape: mint, then citrus
  { id: "canister", dur: 1.2, kind: "clip", clip: "h/c07_lab_prism", from: 1.2, zoom: [1.02, 1.08] },  // light through the clear flavor
  { id: "clamp", dur: 1.1, kind: "clip", clip: "h/c09_lab_cell", from: 2.3, zoom: [1.0, 1.04] },  // sealed into the fuel cell, frost blooms
  // the flavors go up from the lab, ring the Earth and stream out to TheraBreath One
  { id: "launchI", dur: 1.5, kind: "clip", clip: "v_ingr", from: 0.3 },
  { id: "ring", dur: 3.0, kind: "clip", clip: "k/n29_earth", from: 10.6, x: 0.3 },
  { id: "through", dur: 2.6, kind: "clip", clip: "w/x_globe", from: 2.2 },
  // VI. A SCREW WORKS LOOSE: the relight, a bolt backing out of the amber hull, the sputter, the smoke, the bang
  { id: "relight", dur: 1.4, kind: "clip", clip: "w/x_reentrypov", from: 9.7, zoom: [1.08, 1.0] },
  { id: "bolt", dur: 1.9, kind: "clip", clip: "k/n03_bolt", from: 0.3, zoom: [1.0, 1.06] },
  { id: "sputter", dur: 2.6, kind: "clip", clip: "w/s6_comp", from: 6.0, zoom: [1.0, 1.05] },
  { id: "smoke", dur: 2.3, kind: "clip", clip: "w/c5_comp", from: 0.3 },
  { id: "flare", dur: 1.4, kind: "clip", clip: "w/s6_comp", from: 8.9 },
  { id: "boom", dur: 1.9, kind: "clip", clip: "s04_boom", from: 4.9, shake: 0.2 },
  { id: "adrift", dur: 2.5, kind: "clip", clip: "w/s6_comp", from: 12.1 },
  { id: "tomoon", dur: 2.4, kind: "clip", clip: "v_break", from: 7.1 },
  // VII. THE FLAVOR HAS LANDED
  { id: "approach", dur: 2.6, kind: "clip", clip: "v_moonfall", from: 0.6, x: 0.5 },
  { id: "land", dur: 4.2, kind: "clip", clip: "w/c7_flag", from: 0.0 },
  // two equal macro beats: the foot coming down, then pressing into the dust
  { id: "footA", dur: 0.9, kind: "clip", clip: "k/n14_dust", from: 2.9 },
  { id: "footB", dur: 0.9, kind: "clip", clip: "k/n14_dust", from: 4.1 },
  { id: "flag", dur: 6.2, kind: "clip", clip: "w/c7_flag", from: 6.0, zoom: [1.0, 1.05] },
  { id: "earthrise", dur: 5.6, kind: "clip", clip: "h/c10_earthrise", from: 0.8, rate: 0.6, x: 0.8, zoom: [1.0, 1.05] },
  // VIII. HOME
  { id: "liftoff", dur: 2.5, kind: "clip", clip: "w/s8_teams", from: 0.1, shake: 0.1 },
  { id: "homeward", dur: 2.1, kind: "clip", clip: "h/c11_homeward", from: 1.3 },
  { id: "reentry", dur: 2.75, kind: "clip", clip: "w/x_reentrypov", from: 0.1, shake: 0 },
  { id: "descent", dur: 2.95, kind: "clip", clip: "k/n11_nj1", from: 1.8 },
  { id: "touchhome", dur: 3.2, kind: "clip", clip: "s11_hq", from: 1.2 },
  { id: "hatch", dur: 3.2, kind: "clip", clip: "s12_hatch", from: 2.6, zoom: [1.0, 1.06] },
  { id: "tray", dur: 4.4, kind: "clip", clip: "s12b_tray", from: 0.6 },
  { id: "cups", dur: 3.0, kind: "clip", clip: "w/x_tray", from: 10.2 },
  { id: "end", dur: 4.6, kind: "end" },
  // post-credit: the screw drifts into the lens (NEW SHOT slot; stand-in is the floating bolt)
  { id: "postblack", dur: 0.8, kind: "black" },
  { id: "screw", dur: 2.6, kind: "clip", clip: "h/s99_screw_drift", from: 1.4, zoom: [1.0, 1.2] },
];

// Start time of every segment
const AT: Record<string, number> = {};
let acc = 0;
for (const sg of SEGS) { AT[sg.id] = acc; acc += sg.dur; }
export const RACE9_FRAMES = f(acc);
const t = (id: string, off = 0) => AT[id] + off;

/* ---------- picture ---------- */
const ClipLayer: React.FC<{ sg: Extract<Seg, { kind: "clip" }> }> = ({ sg }) => {
  const fr = useCurrentFrame();
  const dur = f(sg.dur + (sg.x || 0));
  const fade = sg.x ? interpolate(fr, [0, f(sg.x)], [0, 1], clamp) : 1;
  const [z0, z1] = sg.zoom || [1.0, 1.035];
  // stadium lights: brightness steps keyed in seconds from the cut
  const br = sg.bright ? interpolate(fr - f(sg.x || 0), sg.bright.map(([s]) => f(s)), sg.bright.map(([, v]) => v), clamp) : null;
  const filter = [sg.grade, br !== null ? `brightness(${br})` : ""].filter(Boolean).join(" ") || undefined;
  const z = interpolate(fr, [0, dur], [z0, z1]);
  let dx = 0, dy = 0;
  if (sg.shake !== undefined) {
    const k = fr - f(sg.shake + (sg.x || 0));
    const amp = k < 0 ? 0 : 16 * Math.exp(-k / 26);
    dx = Math.sin(k * 2.3) * amp; dy = Math.cos(k * 3.1) * amp;
  }
  return (
    <AbsoluteFill style={{ opacity: fade, transform: `translate(${dx}px, ${dy}px) scale(${z})`, filter }}>
      <OffthreadVideo src={staticFile(`race/clips/${sg.clip}.mp4`)} muted startFrom={f(sg.from - (sg.x || 0))} playbackRate={sg.rate || 1} style={{ width: 1920, height: 1080, objectFit: "cover" }} />
      {sg.soft !== undefined && (
        <AbsoluteFill style={{ filter: "blur(10px)", maskImage: `linear-gradient(to bottom, black 0%, black ${sg.soft * 100}%, transparent ${(sg.soft + 0.07) * 100}%)`, WebkitMaskImage: `linear-gradient(to bottom, black 0%, black ${sg.soft * 100}%, transparent ${(sg.soft + 0.07) * 100}%)` }}>
          <OffthreadVideo src={staticFile(`race/clips/${sg.clip}.mp4`)} muted startFrom={f(sg.from - (sg.x || 0))} playbackRate={sg.rate || 1} style={{ width: 1920, height: 1080, objectFit: "cover" }} />
        </AbsoluteFill>
      )}
      {sg.smoke !== undefined && <SmokeWipe p={interpolate(fr, [f(sg.smoke + (sg.x || 0)), dur], [0, 1], clamp)} k={fr} />}
    </AbsoluteFill>
  );
};

// exhaust smoke rolling in from both sides and the floor until it fills the frame (continues the smoke already in the shot)
const SMOKE = "250,236,216";
const SmokeWipe: React.FC<{ p: number; k: number }> = ({ p, k }) => {
  if (p <= 0) return null;
  const e = Easing.inOut(Easing.quad)(p);
  // billows: [start x, start y, end x, end y, radius scale]; all rise from the floor and the sides
  const B: [number, number, number, number, number][] = [
    [-200, 1000, 300, 700, 1.0], [2120, 980, 1620, 690, 1.0], [400, 1300, 640, 760, 0.9], [1520, 1300, 1300, 740, 0.9],
    [960, 1400, 960, 620, 1.1], [-260, 640, 420, 420, 0.8], [2180, 620, 1500, 400, 0.8], [960, 1500, 960, 300, 1.3],
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {B.map(([x0, y0, x1, y1, sc], i) => {
        const q = interpolate(e, [i * 0.05, Math.min(1, 0.55 + i * 0.06)], [0, 1], clamp);
        const r = (220 + 900 * q) * sc;
        const x = x0 + (x1 - x0) * q + Math.sin(k / 10 + i * 1.7) * 26, y = y0 + (y1 - y0) * q + Math.cos(k / 13 + i) * 18;
        return <div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", opacity: Math.min(1, q * 1.6),
          background: `radial-gradient(circle, rgba(${SMOKE},1) 0%, rgba(${SMOKE},0.85) 35%, rgba(${SMOKE},0) 70%)`, filter: "blur(30px)" }} />;
      })}
      <AbsoluteFill style={{ background: `rgb(${SMOKE})`, opacity: interpolate(p, [0.72, 1], [0, 1], clamp) }} />
    </AbsoluteFill>
  );
};

// Monumental theatrical title: condensed, enormous, generous tracking
const Card: React.FC<{ lines: string[]; size?: number; dur: number; slam?: boolean }> = ({ lines, size = 220, dur, slam }) => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [0, slam ? 1 : 6, dur - (slam ? 3 : 6), dur], [0, 1, 1, 0], clamp);
  const sc = slam ? interpolate(fr, [0, 5], [1.12, 1], { ...clamp, easing: ease }) : interpolate(fr, [0, dur], [1.0, 1.035]);
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: a, transform: `scale(${sc})`, textAlign: "center", color: IVORY }}>
        {lines.map((l) => (
          <div key={l} style={{ font: `800 ${size}px/0.92 ${MONUMENT}`, fontStretch: "68%", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{l}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const TasteSign: React.FC<{ dur: number }> = ({ dur }) => {
  const fr = useCurrentFrame();
  const rot = interpolate(fr, [6, 22], [88, 0], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 190, perspective: 1400 }}>
      <div style={{ transform: `rotateY(${rot}deg)`, background: "#fff", color: "#0B2236", padding: "22px 54px 26px", borderRadius: 6, borderTop: "10px solid #F58025", boxShadow: "0 30px 80px rgba(0,0,0,.45)" }}>
        <div style={{ font: `700 64px ${SANS}`, letterSpacing: "0.06em" }}>WOULD YOU LIKE TO TASTE IT?</div>
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ dur: number }> = ({ dur }) => {
  const fr = useCurrentFrame();
  const b = interpolate(fr, [f(1.2), f(1.7)], [0, 1], clamp);
  const o = interpolate(fr, [dur - f(0.8), dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <EpicTitle lines={["TASTE THE FUTURE."]} dur={dur} size={196} y={-60} hold />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: b, display: "flex", alignItems: "center", gap: 34, marginTop: 300, transform: `translateY(${(1 - b) * 24}px)` }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "16px 28px", display: "flex" }}><Img src={staticFile("img/therabreath-logo.png")} style={{ height: 58 }} /></div>
          <span style={{ font: `300 50px ${SANS}`, color: IVORY, opacity: 0.7 }}>×</span>
          <div style={{ background: "#fff", borderRadius: 14, padding: "16px 28px", display: "flex" }}><Img src={staticFile("img/tff-logo.png")} style={{ height: 58 }} /></div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Flash: React.FC<{ warm?: boolean }> = ({ warm }) => {
  const fr = useCurrentFrame();
  return <AbsoluteFill style={{ background: warm ? "#FFB060" : "#fff", opacity: interpolate(fr, [0, 2, 9], [0, 0.75, 0], clamp), mixBlendMode: "screen" }} />;
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

// Two teams, one mission: the real logos, unaltered, on white plates
const Logos: React.FC<{ dur: number }> = ({ dur }) => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [0, 8, dur - 8, dur], [0, 1, 1, 0], clamp);
  const up = interpolate(fr, [6, 18], [30, 0], { ...clamp, easing: ease });
  const plate: React.CSSProperties = { background: "#fff", borderRadius: 14, padding: "18px 30px", display: "flex" };
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", opacity: a }}>
      <div style={{ font: `800 150px/0.95 ${MONUMENT}`, fontStretch: "68%", letterSpacing: "0.04em", color: IVORY, textAlign: "center" }}>TWO TEAMS.<br />ONE MISSION.</div>
      <div style={{ display: "flex", alignItems: "center", gap: 34, marginTop: 56, transform: `translateY(${up}px)` }}>
        <div style={plate}><Img src={staticFile("img/therabreath-logo.png")} style={{ height: 64 }} /></div>
        <span style={{ font: `300 54px ${SANS}`, color: IVORY, opacity: 0.7 }}>×</span>
        <div style={plate}><Img src={staticFile("img/tff-logo.png")} style={{ height: 64 }} /></div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- sound ---------- */
type Cue = { f: string; at: number; v: number; from?: number; len?: number; fadeIn?: number; fadeOut?: number; auto?: [number, number][] };
// A handful of lines, most of them jokes: the go / no-go poll, the count, the landing, the meaning,
// the rival's understatement, and Norco at the very end, who is absolutely not crying
// The roll call runs on a one-second metronome: the call, then each "Go" on the beat
const G0 = t("mcwide", 4.3);
const VO: Cue[] = [
  { f: "v4_f_aroma", at: t("mcwide", 0.1), v: 1 },
  { f: "v4_r_aroma", at: G0, v: 0.95 },
  { f: "v4_f_sweet", at: G0 + 0.9, v: 1.15 },
  { f: "v4_r_sweet_go", at: G0 + 2.0, v: 1.3 },
  { f: "v4_f_cooling", at: G0 + 2.95, v: 1.05 },
  { f: "v4_r_aroma", at: G0 + 4.0, v: 0.9 },
  { f: "v4_f_finish", at: G0 + 4.9, v: 1.05 },
  // one empty beat, a shuffle of paper, then the go
  { f: "v4_r_finish_go", at: G0 + 7.0, v: 1.1 },
  { f: "v4_f_goflavor", at: G0 + 8.0, v: 1 },
  { f: "v4_n_count", at: t("count", 0.25), v: 1 },
  { f: "v4_c_ideal", at: t("adrift", 0.3), v: 1 },
  { f: "v4_t_landed", at: t("footA", -0.9), v: 1 },
  { f: "v4_f_together", at: t("earthrise", 0.7), v: 1 },
  { f: "v4_n_menthol", at: t("tray", 1.3), v: 1.1 },
];
const LEN: Record<string, number> = {
  v4_f_aroma: 4.04, v4_r_aroma: 0.4, v4_f_sweet: 1.34, v4_r_sweet: 1.62, v4_f_goflavor: 3.14, v4_n_count: 2.64,
  v4_c_ideal: 3.12, v4_t_landed: 3.94, v4_f_together: 5.74, v4_n_menthol: 3.26,
  v4_r_sweet_go: 0.28, v4_r_finish_go: 0.55, v4_f_cooling: 0.54, v4_f_finish: 0.96,
};
const RADIO = VO.filter((c) => ["v4_c_ideal", "v4_t_landed"].includes(c.f));

// Sound design: every effect has a tail or a fade, nothing starts or stops dead
const SFX: Cue[] = [
  // I. the mystery: a cold drone, a tick, single drops; no music
  { f: "x_turbo_bed", at: t("black0", 0.1), v: 0.11, len: t("reveal", 3.0) - t("black0", 0.1), fadeIn: 2.0, fadeOut: 0.6 },
  { f: "x_tick", at: t("macro1", 0.2), v: 0.1, len: t("dark", 0.4) - t("macro1", 0.2), fadeIn: 1.2, fadeOut: 0.5 },
  { f: "x_breath", at: t("macro1", 0.1), v: 0.16, len: 4.0, fadeIn: 0.6, fadeOut: 1.0 },
  { f: "x4_drip", at: t("black0", 0.6), v: 0.4 },
  { f: "mn_sfx_cap", at: t("capmacro", 0.9), v: 0.35 },
  { f: "x4_drip", at: t("macro3", 0.9), v: 0.45 },
  { f: "x4_drip", at: t("macro4", 1.0), v: 0.3 },
  { f: "x4_heart", at: t("dip", 0.1), v: 0.45 },
  // II. the dark pad: wind and space, a heartbeat, a relay clunk, then the lights bank by bank, the last the loudest
  { f: "x_space_bed", at: t("dark"), v: 0.3, len: t("rival") - t("dark"), fadeIn: 0.8, fadeOut: 0.5 },
  { f: "x4_heart", at: t("dark", 1.1), v: 0.35 },
  { f: "x4_clamp", at: t("dark", 2.0), v: 0.55 },
  { f: "x_flood", at: t("reveal", 0.04), v: 0.65 },
  { f: "x_flood", at: t("reveal", 1.84), v: 0.8 },
  { f: "x_flood", at: t("reveal", 3.02), v: 0.95 },
  { f: "x_subboom", at: t("reveal", 3.04), v: 0.7 },
  { f: "x_braam", at: t("reveal", 3.02), v: 0.55 },
  // the plant: barely there
  { f: "x_tink", at: t("plant", 0.7), v: 0.18 },
  { f: "x_braam", at: t("title", -0.05), v: 0.7 },
  { f: "x_subboom", at: t("title"), v: 0.6 },
  // Flavor Control: room tone and a relay click on every beat of the roll call
  { f: "amb", at: t("mcwide", -0.3), v: 0.24, len: t("padgo", 0.4) - t("mcwide", -0.3), fadeIn: 0.4, fadeOut: 0.4 },
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({ f: "x_metro", at: G0 + i - 0.02, v: 0.3 })),
  { f: "mn_sfx_paper", at: G0 + 6.3, v: 0.4 },
  { f: "x_beep1", at: t("tablet", 2.17), v: 0.22 },
  // three, two, one: a heartbeat under each number, the button, the spark, then nothing
  ...[0, 1, 2].map((i) => ({ f: "x4_heart", at: t("count", 0.35 + i * 0.95), v: 0.75 })),
  { f: "x_space_bed", at: t("padgo"), v: 0.25, len: t("hush") - t("padgo"), fadeIn: 0.6, fadeOut: 0.2 },
  { f: "x4_clamp", at: t("umbi", 0.36), v: 0.7 },
  { f: "x_vent", at: t("umbi", 0.38), v: 0.55 },
  { f: "x4_switch", at: t("button", 0.12), v: 0.95 },
  { f: "x_static", at: t("spark", 0.4), v: 0.25, len: 0.8, fadeIn: 0.3, fadeOut: 0.1 },
  // III. liftoff
  { f: "ignite", at: t("bell"), v: 0.65, len: 9, fadeOut: 2.5 },
  // the exhaust cloud swallows the frame: a rising rush, then the wall of smoke hits
  { f: "x4_whoosh", at: t("thunder", 3.2), v: 0.75 },
  { f: "x_whoomph", at: t("thunder", 4.7), v: 0.85 },
  { f: "x_subboom", at: t("topdown", 0.0), v: 0.5 },
  { f: "x_subboom", at: t("bell", 0.15), v: 0.6 },
  { f: "x_subboom", at: t("topdown", 0.6), v: 0.4 },
  { f: "ignite", at: t("lift"), v: 0.45, from: 1.5, len: 4.6, fadeIn: 0.2, fadeOut: 1.5 },
  { f: "flyby", at: t("breach", 0.2), v: 0.35 },
  { f: "x_space_bed", at: t("climb", 0.6), v: 0.5, len: t("burn") - t("climb", 0.6), fadeIn: 1.2, fadeOut: 0.3 },
  // IV. orbit: the engines choke off, a long exhale, the hull ticks over the Earth, then the relight
  { f: "ignite", at: t("burn"), v: 0.4, from: 3, len: 2.0, fadeIn: 0.2, fadeOut: 0.15 },
  { f: "x_cutoff", at: t("hull", -0.35), v: 0.8 },
  { f: "x_breath", at: t("hull", 0.5), v: 0.32, len: 2.6, fadeIn: 0.4, fadeOut: 1.2 },
    { f: "sputter", at: t("float", 1.4), v: 0.28, len: 0.9, fadeOut: 0.4 },
  { f: "x_space_bed", at: t("hull", 0.3), v: 0.4, len: t("race", 0.5) - t("hull", 0.3), fadeIn: 1.0, fadeOut: 0.6 },
  { f: "x4_refuel", at: t("reignite", -0.3), v: 0.7 },
  { f: "ignite", at: t("reignite", 0.35), v: 0.55, len: 3.0, fadeIn: 0.05, fadeOut: 1.2 },
  { f: "x_subboom", at: t("reignite", 0.4), v: 0.55 },
  // the race
  { f: "flyby", at: t("race", 0.4), v: 0.3 },
  { f: "ignite", at: t("race"), v: 0.22, from: 2.5, len: t("yuzu", 0.3) - t("race"), fadeIn: 1.0, fadeOut: 1.0 },
  { f: "flyby", at: t("shoulder", 1.2), v: 0.28 },
  { f: "flyby", at: t("shoulder", 3.9), v: 0.6 },
  { f: "mn_sfx_fanfare", at: t("shoulder", 4.1), v: 0.55 },
  { f: "x4_whoosh", at: t("shoulder", 5.4), v: 0.5 },
  // V. the lab: quick ingredient hits, then glass, drops and a sealed canister
  { f: "x4_whoosh", at: t("yuzu", -0.1), v: 0.2 },
  { f: "x4_whoosh", at: t("tea", -0.1), v: 0.16 },
  { f: "amb", at: t("dropper", -0.2), v: 0.2, len: t("launchI") - t("dropper", -0.2), fadeIn: 0.3, fadeOut: 0.3 },
  { f: "x_breath", at: t("dropper", 0.2), v: 0.16, len: 1.3, fadeIn: 0.2, fadeOut: 0.5 },
  { f: "x4_drip", at: t("drip", 0.9), v: 0.5 },
  { f: "x_breath", at: t("swirl", 0.0), v: 0.18, len: 1.4, fadeIn: 0.3, fadeOut: 0.6 },
  { f: "x_tink", at: t("canister", 0.3), v: 0.22 },
  { f: "x4_clamp", at: t("clamp", 0.35), v: 0.55 },
  { f: "x4_whoosh", at: t("launchI", 0.0), v: 0.35 },
  { f: "x_space_bed", at: t("launchI"), v: 0.4, len: t("relight") - t("launchI"), fadeIn: 0.6, fadeOut: 0.6 },
  { f: "x_subboom", at: t("ring", 0.2), v: 0.4 },
  { f: "x4_whoosh", at: t("through", -0.2), v: 0.3 },
  { f: "x4_refuel", at: t("relight", -0.3), v: 0.8 },
  { f: "ignite", at: t("relight", 0.15), v: 0.6, len: 3.0, fadeOut: 1.2 },
  { f: "x_subboom", at: t("relight", 0.2), v: 0.6 },
  // VI. the screw, the sputter, the smoke, the bang, and the understatement
  { f: "servo", at: t("bolt", 0.0), v: 0.6 },
  { f: "x_tink", at: t("bolt", 1.2), v: 0.8 },
  { f: "x_beep1", at: t("sputter", 0.2), v: 0.55 },
  { f: "sputter", at: t("sputter", 0.5), v: 0.6 },
  { f: "sputter", at: t("smoke", 0.6), v: 0.4, fadeOut: 1 },
  { f: "x4_alarm", at: t("smoke", 0.4), v: 0.12, len: 2.2, fadeIn: 0.3, fadeOut: 0.6 },
  { f: "x_space_bed", at: t("sputter", 0.4), v: 0.35, len: t("tomoon") - t("sputter", 0.4), fadeIn: 1.2, fadeOut: 0.8 },
  { f: "x_whoomph", at: t("flare", 1.0), v: 0.8 },
  { f: "boom", at: t("boom", 0.05), v: 0.85 },
  { f: "x_subboom", at: t("boom", 0.08), v: 0.7 },
  { f: "sputter", at: t("adrift", 0.0), v: 0.25, fadeOut: 1.2 },
  { f: "x_space_bed", at: t("tomoon"), v: 0.5, len: 5, fadeIn: 1, fadeOut: 2 },
  { f: "flyby", at: t("tomoon", 0.3), v: 0.4 },
  // VII. the moon: hushed approach, the legs coming down
  { f: "x_turbo_bed", at: t("approach", -0.3), v: 0.08, len: t("land", 0.5) - t("approach", -0.3), fadeIn: 0.9, fadeOut: 0.6 },
  { f: "servo", at: t("approach", 1.0), v: 1.0 },
  { f: "lunar", at: t("land", 0.0), v: 0.8, len: 4.8, fadeOut: 1.2 },
  { f: "x4_clamp", at: t("footB", 0.15), v: 0.35 },
  { f: "servo", at: t("flag", 1.0), v: 0.55 },
  // VIII. home
  { f: "ignite", at: t("liftoff"), v: 0.4, len: 3.2, fadeIn: 0.3, fadeOut: 1.4 },
  { f: "x_subboom", at: t("homeward", 0.1), v: 0.45 },
  { f: "reentry", at: t("reentry", -0.2), v: 0.55, len: 3.4, fadeIn: 0.3, fadeOut: 1.0 },
  { f: "flyby", at: t("descent", 0.2), v: 0.45 },
  { f: "vland", at: t("touchhome", 0.1), v: 0.45 },
  { f: "hatch", at: t("hatch", 0.2), v: 0.8 },
  { f: "ding", at: t("tray", 0.9), v: 0.9, len: 1.2 },
  // outside at Ewing: open air, then the room's applause swells into the end card
  { f: "amb", at: t("hatch", 1.5), v: 0.22, len: t("end") - t("hatch", 1.5), fadeIn: 1.0, fadeOut: 0.4 },
  { f: "x_applause", at: t("cups", -0.4), v: 0.4, len: t("end", 0.5) - t("cups", -0.4), fadeIn: 1.4, fadeOut: 0.5 },
  { f: "x_subboom", at: t("end"), v: 0.7 },
  { f: "x_space_bed", at: t("screw", -0.3), v: 0.35, len: 2.9, fadeIn: 0.5, fadeOut: 0.1 },
  { f: "x_tink", at: t("screw", 2.45), v: 0.9 },
  // radio calls open with a Quindar tone
  ...RADIO.map((c) => ({ f: "x4_quindar", at: c.at - 0.22, v: 0.3, len: 0.4 })),
];

// One continuous score, composed to this cut and never cut into. It starts 0.2 s early so that its breath
// and attack land on the countdown silence and the ignition, its hit lands on the relight, its drop on the
// sputter, its long silence holds the landing, and its return arrives as the flag unfurls.
// The only shaping is gain: it stops dead for the hush, eases back for the drift and for Flavor Control's search,
// and gives way to the final chord.
// The score in three placements, each keyed to a story beat:
// 1. enters under the label and lands its first hit on the rival's floodlight; carries the reveal and the roll call
// 2. picks up at "go for flavor" so its breath and attack land on the silence and the ignition; stops with the engines
// 3. returns on the relight in orbit, on the race, through the rival's sputter and the bang, and gives way to the song
const SC0 = t("reveal", 3.04) - 8.02; // the score enters on the third light bank
const P2 = t("padgo"), P2_FROM = 33.0 - (t("bell") - t("padgo"));
const P3 = t("reignite", -0.3), P3_FROM = 52.1 - (t("race") - t("reignite", -0.3));
const SONG_AT = t("flag") - 11.51; // the band's entry (0:11.51) lands on the flag
const MUSIC: Cue[] = [
  {
    f: "m7_score", at: SC0, from: 0, v: 0.95, len: t("mcwide", 0.8) - SC0, fadeOut: 0.5,
    auto: [[SC0, 0.0], [t("reveal", 3.0), 0.0], [t("reveal", 3.06), 1], [t("title", 3.0), 1], [t("mcwide", 0.6), 0]],
  },
  {
    f: "m7_score", at: P2, from: P2_FROM, v: 0.95, len: t("hull", 0.5) - P2, fadeIn: 0.8, fadeOut: 0.6,
    auto: [[P2, 0.0], [P2 + 0.5, 0.8], [t("count"), 1], [t("hush", -0.06), 1], [t("hush", 0.0), 0], [t("bell", -0.02), 0], [t("bell"), 1]],
  },
  {
    f: "m7_score", at: P3, from: P3_FROM, v: 0.95, len: t("tomoon") - P3, fadeIn: 1.4, fadeOut: 1.6,
    auto: [[P3, 0.8], [t("race", -0.2), 1], [t("yuzu", -0.4), 1], [t("yuzu", 0.4), 0.6], [t("ring"), 0.75], [t("relight", -0.3), 1], [t("boom", 0.4), 1], [t("adrift", -0.2), 0]],
  },
  // 4. Once the race is won and TheraBreath heads for the Moon alone: "Mr. Blue Sky" (ELO), the file supplied by the
  // client for this private screening. It starts from the top so the full band arrives as the flag goes up,
  // carries the landing and the trip home, and fades out over the end card.
  { f: "licensed/mrbluesky_src", at: SONG_AT, from: 0, v: 0.6, len: t("end", 4.6) - SONG_AT, fadeIn: 0.4, fadeOut: 3.2 },
];
const autoGain = (k: [number, number][], g: number) => {
  if (g <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (g <= k[i][0]) return k[i - 1][1] + ((g - k[i - 1][0]) / (k[i][0] - k[i - 1][0])) * (k[i][1] - k[i - 1][1]);
  return k[k.length - 1][1];
};

// Music dips gently under the four lines; long ramps so the dip is felt, not heard
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

// Beds that may run longer than their file loop seamlessly instead of stopping
const LOOP = new Set(["x_turbo", "x_tick", "x_space", "beeps", "amb"]);
const CueAudio: React.FC<{ c: Cue; duck?: boolean }> = ({ c, duck }) => {
  const len = c.len ?? LEN[c.f] ?? 30;
  return (
    <Sequence from={f(c.at)} durationInFrames={Math.max(1, f(len + (c.len ? 0 : 0.4)))} layout="none">
      <Audio
        src={staticFile(`race/audio/${c.f}.mp3`)}
        startFrom={f(c.from || 0)}
        loop={LOOP.has(c.f)}
        volume={(fr) => {
          const s = fr / FPS;
          let v = c.v * GAIN;
          if (c.fadeIn) v *= Math.min(1, s / c.fadeIn);
          if (c.fadeOut) v *= Math.min(1, Math.max(0, (len - s) / c.fadeOut));
          if (c.auto) v *= autoGain(c.auto, c.at + s);
          if (duck) v *= duckAt(c.at + s);
          return v;
        }}
      />
    </Sequence>
  );
};

export const FlavorRaceV9: React.FC<{ stem?: string }> = ({ stem = "all" }) => {
  loadFonts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SEGS.map((sg) => {
        const x = sg.kind === "clip" ? sg.x || 0 : 0;
        return (
          <Sequence key={sg.id} from={f(AT[sg.id] - x)} durationInFrames={f(sg.dur + x)} layout="none">
            {sg.kind === "clip" && <ClipLayer sg={sg} />}
            {sg.kind === "card" && <Card lines={sg.lines} size={sg.size} dur={f(sg.dur)} slam={sg.slam} />}
            {sg.kind === "logos" && <Logos dur={f(sg.dur)} />}
            {sg.kind === "end" && <EndCard dur={f(sg.dur)} />}
          </Sequence>
        );
      })}

      <Sequence from={f(t("bell", 0.15))} durationInFrames={9} layout="none"><Flash /></Sequence>
      <Sequence from={f(t("relight", 0.2))} durationInFrames={10} layout="none"><Flash warm /></Sequence>

      <Sequence from={f(t("reveal", 4.4))} durationInFrames={f(3.6)} layout="none"><Super dur={f(3.6)} a="NORCO, CALIFORNIA" b="0400 HOURS · T-MINUS 00:00:30" /></Sequence>
      <Sequence from={f(t("mcwide", 0.2))} durationInFrames={f(2.9)} layout="none"><Super dur={f(2.9)} a="FLAVOR CONTROL" b="THE FLAVOR FACTORY" /></Sequence>
      <Sequence from={f(t("title"))} durationInFrames={f(3.2)} layout="none"><EpicTitle lines={["THE FLAVOR RACE"]} dur={f(3.2)} size={230} over hold /></Sequence>
      <Sequence from={f(t("ring", 0.2))} durationInFrames={f(3.4)} layout="none"><EpicTitle lines={["THE NEXT FLAVOR", "CAN COME FROM ANYWHERE."]} dur={f(3.4)} size={118} over /></Sequence>
      <Sequence from={f(t("homeward", 0.05))} durationInFrames={f(2.0)} layout="none"><EpicTitle lines={["TWO TEAMS.", "ONE MISSION."]} dur={f(2.0)} size={150} over /></Sequence>
      <Sequence from={f(t("touchhome", 0.3))} durationInFrames={f(2.6)} layout="none"><Super dur={f(2.6)} a="EWING, NEW JERSEY" b="1847 HOURS" /></Sequence>
      <Sequence from={f(t("dropper", 0.1))} durationInFrames={f(3.0)} layout="none"><Super dur={f(3.0)} a="THE FLAVOR FACTORY" b="FLAVOR LAB" /></Sequence>
      <Sequence from={f(t("tray", 0.3))} durationInFrames={f(4.1)} layout="none"><TasteSign dur={f(4.1)} /></Sequence>

      <Grain />

      {(stem === "all" || stem === "music") && MUSIC.map((c, i) => <CueAudio key={`m${i}`} c={c} duck />)}
      {(stem === "all" || stem === "sfx") && SFX.map((c, i) => <CueAudio key={`x${i}`} c={c} />)}
      {(stem === "all" || stem === "vo") && VO.map((c, i) => <CueAudio key={`v${i}`} c={c} />)}
    </AbsoluteFill>
  );
};
