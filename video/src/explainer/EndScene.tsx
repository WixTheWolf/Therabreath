import React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { C, MONO, Room, SERIF, loadFonts } from "./ui";

// 13. What the morning is for, in the words we open with.
export const EndScene: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame();
  return (
    <Room hue={196}>
      <Interactive.Div
        name="Kicker"
        style={{
          position: "absolute", left: 120, top: 330, fontFamily: MONO, fontSize: 26, letterSpacing: "0.16em", textTransform: "uppercase", color: C.accent,
          opacity: interpolate(frame, [4, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        By noon
      </Interactive.Div>
      <Interactive.Div
        name="Goal"
        style={{
          position: "absolute", left: 116, top: 380, width: 1600, fontFamily: SERIF, fontWeight: 300, fontSize: 92, lineHeight: 1.06, letterSpacing: "-0.025em",
          opacity: interpolate(frame, [10, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          translate: interpolate(frame, [10, 40], ["0px 30px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        }}
      >
        What deserves another round, <span style={{ fontStyle: "italic" }}>what we’d change and the next step.</span>
      </Interactive.Div>
      <Interactive.Div
        name="Sign-off"
        style={{
          position: "absolute", left: 120, top: 760, fontFamily: MONO, fontSize: 24, letterSpacing: "0.14em", textTransform: "uppercase", color: C.fg2,
          opacity: interpolate(frame, [44, 66], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        The Future of Freshness · Monday, November 9
      </Interactive.Div>
    </Room>
  );
};
