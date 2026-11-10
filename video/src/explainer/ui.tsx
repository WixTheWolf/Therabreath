// The look the explainer shares with the presentation: ink background, Cloud Dancer type, the teal accent and each
// part's color, Newsreader for headlines, Geist for reading and Geist Mono for labels.
import React from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";

export const FPS = 30;
export const s = (sec: number) => Math.round(sec * FPS);
export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const C = { ink: "#0B1622", fg: "#F0EEE9", fg2: "rgba(240,238,233,0.74)", fg3: "rgba(240,238,233,0.5)", accent: "#6CC7DD", rule: "rgba(240,238,233,0.16)" };
export const SERIF = "Newsreader, Georgia, serif";
export const SANS = "Geist, Helvetica, sans-serif";
export const MONO = "'Geist Mono', monospace";
// The presentation's part colors (OBJ_HUE in the site): Part 1 to 4.
export const HUE = { welcome: 196, p1: 200, p2: 32, p3: 335, p4: 262, close: 190 };

let fontsLoaded = false;
export const loadFonts = () => {
  if (fontsLoaded || typeof document === "undefined") return;
  fontsLoaded = true;
  const handle = delayRender("explainer fonts");
  const faces = [
    new FontFace("Newsreader", `url(${staticFile("fonts/newsreader-latin-opsz-normal.woff2")})`, { weight: "200 800" }),
    new FontFace("Newsreader", `url(${staticFile("fonts/newsreader-latin-opsz-italic.woff2")})`, { weight: "200 800", style: "italic" }),
    new FontFace("Geist", `url(${staticFile("fonts/Geist-Variable.woff2")})`, { weight: "100 900" }),
    new FontFace("Geist Mono", `url(${staticFile("fonts/GeistMono-Variable.woff2")})`, { weight: "100 900" }),
  ];
  Promise.all(faces.map((x) => x.load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(handle)).catch(() => continueRender(handle));
};

// Fades a line up into place from a start frame.
export const rise = (frame: number, start: number, dist = 26) => ({
  opacity: interpolate(frame, [start, start + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }),
  translate: interpolate(frame, [start, start + 24], [`0px ${dist}px`, "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }),
});

// The room behind every scene: ink, with a soft light in the part's color drifting slowly.
export const Room: React.FC<{ hue: number; children?: React.ReactNode }> = ({ hue, children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, fontFamily: SANS, color: C.fg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 70% at ${interpolate(frame, [0, 600], [72, 64])}% 30%, hsla(${hue}, 70%, 55%, 0.20), transparent 70%), radial-gradient(ellipse 50% 60% at 10% 100%, hsla(${hue}, 60%, 45%, 0.10), transparent 70%)`,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

// A label in the presentation's mono caps.
export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, color = C.fg2, size = 24, style }) => (
  <div style={{ fontFamily: MONO, fontSize: size, letterSpacing: "0.16em", textTransform: "uppercase", color, ...style }}>{children}</div>
);

// A slide as the room sees it, in a frame, pushing in slowly while it's on screen.
export const SlideShot: React.FC<{ src: string; opacity: number; scale: number }> = ({ src, opacity, scale }) => (
  <div style={{ position: "absolute", inset: 0, opacity, overflow: "hidden", borderRadius: 18 }}>
    <Img src={staticFile(`explainer/${src}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", scale: String(scale) }} />
  </div>
);
