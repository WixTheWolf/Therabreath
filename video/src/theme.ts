import { staticFile, delayRender, continueRender } from "remotion";

export const C = {
  ink: "#071C3C",
  navy: "#0A2A5C",
  green: "#006649",
  blue: "#00A3E0",
  orange: "#F58025",
  mint: "#A8F0CB",
  paper: "#F4FAFD",
};
export const DISPLAY = '"Inter Tight", "Archivo", "Arial Narrow", Arial, sans-serif';
export const MONO = '"JetBrains Mono", ui-monospace, monospace';
export const BODY = '"Figtree", "Helvetica Neue", Arial, sans-serif';

// 120 BPM at 30 fps: one beat = 15 frames. Groove starts on frame 45.
export const BEAT = 15;

let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const handle = delayRender("fonts");
  const faces = [
    new FontFace("Archivo", `url(${staticFile("fonts/archivo-normal-latin.woff2")})`, { weight: "100 900", stretch: "62% 125%" }),
    new FontFace("Archivo", `url(${staticFile("fonts/archivo-normal-latin-ext.woff2")})`, { weight: "100 900", stretch: "62% 125%", unicodeRange: "U+0100-02AF, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF" }),
    new FontFace("Figtree", `url(${staticFile("fonts/figtree-normal-latin.woff2")})`, { weight: "300 900" }),
    new FontFace("Inter Tight", `url(${staticFile("fonts/intertight-latin.woff2")})`, { weight: "100 900" }),
    new FontFace("JetBrains Mono", `url(${staticFile("fonts/jetbrainsmono-latin.woff2")})`, { weight: "400 800" }),
  ];
  Promise.all(faces.map((f) => f.load().then((ff) => document.fonts.add(ff))))
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
};
