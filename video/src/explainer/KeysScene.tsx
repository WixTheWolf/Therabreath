import React from "react";
import { Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame } from "remotion";
import { KEYS } from "./data";
import { C, MONO, Room, SERIF, loadFonts, rise } from "./ui";

// 11. Running it from the laptop: the presenter view and the keys.
export const KeysScene: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame();
  return (
    <Room hue={190}>
      <Interactive.Div
        name="Headline"
        style={{
          position: "absolute", left: 120, top: 120, fontFamily: SERIF, fontWeight: 300, fontSize: 96, lineHeight: 1.02, letterSpacing: "-0.025em",
          opacity: interpolate(frame, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        }}
      >
        Running it <span style={{ fontStyle: "italic" }}>from the laptop.</span>
      </Interactive.Div>
      <Interactive.Div
        name="Presenter view note"
        style={{
          position: "absolute", left: 120, top: 250, width: 900, fontSize: 36, lineHeight: 1.3, color: C.fg2,
          opacity: interpolate(frame, [16, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        The TV shows the slides. Press P for the presenter view: talking points, hand votes and the taps for every decision.
      </Interactive.Div>
      <div style={{ position: "absolute", left: 120, top: 420, width: 900, ...rise(frame, 24, 40) }}>
        <div style={{ width: 900, height: 506, borderRadius: 18, overflow: "hidden", border: `1px solid ${C.rule}`, boxShadow: "0 40px 90px rgba(0,0,0,0.5)" }}>
          <Img src={staticFile("explainer/presenter.jpg")} style={{ width: 900, height: 506, objectFit: "cover", scale: String(interpolate(frame, [24, 330], [1, 1.05], { extrapolateRight: "clamp" })) }} />
        </div>
        <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 18, letterSpacing: "0.12em", textTransform: "uppercase", color: C.fg3 }}>The presenter view · Practice data</div>
      </div>
      <div style={{ position: "absolute", left: 1110, top: 420, width: 690, display: "flex", flexDirection: "column", gap: 14 }}>
        {KEYS.map(([k, d], i) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 24, ...rise(frame, 40 + i * 9, 16) }}>
            <span style={{ flex: "none", minWidth: 170, padding: "8px 16px", borderRadius: 10, border: `1px solid ${C.rule}`, background: "rgba(240,238,233,0.06)", fontFamily: MONO, fontSize: 26, textAlign: "center", color: C.fg }}>{k}</span>
            <span style={{ fontSize: 32, color: C.fg }}>{d}</span>
          </div>
        ))}
      </div>
    </Room>
  );
};
