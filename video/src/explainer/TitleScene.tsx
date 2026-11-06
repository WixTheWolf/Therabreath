import React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { C, MONO, Room, SERIF, loadFonts } from "./ui";

// 1. The title: what this is and who it's for.
export const TitleScene: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame();
  return (
    <Room hue={196}>
      <Interactive.Div
        name="Kicker"
        style={{
          position: "absolute", left: 120, top: 300, fontFamily: MONO, fontSize: 28, letterSpacing: "0.16em", textTransform: "uppercase", color: C.accent,
          opacity: interpolate(frame, [6, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        }}
      >
        For the team · The Future of Freshness
      </Interactive.Div>
      <Interactive.Div
        name="Title"
        style={{
          position: "absolute", left: 114, top: 350, fontFamily: SERIF, fontWeight: 300, fontSize: 150, lineHeight: 1, letterSpacing: "-0.03em", color: C.fg,
          opacity: interpolate(frame, [12, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          translate: interpolate(frame, [12, 42], ["0px 34px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        }}
      >
        How the morning <span style={{ fontStyle: "italic" }}>runs.</span>
      </Interactive.Div>
      <Interactive.Div
        name="Subtitle"
        style={{
          position: "absolute", left: 120, top: 540, fontFamily: SERIF, fontWeight: 300, fontStyle: "italic", fontSize: 54, color: C.fg2,
          opacity: interpolate(frame, [30, 54], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        }}
      >
        22 slides, two hours, in two and a half minutes.
      </Interactive.Div>
      <Interactive.Div
        name="When and where"
        style={{
          position: "absolute", left: 120, top: 700, fontFamily: MONO, fontSize: 26, letterSpacing: "0.14em", textTransform: "uppercase", color: C.fg2,
          opacity: interpolate(frame, [48, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Monday, November 9 · 10:00 to 12:00 · Darwin room, Princeton
      </Interactive.Div>
      <Interactive.Div
        name="Practice data note"
        style={{
          position: "absolute", left: 120, bottom: 110, fontSize: 26, color: C.fg3,
          opacity: interpolate(frame, [60, 84], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        The screens are the real slides, shown with practice data. Sample names stay hidden.
      </Interactive.Div>
    </Room>
  );
};
