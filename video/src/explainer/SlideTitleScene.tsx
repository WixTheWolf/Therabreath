import React from "react";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { C, Label, MONO, Room, SERIF, loadFonts, rise } from "./ui";

// Slide by slide, the opening card: what this is, and how each slide that follows is laid out.
export const SlideTitleScene: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame();
  const key: [string, string][] = [
    ["Why it’s there", "What the slide is for"],
    ["Say", "The lines from the talking points"],
    ["Ask the room", "The question to put to them"],
  ];
  return (
    <Room hue={196}>
      <Interactive.Div name="Kicker" style={{ position: "absolute", left: 120, top: 220, fontFamily: MONO, fontSize: 28, letterSpacing: "0.16em", textTransform: "uppercase", color: C.accent, ...rise(frame, 4, 14) }}>
        For the team · The Future of Freshness
      </Interactive.Div>
      <Interactive.Div name="Title" style={{ position: "absolute", left: 114, top: 270, fontFamily: SERIF, fontWeight: 300, fontSize: 150, lineHeight: 1, letterSpacing: "-0.03em", color: C.fg, ...rise(frame, 10, 34) }}>
        Slide by <span style={{ fontStyle: "italic" }}>slide.</span>
      </Interactive.Div>
      <Interactive.Div name="Subtitle" style={{ position: "absolute", left: 120, top: 455, fontFamily: SERIF, fontWeight: 300, fontStyle: "italic", fontSize: 54, color: C.fg2, ...rise(frame, 26) }}>
        Why each one is there, and what to say on it.
      </Interactive.Div>
      <div style={{ position: "absolute", left: 120, top: 600, display: "flex", gap: 70 }}>
        {key.map(([k, v], n) => (
          <div key={k} style={{ width: 400, borderTop: `1px solid ${C.rule}`, paddingTop: 18, ...rise(frame, 44 + n * 10) }}>
            <Label size={20} color={C.accent}>{k}</Label>
            <div style={{ marginTop: 10, fontSize: 28, lineHeight: 1.3, color: C.fg2 }}>{v}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute", left: 120, bottom: 110, width: 1500, fontSize: 26, lineHeight: 1.4, color: C.fg3,
          opacity: interpolate(frame, [80, 104], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Every point is also in the presenter view (P) and the notes on the TV (N). The film on slide 13 plays on its own, so it isn’t covered here. Screens show practice data, and sample names stay hidden.
      </div>
    </Room>
  );
};
