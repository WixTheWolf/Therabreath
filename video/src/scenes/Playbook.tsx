import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { TB } from "../core";
import { Grade } from "./Shot";
import { BEAT, C, DISPLAY, MONO, BODY } from "../theme";

// 750-870: the four objectives stamp in on the beat, then fold into one book:
// The Flavor Playbook, its six chapters, and the 30/60/90 plan. Liquid rises into the end card.
const out = Easing.bezier(0.16, 1, 0.3, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const COLS = [C.orange, C.blue, C.green, "#B23A76"];
const FOLD = 60;

export const Playbook: React.FC = () => {
  const f = useCurrentFrame();
  const fold = interpolate(f, [FOLD, FOLD + 10], [0, 1], { ...cl, easing: out });
  const shake = [0, 1, 2, 3].reduce((s, i) => (f >= i * BEAT ? s + 14 * Math.exp(-(f - i * BEAT) / 3) : s), 0) + (f >= FOLD ? 18 * Math.exp(-(f - FOLD) / 3) : 0);
  const book = interpolate(f, [FOLD, FOLD + 12], [0, 1], { ...cl, easing: Easing.bezier(0.34, 1.4, 0.64, 1) });
  const rise = interpolate(f, [112, 120], [0, 1], { ...cl, easing: Easing.bezier(0.6, 0, 0.9, 0.4) });
  return (
    <AbsoluteFill name="Playbook" style={{ background: C.paper, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, translate: `${Math.sin(f * 2.1) * shake}px ${Math.cos(f * 2.7) * shake}px` }}>
        {/* the four objectives */}
        <div style={{ position: "absolute", left: 150, top: interpolate(fold, [0, 1], [150, 250]), transformOrigin: "0 0", scale: `${interpolate(fold, [0, 1], [1, 0.52])}` }}>
          {TB.OBJECTIVES.map((o, i) => {
            const l = f - i * BEAT;
            return (
              <div key={o.k} style={{ display: "flex", alignItems: "baseline", gap: 30, height: 190, opacity: l >= 0 ? 1 : 0 }}>
                <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: COLS[i] }}>{o.n}</span>
                <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontStretch: "90%", fontSize: 170, letterSpacing: "-0.03em", lineHeight: 1, color: C.ink,
                  display: "inline-block", transformOrigin: "0 60%",
                  scale: `${interpolate(l, [0, 6], [1.6, 1], { ...cl, easing: out })}`, rotate: `${interpolate(l, [0, 6], [-5, 0], { ...cl, easing: out })}deg` }}>
                  {o.h}
                </span>
                <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 40, color: COLS[i], opacity: interpolate(l, [4, 10], [0, 1], cl) * (1 - fold) }}>{o.out}</span>
              </div>
            );
          })}
        </div>
        {/* equals */}
        <div style={{ position: "absolute", left: 640, top: 540, translate: "-50% -50%", fontFamily: DISPLAY, fontWeight: 800, fontSize: 200, color: C.orange,
          opacity: book, scale: `${0.5 + book * 0.5}` }}>=</div>
        {/* the book */}
        <div style={{ position: "absolute", left: 800, top: 170, width: 560, height: 740, perspective: 1600, opacity: Math.min(1, book * 1.5) }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "10px 28px 28px 10px", transformOrigin: "0 50%",
            rotate: `${interpolate(book, [0, 1], [-14, -3])}deg`, scale: `${0.6 + 0.4 * book}`,
            background: `linear-gradient(160deg, #0F3A74 0%, ${C.ink} 70%)`, boxShadow: "30px 50px 90px rgba(7,28,60,.4), inset 18px 0 0 rgba(255,255,255,.08)", padding: "70px 56px", color: "#fff" }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: "0.2em", color: C.mint }}>THERABREATH × THE FLAVOR FACTORY</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontStretch: "88%", fontSize: 122, letterSpacing: "-0.035em", lineHeight: 0.9, marginTop: 30 }}>
              The Flavor<br /><span style={{ color: C.mint }}>Playbook</span>
            </div>
            <div style={{ height: 10, width: 200, borderRadius: 99, background: C.orange, marginTop: 36 }} />
            <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 30, color: "rgba(255,255,255,.85)", marginTop: 30, lineHeight: 1.3 }}>
              Near-term innovation.<br />Long-term franchise growth.
            </div>
            <div style={{ position: "absolute", left: 56, bottom: 56, fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: "rgba(255,255,255,.7)" }}>
              DRAFTED TOGETHER · NOV 9, 2026
            </div>
          </div>
        </div>
        {/* six chapters slide out of the book on 16ths */}
        <div style={{ position: "absolute", left: 1368, top: 190, width: 480 }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: "0.2em", color: C.ink, opacity: interpolate(f, [FOLD + 6, FOLD + 12], [0, 0.7], cl), marginBottom: 14 }}>SIX CHAPTERS</div>
          {TB.PLAYBOOK.chapters.map((ch, i) => {
            const p = interpolate(f - (FOLD + 10 + i * 4), [0, 7], [0, 1], { ...cl, easing: out });
            return (
              <div key={ch.n} style={{ display: "flex", alignItems: "center", gap: 16, height: 76, marginBottom: 10, borderRadius: "0 18px 18px 0", padding: "0 22px",
                background: ch.c, color: "#fff", translate: `${(1 - p) * -380}px 0px`, opacity: p, boxShadow: "0 12px 26px rgba(7,28,60,.18)" }}>
                <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22 }}>{ch.n}</span>
                <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 29, letterSpacing: "-0.015em", whiteSpace: "nowrap" }}>{ch.h}</span>
              </div>
            );
          })}
        </div>
        {/* 30 / 60 / 90 */}
        <div style={{ position: "absolute", left: 800, right: 70, bottom: 70, display: "flex", gap: 34, alignItems: "center" }}>
          {TB.PLAYBOOK.plan.map((s, i) => {
            const p = interpolate(f - (FOLD + 36 + i * 4), [0, 6], [0, 1], { ...cl, easing: out });
            return (
              <div key={s.d} style={{ display: "flex", alignItems: "baseline", gap: 12, opacity: p, translate: `0px ${(1 - p) * 30}px` }}>
                <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, color: C.orange }}>{s.d}</span>
                <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, color: C.ink, letterSpacing: "0.1em" }}>DAYS</span>
                <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: C.ink, whiteSpace: "nowrap" }}>{s.h}</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* liquid rising into the end card */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${rise * 118}%`, opacity: f >= 111 ? 1 : 0,
        background: `linear-gradient(180deg, #1A9BE0 0%, #0072BC 55%, ${C.green} 100%)` }}>
        <svg viewBox="0 0 3840 80" preserveAspectRatio="none" style={{ position: "absolute", left: 0, top: -78, width: 3840, height: 80, translate: `${-f * 40}px 0` }}>
          <path d={`M0,40 ${Array.from({ length: 16 }, (_, k) => `q120,-${k % 2 ? 30 : 40} 240,0`).join(" ")} V80 H0 Z`} fill="#1A9BE0" />
        </svg>
      </div>
      <Grade />
    </AbsoluteFill>
  );
};
