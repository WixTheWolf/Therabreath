import React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BLOCKS } from "./data";
import { C, MONO, Room, SERIF, SlideShot, loadFonts, rise } from "./ui";

// 4 to 10. One block of the morning: its time and slides on the left, what happens and the team's cue, and the real
// slides on the right, one after another. A strip along the top shows where the block sits in the morning.
export const BlockScene: React.FC<{ n: number }> = ({ n }) => {
  loadFonts();
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const b = BLOCKS[n];
  const per = (durationInFrames - 20) / b.shots.length;
  const at = Math.min(b.shots.length - 1, Math.floor(Math.max(0, frame - 10) / per));
  return (
    <Room hue={b.hue}>
      {/* Where we are in the morning */}
      <div style={{ position: "absolute", left: 120, top: 70, width: 1680, display: "flex", gap: 8 }}>
        {BLOCKS.map((x, i) => (
          <div key={x.id} style={{ flex: [10, 15, 15, 20, 20, 20, 20][i], opacity: interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" }) }}>
            <div style={{ height: 6, borderRadius: 3, background: i === n ? `hsl(${b.hue}, 70%, 65%)` : i < n ? "rgba(240,238,233,0.35)" : "rgba(240,238,233,0.12)" }} />
            <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: "0.1em", marginTop: 10, color: i === n ? C.fg : C.fg3 }}>{x.t}</div>
          </div>
        ))}
      </div>
      <Interactive.Div
        name="Part, time and slides"
        style={{
          position: "absolute", left: 120, top: 190, width: 740, whiteSpace: "nowrap", fontFamily: MONO, fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase", color: `hsl(${b.hue}, 70%, 72%)`,
          opacity: interpolate(frame, [4, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        {b.part} · {b.t} to {b.end} · {b.slides}
      </Interactive.Div>
      <Interactive.Div
        name="Block title"
        style={{
          position: "absolute", left: 117, top: 236, width: 700, fontFamily: SERIF, fontWeight: 300, fontSize: 76, lineHeight: 1.02, letterSpacing: "-0.02em",
          opacity: interpolate(frame, [8, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          translate: interpolate(frame, [8, 34], ["0px 24px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        }}
      >
        {b.title}
      </Interactive.Div>
      <div style={{ position: "absolute", left: 120, top: 430, width: 680, display: "flex", flexDirection: "column", gap: 26 }}>
        {b.lines.map((l, i) => (
          <div key={i} style={{ display: "flex", gap: 20, fontSize: 36, lineHeight: 1.3, color: C.fg, ...rise(frame, 30 + i * 40) }}>
            <span style={{ flex: "none", width: 12, height: 12, borderRadius: 6, marginTop: 17, background: `hsl(${b.hue}, 70%, 65%)` }} />
            <span>{l}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 120, bottom: 120, width: 680, ...rise(frame, 30 + b.lines.length * 40 + 10) }}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: "0.16em", textTransform: "uppercase", color: C.fg3, marginBottom: 10 }}>Team cue</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 38, lineHeight: 1.22, color: C.accent }}>{b.cue}</div>
      </div>
      {/* The slides, as the room sees them */}
      <div style={{ position: "absolute", left: 880, top: 236, width: 920, ...rise(frame, 6, 40) }}>
        <div style={{ position: "relative", height: 34 }}>
          {b.shots.map((sh, i) => (
            <div key={sh.src} style={{ position: "absolute", inset: 0, fontFamily: MONO, fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase", color: C.fg2, opacity: i === at ? 1 : 0 }}>
              Slide {sh.label}
            </div>
          ))}
        </div>
        <div style={{ position: "relative", width: 920, height: 518, marginTop: 14, borderRadius: 18, border: `1px solid ${C.rule}`, boxShadow: "0 40px 90px rgba(0,0,0,0.5)", background: "#000" }}>
          {b.shots.map((sh, i) => {
            const st = i * per + 10, en = (i + 1) * per + 10;
            const op = i === 0
              ? interpolate(frame, [en - 6, en + 8], [1, b.shots.length > 1 ? 0 : 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
              : interpolate(frame, [st - 6, st + 8, en - 6, en + 8], [0, 1, 1, i === b.shots.length - 1 ? 1 : 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return <SlideShot key={sh.src} src={sh.src} opacity={op} scale={interpolate(frame, [st, en + 10], [1, 1.04], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />;
          })}
        </div>
        <div style={{ marginTop: 14, textAlign: "right", fontFamily: MONO, fontSize: 18, letterSpacing: "0.12em", textTransform: "uppercase", color: C.fg3 }}>Practice data</div>
      </div>
    </Room>
  );
};
