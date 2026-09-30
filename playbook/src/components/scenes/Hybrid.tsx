'use client';
// The hybrid scenes: the film, the freshness vocabulary, the six shifts, the flavor clock and The Bench.
import { useEffect, useRef, useState } from 'react';
import { R, Enter, SceneProps } from './ui';
import { EVENT, VOCAB, SHIFTS, DAYPARTS, TERRITORIES, COMPASS, CORE_MINT, DIALS, MISSIONS } from '@/lib/content';
import { teamDials, baseTerritory, compass, curve, readouts } from '@/lib/bench';

// Smoothly interpolate a numeric array toward a target, so live data morphs instead of jumping.
export function useTween(target: number[], ms = 700) {
  const [v, setV] = useState(target);
  const from = useRef(target); const cur = useRef(target);
  const key = target.map((x) => x.toFixed(3)).join(',');
  useEffect(() => {
    from.current = cur.current; const t0 = performance.now(); let raf = 0;
    const f = (now: number) => {
      const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      const next = target.map((x, i) => (from.current[i] ?? x) + (x - (from.current[i] ?? x)) * e);
      cur.current = next; setV(next);
      if (k < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf);
  }, [key]);
  return v;
}

// The Freshness Compass: nine sensory dimensions. Conceptual, not panel data.
export function Compass({ prof, ghost = CORE_MINT, color = 'var(--accent)', size = 560, labels = true, stage }: { prof: number[]; ghost?: number[] | null; color?: string; size?: number; labels?: boolean; stage?: string }) {
  const v = useTween(prof);
  const c = size / 2, R0 = size * 0.36, n = COMPASS.length;
  const pt = (i: number, r: number) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; return [c + Math.cos(a) * r, c + Math.sin(a) * r]; };
  const poly = (vals: number[]) => vals.map((x, i) => pt(i, (x / 5) * R0).join(',')).join(' ');
  return (
    <svg className="compass" viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ ['--cc' as any]: color }}>
      <defs><radialGradient id="cmpf"><stop offset="0" stopColor={color} stopOpacity=".55" /><stop offset="1" stopColor={color} stopOpacity=".12" /></radialGradient></defs>
      {[1, 2, 3, 4, 5].map((r) => <polygon key={r} points={poly(Array(n).fill(r))} className="cmp-ring" />)}
      {COMPASS.map((_, i) => { const [x, y] = pt(i, R0); return <line key={i} x1={c} y1={c} x2={x} y2={y} className="cmp-spoke" />; })}
      {ghost && <polygon points={poly(ghost)} className="cmp-ghost" />}
      <polygon points={poly(v)} fill="url(#cmpf)" stroke={color} strokeWidth={3} strokeLinejoin="round" className="cmp-shape" />
      {v.map((x, i) => { const [px, py] = pt(i, (x / 5) * R0); return <circle key={i} cx={px} cy={py} r={5} fill={color} />; })}
      {labels && COMPASS.map((l, i) => { const [x, y] = pt(i, R0 + 38); return <text key={l} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="cmp-lab">{l}</text>; })}
      {stage && <text x={c} y={size - 8} textAnchor="middle" className="cmp-stage">{stage}</text>}
    </svg>
  );
}

// 1. The film: lights down, sound up.
export function Film({ ctx }: SceneProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false); const [done, setDone] = useState(false);
  useEffect(() => {
    const v = ref.current!; v.muted = false;
    v.play().catch(() => { v.muted = true; setMuted(true); v.play().catch(() => {}); });
  }, []);
  return (
    <div className="film" onClick={() => { const v = ref.current!; v.muted = false; setMuted(false); v.play(); }}>
      <video ref={ref} playsInline preload="auto" poster="/media/opening-poster.jpg" onEnded={() => setDone(true)}>
        <source src="/media/opening.mp4" type="video/mp4" /><source src="/media/opening.webm" type="video/webm" />
      </video>
      {muted && !done && <div className="film-sound">Click for sound</div>}
      <div className={'film-end' + (done ? ' on' : '')}><div className="k">TheraBreath × The Flavor Factory</div><h1 className="hero center">The Future<br /><span className="it">of Freshness</span></h1></div>
    </div>
  );
}

// The vocabulary: "Mint" is where freshness starts, not where it ends.
export function Vocab({ step }: SceneProps) {
  const open = step >= 1;
  return (
    <div className={'vocab' + (open ? ' open' : '')}>
      <div className="vocab-glow" />
      <div className="vocab-mint">Mint</div>
      {VOCAB.map((v, i) => {
        const inner = i % 2 === 0, k = Math.floor(i / 2);
        const a = (k / 8) * Math.PI * 2 - Math.PI / 2 + (inner ? 0 : Math.PI / 8);
        const rx = inner ? 520 : 800, ry = inner ? 250 : 380;
        return (
          <div key={v.w} className="vw" style={{ ['--x' as any]: `${Math.cos(a) * rx}px`, ['--y' as any]: `${Math.sin(a) * ry}px`, ['--i' as any]: i }}>
            <b>{v.w}</b><span>{v.d}</span>
          </div>
        );
      })}
      <div className="vocab-top"><Enter i={0}><div className="k">Freshness is evolving</div></Enter></div>
      <div className={'vocab-line' + (step >= 0 && !open ? ' on' : '')}>For decades, freshness meant one thing.</div>
      <div className={'vocab-line2' + (step >= 2 ? ' on' : '')}>Freshness is bigger than mint. <span className="it">Now we design it.</span></div>
    </div>
  );
}

// Six shifts: each build flips one card.
export function Shifts({ step }: SceneProps) {
  return (
    <div className="pad shifts">
      <Enter i={0}><div className="k">Act I · Six shifts in how people think about fresh</div></Enter>
      <Enter i={1}><h2 className="h2">Oral care is changing <span className="it">what it means to be fresh.</span></h2></Enter>
      <div className="shift-grid">
        {SHIFTS.map((x, i) => (
          <div key={x.a} className={'shift' + (step > i ? ' flip' : '')} style={{ ['--i' as any]: i }}>
            <div className="sh-in">
              <div className="sh-front"><span className="num">0{i + 1}</span><b>{x.a}</b><em>From</em></div>
              <div className="sh-back"><span className="num">0{i + 1}</span><s>{x.a}</s><b>{x.b}</b><p>{x.d}</p></div>
            </div>
          </div>
        ))}
      </div>
      <div className="src stage-src">The Flavor Factory point of view.</div>
    </div>
  );
}

// The flavor clock: the same person wants a different freshness at 7 AM and at 10 PM.
export function Clock({ s, step }: SceneProps) {
  const focus = step > 0 ? DAYPARTS[step - 1] : null;
  const t = focus ? TERRITORIES.find((x) => x.id === focus.terr)! : null;
  const S = 780, c = S / 2, r = 300;
  const angle = (h: number) => (h / 24) * 360 - 90;
  const pos = (h: number, rr: number) => { const a = (angle(h) * Math.PI) / 180; return [c + Math.cos(a) * rr, c + Math.sin(a) * rr]; };
  const moments: Record<string, number> = {}; Object.values(s.survey).forEach((a) => a.moment && (moments[a.moment] = (moments[a.moment] || 0) + 1));
  const topMoment = Object.entries(moments).sort((a, b) => b[1] - a[1])[0];
  return (
    <div className="clock" style={t ? { ['--c1' as any]: t.palette[0], ['--c2' as any]: t.palette[1] } : undefined}>
      <div className="clock-bg" />
      <svg className="clock-dial" viewBox={`0 0 ${S} ${S}`} width={S} height={S}>
        <circle cx={c} cy={c} r={r} className="cd-ring" />
        {Array.from({ length: 24 }, (_, h) => { const [x1, y1] = pos(h, r - 12), [x2, y2] = pos(h, r + 12); return <line key={h} x1={x1} y1={y1} x2={x2} y2={y2} className={'cd-tick' + (h % 6 ? '' : ' major')} />; })}
        {[0, 6, 12, 18].map((h) => { const [x, y] = pos(h, r - 48); return <text key={h} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="cd-hour">{String(h).padStart(2, '0')}:00</text>; })}
        {DAYPARTS.map((d, i) => {
          const tt = TERRITORIES.find((x) => x.id === d.terr)!; const [x, y] = pos(d.h, r); const on = !focus || focus === d;
          return <g key={d.l} className={'cd-dot' + (on ? ' on' : '')} style={{ ['--i' as any]: i }}><circle cx={x} cy={y} r={focus === d ? 30 : 20} fill={tt.palette[1]} /><text x={pos(d.h, r + 64)[0]} y={pos(d.h, r + 64)[1]} textAnchor="middle" dominantBaseline="middle" className="cd-lab">{d.l}</text></g>;
        })}
        <g className="cd-hand" style={{ transform: `rotate(${(focus ? focus.h : 12) / 24 * 360}deg)`, transformOrigin: `${c}px ${c}px` }}>
          <line x1={c} y1={c} x2={c} y2={c - r + 40} />
          <circle cx={c} cy={c} r={10} />
        </g>
      </svg>
      <div className="clock-copy">
        <Enter i={0}><div className="k">Act IV · The Moments · the flavor clock</div></Enter>
        {!focus && <><Enter i={1}><h2 className="h1">One person.<br /><span className="it">Five freshnesses.</span></h2></Enter>
          <Enter i={2}><p className="lede" style={{ marginTop: 30 }}>The same person wants a different freshness at 7 AM and at 10 PM.</p></Enter>
          {topMoment && <Enter i={3}><p className="clock-pre"><span className="k">The room said the missing moment is</span><b className="h3 it">{topMoment[0]}</b></p></Enter>}</>}
        {focus && t && (
          <div className="clock-focus" key={focus.l}>
            <div className="num clock-time">{String(Math.floor(focus.h)).padStart(2, '0')}:{focus.h % 1 ? '30' : '00'}</div>
            <h2 className="h1">{focus.l}</h2>
            <p className="lede">{focus.need}</p>
            <div className="clock-hero">{t.image && <img src={t.image} alt="" />}<div><span className="k">{t.name}</span><b className="h3 it">{t.hero}</b></div></div>
          </div>
        )}
      </div>
    </div>
  );
}

// The Bench: each team tunes its concept's sensory signature; engineering answers plainly.
export function BenchScene({ s, step }: SceneProps) {
  const team = Math.min(3, step + 1);
  const c = s.concepts[`t${team}-1`];
  const b = s.bench[team];
  const t = baseTerritory(s, team, c);
  const { avg, min, max, n } = teamDials(b);
  const prof = compass(t, avg);
  const cv = useTween(curve(t, avg));
  const { list, code, claims } = readouts(t, avg, b, c);
  const mission = MISSIONS.find((m) => m.id === s.missions[team - 1]);
  const W = 520, H = 150, pts = cv.map((y, i) => [30 + i * ((W - 60) / 3), H - 30 - y * (H - 60)]);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
  return (
    <div className="bench" style={{ ['--c1' as any]: t.palette[0], ['--c2' as any]: t.palette[1] }}>
      <div className="bench-bg" />
      <div className="bench-head">
        <div className="k">The Bench · Team {team} of 3 · {n} {n === 1 ? 'phone' : 'phones'} tuning{b?.locked ? ' · locked' : ''}</div>
        <h2 className="h2">{c?.name || mission?.title || `Team ${team}`}</h2>
        <div className="bench-base"><span className="k">Built on</span> {t.name} · <span className="it">{t.hero}</span></div>
      </div>
      <div className="bench-dials">
        {DIALS.map((d) => (
          <div key={d.id} className="bd">
            <div className="bd-top"><b>{d.l}</b><span className="num">{avg[d.id].toFixed(1)}</span></div>
            <div className="bd-track">
              <i className="bd-spread" style={{ left: `${((min[d.id] - 1) / 4) * 100}%`, width: `${((max[d.id] - min[d.id]) / 4) * 100}%` }} />
              <i className="bd-dot" style={{ left: `${((avg[d.id] - 1) / 4) * 100}%` }} />
            </div>
            <div className="bd-ends"><span>{d.lo}</span><span>{d.hi}</span></div>
          </div>
        ))}
        <div className="src">The band is the team&rsquo;s spread. Wide band, good argument.</div>
      </div>
      <div className="bench-mid">
        <Compass prof={prof[1]} color={t.palette[1]} size={430} stage="Heart of the flavor · grey is today&rsquo;s core mint" />
        <svg className="bench-curve" viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
          {['First', 'Heart', 'Finish', 'Linger'].map((l, i) => <text key={l} x={30 + i * ((W - 60) / 3)} y={H - 6} textAnchor="middle" className="axis">{l.toUpperCase()}</text>)}
          <path d={path} fill="none" stroke={t.palette[1]} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={7} fill={t.palette[1]} />)}
        </svg>
      </div>
      <div className="bench-read">
        <div className="k">Engineering readout</div>
        {list.map((r) => (
          <div key={r.key} className={'br ' + (r.override ? 'ov' : r.tone)}>
            <span>{r.label}</span><b>{r.override ? r.override.value : r.value}</b>
            <small>{r.override ? `Alex: ${r.override.note || 'confirmed on the bench'}` : r.basis}</small>
          </div>
        ))}
        <div className="k" style={{ marginTop: 18 }}>Flavor Code check</div>
        <div className="bcode">{code.map((x) => <div key={x.n} className={x.ok ? 'ok' : 'warn'} title={x.why}><i />{x.t}{!x.ok && <small>{x.why}</small>}</div>)}</div>
        {claims && <div className="bclaims">Benefit language set by C&amp;D clinical and regulatory.</div>}
        <div className="src" style={{ marginTop: 12 }}>Rules of thumb from public literature. The TFF lab confirms on the bench.</div>
      </div>
    </div>
  );
}
