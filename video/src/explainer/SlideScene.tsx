import React from "react";
import { Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BLOCKS } from "./data";
import { SLIDE_CARDS, beats } from "./slideData";
import { C, Label, MONO, Room, SERIF, SlideShot, loadFonts, rise } from "./ui";

// Slide by slide: one slide of the presentation. On the left, its number and title, why it's there and what to say.
// On the right, the slide as the room sees it, and under it the question for the room. Each line lands in turn, paced
// for reading; the strip along the top shows where the slide sits in the morning.
export const SlideScene: React.FC<{ i: number }> = ({ i }) => {
  loadFonts();
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const c = SLIDE_CARDS[i];
  const b = BLOCKS[c.block];
  const hue = b.hue;
  const at = beats(c);
  const per = (durationInFrames - 20) / c.shots.length;
  const shown = Math.min(c.shots.length - 1, Math.floor(Math.max(0, frame - 10) / per));
  return (
    <Room hue={hue}>
      {/* Where we are in the morning */}
      <div style={{ position: "absolute", left: 120, top: 64, width: 1680, display: "flex", gap: 8 }}>
        {BLOCKS.map((x, k) => (
          <div key={x.id} style={{ flex: [10, 15, 15, 20, 20, 20, 20][k], opacity: interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" }) }}>
            <div style={{ height: 6, borderRadius: 3, background: k === c.block ? `hsl(${hue}, 70%, 65%)` : k < c.block ? "rgba(240,238,233,0.35)" : "rgba(240,238,233,0.12)" }} />
            <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: "0.1em", marginTop: 10, color: k === c.block ? C.fg : C.fg3 }}>{x.t}</div>
          </div>
        ))}
      </div>

      {/* The slide, why it's there and what to say */}
      <div style={{ position: "absolute", left: 120, top: 196, width: 720, display: "flex", flexDirection: "column" }}>
        <Interactive.Div
          name="Slide, part and time"
          style={{ fontFamily: MONO, fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap", color: `hsl(${hue}, 70%, 72%)`, ...rise(frame, 2, 12) }}
        >
          Slide {c.n} · {c.part} · {c.window}
        </Interactive.Div>
        <Interactive.Div
          name="Slide title"
          style={{ marginTop: 18, marginLeft: -3, fontFamily: SERIF, fontWeight: 300, fontSize: 64, lineHeight: 1.04, letterSpacing: "-0.02em", textWrap: "balance", color: C.fg, ...rise(frame, 6, 24) }}
        >
          {c.title}
        </Interactive.Div>
        <div style={{ marginTop: 40, ...rise(frame, at.why) }}>
          <Label size={18} color={C.fg3}>Why it’s there</Label>
          <Interactive.Div name="Why" style={{ marginTop: 10, fontFamily: SERIF, fontStyle: "italic", fontWeight: 300, fontSize: 40, lineHeight: 1.22, textWrap: "pretty", color: C.accent }}>
            {c.why}
          </Interactive.Div>
        </div>
        <div style={{ marginTop: 40, ...rise(frame, at.say[0]) }}>
          <Label size={18} color={C.fg3}>Say</Label>
        </div>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 20 }}>
          {c.say.map((p, k) => (
            <div key={k} style={{ display: "flex", gap: 18, fontSize: 31, lineHeight: 1.34, color: C.fg, ...rise(frame, at.say[k]) }}>
              <span style={{ flex: "none", width: 11, height: 11, borderRadius: 6, marginTop: 16, background: `hsl(${hue}, 70%, 65%)` }} />
              <span>{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* The slide as the room sees it, and the question for the room */}
      <div style={{ position: "absolute", left: 880, top: 196, width: 920, ...rise(frame, 4, 40) }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 18, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          <span style={{ color: C.fg2 }}>On the TV</span>
          <span style={{ color: C.fg3 }}>Practice data</span>
        </div>
        <div style={{ position: "relative", width: 920, height: 518, marginTop: 14, borderRadius: 18, border: `1px solid ${C.rule}`, boxShadow: "0 40px 90px rgba(0,0,0,0.5)", background: "#000" }}>
          {c.shots.map((src, k) => {
            const st = k * per + 10, en = (k + 1) * per + 10;
            const op = k === 0
              ? interpolate(frame, [en - 6, en + 8], [1, c.shots.length > 1 ? 0 : 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
              : interpolate(frame, [st - 6, st + 8, en - 6, en + 8], [0, 1, 1, k === c.shots.length - 1 ? 1 : 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return <SlideShot key={src} src={src} opacity={op} scale={interpolate(frame, [st, en + 10], [1, 1.03], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />;
          })}
        </div>
        {c.shots.length > 1 ? (
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            {c.shots.map((src, k) => (
              <div key={src} style={{ width: 28, height: 4, borderRadius: 2, background: k === shown ? `hsl(${hue}, 70%, 65%)` : "rgba(240,238,233,0.2)" }} />
            ))}
          </div>
        ) : null}
      </div>
      {c.ask ? (
        <div style={{ position: "absolute", left: 880, top: 800, width: 920, ...rise(frame, at.ask) }}>
          <Label size={18} color={C.fg3}>Ask the room</Label>
          <Interactive.Div name="Ask" style={{ marginTop: 10, fontFamily: SERIF, fontStyle: "italic", fontWeight: 300, fontSize: 44, lineHeight: 1.18, textWrap: "pretty", color: C.fg }}>
            {c.ask}
          </Interactive.Div>
        </div>
      ) : null}
    </Room>
  );
};
