import React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { SPANS } from "./data";
import { C, MONO, Room, SERIF, loadFonts, rise } from "./ui";

const PART_HUE: Record<string, number> = { "01": 200, "02": 32, "03": 335, "04": 262, "": 196 };

// 2. The shape of the morning: seven blocks on one bar, four of them Ross's objectives.
export const ShapeScene: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame();
  const W = 1680;
  let x = 0;
  const segs = SPANS.map((sp) => { const w = (sp.min / 120) * W; const out = { ...sp, x, w }; x += w; return out; });
  return (
    <Room hue={200}>
      <Interactive.Div
        name="Headline"
        style={{
          position: "absolute", left: 120, top: 160, fontFamily: SERIF, fontWeight: 300, fontSize: 104, lineHeight: 1.02, letterSpacing: "-0.025em",
          opacity: interpolate(frame, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        }}
      >
        Two hours. <span style={{ fontStyle: "italic" }}>Seven blocks.</span>
      </Interactive.Div>
      <Interactive.Div
        name="Subhead"
        style={{
          position: "absolute", left: 120, top: 300, fontSize: 42, color: C.fg2, maxWidth: 1500,
          opacity: interpolate(frame, [20, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Four parts in the middle, one for each of Ross’s objectives.
      </Interactive.Div>
      <div style={{ position: "absolute", left: 120, top: 470, width: W, height: 320 }}>
        {segs.map((sg, i) => {
          const start = 40 + i * 9;
          const hue = PART_HUE[sg.part];
          return (
            <div key={sg.id} style={{ position: "absolute", left: sg.x, top: 0, width: sg.w - 8, height: 320, ...rise(frame, start, 18) }}>
              <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: "0.14em", color: sg.part ? `hsl(${hue}, 70%, 72%)` : C.fg3, height: 34 }}>{sg.part ? `PART ${Number(sg.part)}` : ""}</div>
              <div style={{ height: 86, borderRadius: 14, background: `linear-gradient(135deg, hsla(${hue}, 70%, 60%, ${sg.part ? 0.55 : 0.22}), hsla(${hue}, 70%, 45%, ${sg.part ? 0.3 : 0.12}))`, border: `1px solid hsla(${hue}, 70%, 70%, 0.45)` }} />
              <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: "0.08em", color: C.fg2, marginTop: 16 }}>{["10:00", "10:10", "10:25", "10:40", "11:00", "11:20", "11:40"][i]}</div>
              <div style={{ fontSize: 28, lineHeight: 1.2, color: C.fg, marginTop: 8, paddingRight: 8 }}>{sg.short}</div>
            </div>
          );
        })}
      </div>
      <Interactive.Div
        name="Noon"
        style={{
          position: "absolute", left: 1720, top: 594, fontFamily: MONO, fontSize: 22, letterSpacing: "0.08em", color: C.fg2,
          opacity: interpolate(frame, [110, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        12:00
      </Interactive.Div>
      <Interactive.Div
        name="Footer"
        style={{
          position: "absolute", left: 120, top: 880, fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: C.accent,
          opacity: interpolate(frame, [120, 144], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Phones come out three times. The rest is a conversation.
      </Interactive.Div>
    </Room>
  );
};
