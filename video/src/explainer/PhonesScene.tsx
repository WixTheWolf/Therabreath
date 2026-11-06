import React from "react";
import { Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, MONO, Room, SERIF, loadFonts, rise } from "./ui";

const PHONES = [
  { src: "phone-trends", when: "Slide 9 · 10:17 to 10:25", what: "Pick three trends" },
  { src: "phone-tasting", when: "Slide 14 · 10:40 to 10:53", what: "Score four samples" },
  { src: "phone-chips", when: "Slide 15 · 10:53 to 11:00", what: "Five chips each" },
];

// 3. The three times phones come out, with the real phone screens.
export const PhonesScene: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame();
  return (
    <Room hue={32}>
      <Interactive.Div
        name="Headline"
        style={{
          position: "absolute", left: 120, top: 150, width: 640, fontFamily: SERIF, fontWeight: 300, fontSize: 96, lineHeight: 1.02, letterSpacing: "-0.025em",
          opacity: interpolate(frame, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        }}
      >
        Phones come out <span style={{ fontStyle: "italic" }}>three times.</span>
      </Interactive.Div>
      <Interactive.Div
        name="No phone"
        style={{
          position: "absolute", left: 120, top: 520, width: 600, fontSize: 38, lineHeight: 1.3, color: C.fg2,
          opacity: interpolate(frame, [70, 92], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        No phone? A paper scorecard, or hand votes added in the presenter view.
      </Interactive.Div>
      <Interactive.Div
        name="Tapped not typed"
        style={{
          position: "absolute", left: 120, top: 760, width: 600, fontFamily: SERIF, fontStyle: "italic", fontSize: 42, lineHeight: 1.2, color: C.accent,
          opacity: interpolate(frame, [110, 132], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Everything we decide is tapped in, not typed.
      </Interactive.Div>
      {PHONES.map((p, i) => (
        <div key={p.src} style={{ position: "absolute", left: 800 + i * 340, top: 120, width: 300, ...rise(frame, 18 + i * 14, 40) }}>
          <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: "0.12em", textTransform: "uppercase", color: C.fg2 }}>{p.when}</div>
          <div style={{ fontFamily: SERIF, fontSize: 40, lineHeight: 1.1, marginTop: 10, marginBottom: 18 }}>{p.what}</div>
          <div style={{ width: 300, height: 650, borderRadius: 36, overflow: "hidden", border: `2px solid ${C.rule}`, boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}>
            <Img src={staticFile(`explainer/${p.src}.jpg`)} style={{ width: 300, height: 650, objectFit: "cover", objectPosition: "top" }} />
          </div>
        </div>
      ))}
    </Room>
  );
};
