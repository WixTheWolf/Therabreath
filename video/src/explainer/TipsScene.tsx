import React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { C, MONO, Room, SERIF, loadFonts, rise } from "./ui";

// 12. If we run late (BEHIND in the run notes), and how to practice.
const LATE = [
  { k: "A few minutes behind", d: "Press S. It skips the optional build." },
  { k: "Further behind", d: "Skip THE FLAVOR RACE, talk through two trends instead of three, keep one concept card." },
  { k: "Out of time", d: "Read back Now, Next, Later with its owners, then End goes to the thank-you card." },
];
const PRACTICE = [
  "Practice on the rehearsal session. Votes there never reach the live session.",
  "One presentation window drives. Any other window stays passive.",
  "Before anyone arrives: the sound, and the glasses on slide 7, on the TV itself.",
];

export const TipsScene: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame();
  return (
    <Room hue={262}>
      <Interactive.Div
        name="Late headline"
        style={{
          position: "absolute", left: 120, top: 120, fontFamily: SERIF, fontWeight: 300, fontSize: 84, letterSpacing: "-0.025em",
          opacity: interpolate(frame, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        }}
      >
        Running <span style={{ fontStyle: "italic" }}>late?</span>
      </Interactive.Div>
      <div style={{ position: "absolute", left: 120, top: 250, width: 820, display: "flex", flexDirection: "column", gap: 30 }}>
        {LATE.map((x, i) => (
          <div key={x.k} style={rise(frame, 16 + i * 26)}>
            <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(262, 70%, 78%)" }}>{x.k}</div>
            <div style={{ fontSize: 34, lineHeight: 1.3, marginTop: 8 }}>{x.d}</div>
          </div>
        ))}
      </div>
      <Interactive.Div
        name="Never cut"
        style={{
          position: "absolute", left: 120, top: 830, width: 820, fontFamily: SERIF, fontStyle: "italic", fontSize: 40, lineHeight: 1.22, color: C.accent,
          opacity: interpolate(frame, [100, 122], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Never cut the blind tasting, the chips or the owners on Now, Next, Later.
      </Interactive.Div>
      <Interactive.Div
        name="Practice headline"
        style={{
          position: "absolute", left: 1040, top: 120, fontFamily: SERIF, fontWeight: 300, fontSize: 84, letterSpacing: "-0.025em",
          opacity: interpolate(frame, [120, 142], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        }}
      >
        Before <span style={{ fontStyle: "italic" }}>Monday.</span>
      </Interactive.Div>
      <div style={{ position: "absolute", left: 1040, top: 260, width: 760, display: "flex", flexDirection: "column", gap: 34 }}>
        {PRACTICE.map((l, i) => (
          <div key={i} style={{ display: "flex", gap: 20, fontSize: 34, lineHeight: 1.3, ...rise(frame, 136 + i * 26) }}>
            <span style={{ flex: "none", fontFamily: MONO, fontSize: 24, color: C.fg3, marginTop: 6 }}>0{i + 1}</span>
            <span>{l}</span>
          </div>
        ))}
      </div>
    </Room>
  );
};
