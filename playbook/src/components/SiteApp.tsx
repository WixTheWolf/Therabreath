'use client';
// The site: the front door, behind the password. One long scroll that teaches the story and lets
// people play with it: the film, the vocabulary, two worlds meeting, six shifts, seven territories,
// the atlas, the flavor clock and a pocket version of The Bench. It goes "Live" once the session starts.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Compass } from './scenes/Hybrid';
import FilmModal from './FilmModal';
import { useSession } from '@/lib/useSession';
import { tallyPick, ranked } from '@/lib/state';
import { compass, curve, readouts, DEFAULT_DIALS } from '@/lib/bench';
import { EVENT, VOCAB, SHIFTS, TERRITORIES, DAYPARTS, DIALS, SCIENCE, IMAGINATION, REGIONS, ATLAS_STAGES, AGENDA, OBJECTIVES } from '@/lib/content';
import { WORLD, WORLD_DOTS } from '@/lib/worldmap';

const LIVE_CODE = 'TB1109';
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);

// Progress through a tall section: 0 when its top reaches the top of the screen, 1 when its bottom does.
function useProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const f = () => {
      raf = 0; const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect(); const span = Math.max(1, r.height - innerHeight);
      setP(clamp(-r.top / span));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(f); };
    f(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
  return [ref, p] as const;
}

// Adds .in when an element scrolls into view, for gentle rises.
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('in')), { threshold: 0.2 });
    document.querySelectorAll('.st-rise').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const NAV = [['hero', 'Film'], ['vocab', 'Vocabulary'], ['worlds', 'Two worlds'], ['shifts', 'Shifts'], ['territories', 'Territories'], ['atlas', 'Atlas'], ['clock', 'Clock'], ['bench', 'The Bench'], ['close', 'The morning']];

export default function SiteApp() {
  const { state: s } = useSession(LIVE_CODE, { interval: 8000 });
  const live = s.scene > 0 || Object.keys(s.participants).length > 0;
  const tally = tallyPick(s, 'territories');
  const rank = ranked(tally).filter(([, n]) => n > 0).map(([id]) => id);
  const [film, setFilm] = useState(false);
  const [active, setActive] = useState('hero');
  useReveal();
  useEffect(() => { document.documentElement.dataset.theme = 'b'; }, []);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-45% 0px -50% 0px' });
    NAV.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  return (
    <main className="site" data-theme="b">
      <header className="st-bar">
        <div className="st-lock"><img src="/img/tff-logo-white.webp" alt="The Flavor Factory" /><span>×</span><b>TheraBreath</b></div>
        {live && <a className="st-live" href={`/playbook/${LIVE_CODE}`}><i />Live now · open the room&rsquo;s Playbook</a>}
        <a className="st-host" href="/host">Host tools</a>
      </header>
      <nav className="st-rail" aria-label="Chapters">
        {NAV.map(([id, l]) => <a key={id} href={`#${id}`} className={active === id ? 'on' : ''}><span>{l}</span><i /></a>)}
      </nav>

      <Hero onFilm={() => setFilm(true)} live={live} />
      <Vocab />
      <Worlds />
      <ShiftTrack />
      <Worlds7 live={live} rank={rank} tally={tally} />
      <Atlas />
      <FlavorClock />
      <PocketBench />
      <Close live={live} />

      {film && <FilmModal onClose={() => setFilm(false)} />}
    </main>
  );
}

function Hero({ onFilm, live }: { onFilm: () => void; live: boolean }) {
  return (
    <section id="hero" className="st-hero">
      <video autoPlay muted loop playsInline poster="/media/opening-poster.jpg"><source src="/media/loop.mp4" type="video/mp4" /></video>
      <div className="st-shade" />
      <div className="st-hero-in">
        <div className="st-k">{EVENT.date} · {EVENT.time} ET · {EVENT.room} room</div>
        <h1>The Future<br /><em>of Freshness</em></h1>
        <p>What should TheraBreath taste like next? Two hours, twelve people, one Playbook.{live ? ' The session is live.' : ''}</p>
        <div className="st-cta">
          <button className="st-play" onClick={onFilm}><span className="st-tri" />Play the film <small>30 seconds · sound on</small></button>
          <a className="st-ghost" href="#vocab">Scroll to begin</a>
        </div>
      </div>
      <div className="st-cue"><i /></div>
    </section>
  );
}

// "Mint" is where freshness starts, not where it ends. Scroll and the vocabulary bursts out of it.
function Vocab() {
  const [ref, p] = useProgress<HTMLElement>();
  const [pick, setPick] = useState<number | null>(null);
  const spots = useMemo(() => VOCAB.map((_, i) => {
    const inner = i < 7, k = inner ? i / 7 : (i - 7) / 9, off = inner ? 0.2 : 0.05;
    const a = (k + off) * Math.PI * 2, rx = inner ? 24 : 40, ry = inner ? 20 : 34;
    return [50 + Math.cos(a) * rx, 50 + Math.sin(a) * ry];
  }), []);
  const burst = ease((p - 0.08) / 0.55);
  const n = Math.round(clamp((p - 0.08) / 0.55) * VOCAB.length);
  return (
    <section id="vocab" ref={ref} className="st-tall" style={{ height: '280vh' }}>
      <div className="st-stick st-vocab">
        <div className="st-k st-top">01 · The vocabulary of freshness</div>
        <div className="st-mint" style={{ transform: `translate(-50%,-50%) scale(${1.25 - burst * 0.35})` }}>Mint</div>
        {VOCAB.map((v, i) => {
          const e = ease((p - 0.08 - i * 0.018) / 0.5);
          const [x, y] = spots[i];
          return (
            <button key={v.w} className={'st-word' + (pick === i ? ' on' : '')} onClick={() => setPick(pick === i ? null : i)}
              style={{ left: `${50 + (x - 50) * e}%`, top: `${50 + (y - 50) * e}%`, opacity: e, transform: `translate(-50%,-50%) scale(${0.4 + e * 0.6})` }}>{v.w}</button>
          );
        })}
        <div className="st-vocab-foot">
          {pick !== null ? <p><b>{VOCAB[pick].w}.</b> {VOCAB[pick].d}</p>
            : <p>{n < 2 ? 'Freshness used to mean one word.' : n < VOCAB.length ? `${n + 1} words and counting.` : `Now it means ${VOCAB.length + 1}. Tap any word.`}</p>}
        </div>
      </div>
    </section>
  );
}

// Science and imagination slide together into one drop: freshness, designed.
function Worlds() {
  const [ref, p] = useProgress<HTMLElement>();
  const m = ease(p / 0.7), drop = ease((p - 0.6) / 0.3);
  return (
    <section id="worlds" ref={ref} className="st-tall" style={{ height: '240vh' }}>
      <div className="st-stick st-worlds">
        <div className="st-k st-top">02 · Two worlds meet</div>
        <div className="st-col left" style={{ transform: `translateX(${-(1 - m) * 26}vw)`, opacity: 1 - drop * 0.96 }}>
          <b>The science</b>{SCIENCE.map((x, i) => <span key={x} style={{ transitionDelay: `${i * 40}ms` }}>{x}</span>)}
        </div>
        <div className="st-col right" style={{ transform: `translateX(${(1 - m) * 26}vw)`, opacity: 1 - drop * 0.96 }}>
          <b>The imagination</b>{IMAGINATION.map((x) => <span key={x}>{x}</span>)}
        </div>
        <div className="st-drop" style={{ opacity: drop, transform: `translate(-50%,-50%) scale(${0.6 + drop * 0.4})` }}>
          <div className="st-drop-orb" />
          <h2>Freshness,<br /><em>designed.</em></h2>
          <p>The Flavor Factory brings the science. TheraBreath brings the people who trust it. The morning is where they meet.</p>
        </div>
      </div>
    </section>
  );
}

// Six shifts on a horizontal track. Each one crosses out the old idea as it passes the middle.
function ShiftTrack() {
  const [ref, p] = useProgress<HTMLElement>();
  const track = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => { const f = () => setW((track.current?.scrollWidth || 0) - innerWidth); f(); addEventListener('resize', f); return () => removeEventListener('resize', f); }, []);
  return (
    <section id="shifts" ref={ref} className="st-tall" style={{ height: '360vh' }}>
      <div className="st-stick st-shifts">
        <div className="st-k st-top">03 · Six shifts · what is changing</div>
        <div className="st-track" ref={track} style={{ transform: `translateX(${-p * Math.max(0, w)}px)` }}>
          <div className="st-shift intro"><h2>What people<br />expect from<br /><em>fresh</em> is moving.</h2><p>Keep scrolling. Watch each old idea give way.</p></div>
          {SHIFTS.map((x, i) => {
            const local = clamp((p - (i + 0.4) / (SHIFTS.length + 1.2)) * (SHIFTS.length + 1) * 1.1);
            return (
              <div key={x.a} className="st-shift" style={{ ['--x' as any]: local }}>
                <span className="st-n">0{i + 1}</span>
                <div className="st-from"><span>{x.a}</span><i /></div>
                <div className="st-arrow">↓</div>
                <div className="st-to">{x.b}</div>
                <p>{x.d}</p>
              </div>
            );
          })}
          <div className="st-shift outro"><h2>Six shifts.<br /><em>Seven worlds</em><br />to answer them.</h2></div>
        </div>
        <div className="st-meter"><i style={{ width: `${p * 100}%` }} /></div>
      </div>
    </section>
  );
}

// Seven territories: photography, a morphing Compass, and the room's ranking once the vote is in.
function Worlds7({ live, rank, tally }: { live: boolean; rank: string[]; tally: Record<string, number> }) {
  const [i, setI] = useState(0);
  const [stage, setStage] = useState(1);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setI(Number((e.target as HTMLElement).dataset.i))), { rootMargin: '-55% 0px -40% 0px' });
    document.querySelectorAll('.st-terr-panel').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  useEffect(() => { if (!auto) return; const t = setInterval(() => setStage((x) => (x + 1) % 3), 2400); return () => clearInterval(t); }, [auto]);
  const t = TERRITORIES[i];
  return (
    <section id="territories" className="st-terr">
      <div className="st-terr-vis" style={{ ['--c1' as any]: t.palette[0], ['--c2' as any]: t.palette[1] }}>
        {TERRITORIES.map((x, j) => x.image ? <img key={x.id} src={x.image} alt="" className={j === i ? 'on' : ''} /> : <div key={x.id} className={'st-noimg' + (j === i ? ' on' : '')} style={{ background: `radial-gradient(circle at 40% 40%, ${x.palette[0]}, ${x.palette[1]} 55%, ${x.palette[2] || x.palette[1]})` }} />)}
        <div className="st-terr-veil" />
        <div className="st-terr-cmp">
          <Compass prof={t.prof[stage]} color={t.palette[1]} size={440} />
          <div className="st-stage-tabs">
            {['First impression', 'Heart', 'Finish'].map((l, j) => <button key={l} className={stage === j ? 'on' : ''} onClick={() => { setAuto(false); setStage(j); }}>{l}</button>)}
          </div>
          <div className="st-src">Dashed line: today&rsquo;s core mint. Conceptual, not panel data.</div>
        </div>
      </div>
      <div className="st-terr-list">
        <div className="st-terr-head st-rise"><div className="st-k">04 · Seven territories</div><h2>Seven places<br />flavor <em>can go.</em></h2><p>Scroll through each world. Tap First, Heart or Finish to see how it moves in the mouth.</p></div>
        {TERRITORIES.map((x, j) => {
          const r = rank.indexOf(x.id);
          return (
            <article key={x.id} data-i={j} className={'st-terr-panel' + (j === i ? ' on' : '')} style={{ ['--c1' as any]: x.palette[0], ['--c2' as any]: x.palette[1] }}>
              <div className="st-terr-n">0{x.n}<span className="st-fit">{x.fit}</span>{r > -1 && <span className="st-rank">No. {r + 1} in the room · {tally[x.id]} chips</span>}</div>
              <h3>{x.name}</h3>
              <div className="st-hero-fl">{live ? <>Hero flavor: <b>{x.hero}</b></> : <><span className="st-seal" />Hero flavor revealed in the room</>}</div>
              <p className="st-promise">{x.promise}</p>
              <div className="st-arc">{x.arc.map((a, k) => <div key={a}><small>{['First', 'Heart', 'Finish'][k]}</small><b>{a}</b></div>)}</div>
              <div className="st-palette">{x.palette.map((c) => <i key={c} style={{ background: c }} />)}<span>{x.moment}</span></div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// The atlas: where the new flavors come from, and how far along the road to personal care they are.
function Atlas() {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => { if (!auto) return; const t = setInterval(() => setI((x) => (x + 1) % REGIONS.length), 5200); return () => clearInterval(t); }, [auto]);
  const r = REGIONS[i];
  const terr = TERRITORIES.find((t) => t.id === r.terr);
  return (
    <section id="atlas" className="st-atlas st-rise">
      <div className="st-k">05 · The flavor atlas</div>
      <h2>Consumers already <em>know</em> these flavors.<br />They met them on menus.</h2>
      <div className="st-atlas-grid">
        <svg viewBox={`0 0 ${WORLD.w} ${WORLD.h}`} className="st-map" role="img" aria-label="World map of flavor origins">
          <path d={WORLD_DOTS} className="st-dots" />
          {REGIONS.map((x, j) => {
            const [cx, cy] = WORLD.pts[x.at as keyof typeof WORLD.pts];
            return (
              <g key={x.id} className={'st-pin' + (j === i ? ' on' : '')} onClick={() => { setAuto(false); setI(j); }} style={{ ['--pc' as any]: x.col }}>
                <circle cx={cx} cy={cy} r={34} className="st-pin-halo" />
                <circle cx={cx} cy={cy} r={11} className="st-pin-dot" />
                <text x={cx} y={cy - 26} textAnchor="middle">{x.name}</text>
              </g>
            );
          })}
        </svg>
        <div className="st-region" key={r.id} style={{ ['--pc' as any]: r.col }}>
          <div className="st-region-name">{r.name}</div>
          <p className="st-region-sens">{r.sensory}</p>
          <div className="st-ings">
            {r.ing.map(([n, lv]) => (
              <div key={n} className="st-ing"><b>{n}</b><div className="st-road">{ATLAS_STAGES.map((_, k) => <i key={k} className={k < lv ? 'on' : ''} />)}</div><small>{ATLAS_STAGES[lv - 1]}</small></div>
            ))}
          </div>
          <p><span className="st-lab">Why it travels</span>{r.why}</p>
          <p><span className="st-lab">Where you meet it</span>{r.where}</p>
          <p className="st-oral"><span className="st-lab">In oral care</span>{r.oral}{terr && <em> · {terr.name}</em>}</p>
          <div className="st-region-nav">{REGIONS.map((x, j) => <button key={x.id} className={j === i ? 'on' : ''} onClick={() => { setAuto(false); setI(j); }} aria-label={x.name} />)}</div>
        </div>
      </div>
      <div className="st-src">The road runs from origin cuisine to personal care. Adoption stages are The Flavor Factory&rsquo;s read, not measured data.</div>
    </section>
  );
}

// The flavor clock: drag the hand around the day and watch freshness change with it.
function FlavorClock() {
  const [h, setH] = useState(6.5);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef(false);
  const near = DAYPARTS.reduce((a, b) => (Math.min(Math.abs(b.h - h), 24 - Math.abs(b.h - h)) < Math.min(Math.abs(a.h - h), 24 - Math.abs(a.h - h)) ? b : a));
  const t = TERRITORIES.find((x) => x.id === near.terr)!;
  const ang = (x: number) => (x / 24) * Math.PI * 2 - Math.PI / 2;
  const at = (x: number, r: number) => [200 + Math.cos(ang(x)) * r, 200 + Math.sin(ang(x)) * r];
  const move = (e: React.PointerEvent) => {
    if (!drag.current || !svg.current) return;
    const b = svg.current.getBoundingClientRect();
    const a = Math.atan2(e.clientY - (b.top + b.height / 2), e.clientX - (b.left + b.width / 2)) + Math.PI / 2;
    setH((((a / (Math.PI * 2)) * 24) + 24) % 24);
  };
  const sky = h < 5 || h > 21 ? '#0B1B2B' : h < 8 ? '#F2B880' : h < 17 ? '#8FD3E8' : h < 20 ? '#E98A5B' : '#3A3F6B';
  const [hx, hy] = at(h, 150);
  const clockTxt = `${String(Math.floor(h) % 12 || 12)}:${String(Math.floor((h % 1) * 60 / 15) * 15).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  return (
    <section id="clock" className="st-clock st-rise" style={{ ['--sky' as any]: sky }}>
      <div className="st-clock-copy">
        <div className="st-k">06 · The flavor clock</div>
        <h2>The same person wants a different freshness at <em>7 AM</em> and at <em>10 PM.</em></h2>
        <p>Drag the hand around the day, or tap a moment.</p>
        <div className="st-parts">{DAYPARTS.map((d) => <button key={d.l} className={near === d ? 'on' : ''} onClick={() => setH(d.h)}>{d.l}</button>)}</div>
      </div>
      <svg ref={svg} viewBox="0 0 400 400" className="st-dial" onPointerDown={(e) => { drag.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); move(e); }} onPointerMove={move} onPointerUp={() => (drag.current = false)}>
        <circle cx="200" cy="200" r="185" className="st-dial-face" />
        {Array.from({ length: 24 }, (_, k) => { const [x1, y1] = at(k, 172); const [x2, y2] = at(k, k % 6 ? 178 : 164); return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} className="st-tick" />; })}
        {[0, 6, 12, 18].map((k) => { const [x, y] = at(k, 140); return <text key={k} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="st-hr">{['Midnight', '6 AM', 'Noon', '6 PM'][k / 6]}</text>; })}
        {DAYPARTS.map((d) => { const [x, y] = at(d.h, 110); const tt = TERRITORIES.find((z) => z.id === d.terr)!; return <circle key={d.l} cx={x} cy={y} r={near === d ? 16 : 9} fill={tt.palette[1]} className="st-dp" />; })}
        <line x1="200" y1="200" x2={hx} y2={hy} className="st-hand" />
        <circle cx={hx} cy={hy} r="16" className="st-knob" />
        <circle cx="200" cy="200" r="6" className="st-hub" />
        <text x="200" y="250" textAnchor="middle" className="st-time">{clockTxt}</text>
      </svg>
      <div className="st-moment" key={near.l} style={{ ['--c1' as any]: t.palette[0], ['--c2' as any]: t.palette[1] }}>
        {t.image ? <img src={t.image} alt="" /> : <div className="st-noimg on" style={{ background: `linear-gradient(135deg, ${t.palette[0]}, ${t.palette[1]})` }} />}
        <div><div className="st-lab">{near.l}</div><b>{near.need}</b><span>{t.name}</span></div>
      </div>
    </section>
  );
}

// Idea to formula: a pocket Bench. Pick a world, move six dials, watch the Compass and the readouts respond.
function PocketBench() {
  const [tid, setTid] = useState('warmcool');
  const [d, setD] = useState<Record<string, number>>({ ...DEFAULT_DIALS });
  const t = TERRITORIES.find((x) => x.id === tid)!;
  const prof = compass(t, d)[1];
  const cv = curve(t, d);
  const out = readouts(t, d);
  const warn = out.code.filter((c) => !c.ok);
  const pts = cv.map((v, k) => `${20 + k * 160},${150 - v * 120}`).join(' ');
  return (
    <section id="bench" className="st-bench">
      <div className="st-bench-head st-rise">
        <div className="st-k">07 · From idea to formula</div>
        <h2>On November 9 each team <em>engineers</em> its idea on The Bench.<br />Try it now.</h2>
        <ol className="st-steps">{['A consumer moment', 'A sensory brief', 'The Bench', 'The Flavor Factory lab'].map((x, k) => <li key={x} className={k === 2 ? 'on' : ''}><span>0{k + 1}</span>{x}</li>)}</ol>
      </div>
      <div className="st-bench-grid">
        <div className="st-bench-ctl">
          <div className="st-chips">{TERRITORIES.map((x) => <button key={x.id} className={tid === x.id ? 'on' : ''} style={{ ['--c2' as any]: x.palette[1] }} onClick={() => setTid(x.id)}>{x.name}</button>)}</div>
          {DIALS.map((x) => (
            <label key={x.id} className="st-dial-row"><span>{x.l}<b>{d[x.id]}</b></span>
              <input type="range" min={1} max={5} value={d[x.id]} onChange={(e) => setD({ ...d, [x.id]: Number(e.target.value) })} style={{ ['--v' as any]: `${(d[x.id] - 1) * 25}%` }} />
              <small><i>{x.lo}</i><i>{x.hi}</i></small>
            </label>
          ))}
          <button className="st-ghost sm" onClick={() => setD({ ...DEFAULT_DIALS })}>Reset the dials</button>
        </div>
        <div className="st-bench-out">
          <Compass prof={prof} color={t.palette[1]} size={420} />
          <svg viewBox="0 0 520 170" className="st-curve"><polyline points={pts} style={{ stroke: t.palette[1] }} />{cv.map((v, k) => <circle key={k} cx={20 + k * 160} cy={150 - v * 120} r="6" style={{ fill: t.palette[1] }} />)}{['First', 'Heart', 'Finish', 'Linger'].map((l, k) => <text key={l} x={20 + k * 160} y="168" textAnchor="middle">{l}</text>)}</svg>
        </div>
        <div className="st-bench-read">
          {out.list.map((r) => <div key={r.key} className={'st-read ' + r.tone}><span className="st-lab">{r.label}</span><b>{r.value}</b><small>{r.basis}</small></div>)}
          <div className={'st-code' + (warn.length ? ' warn' : '')}>
            <span className="st-lab">The Flavor Code</span>
            <div className="st-lights">{out.code.map((c) => <i key={c.n} className={c.ok ? 'ok' : 'no'} title={c.t} />)}</div>
            <small>{warn.length ? warn[0].why : 'All seven guardrails clear.'}</small>
          </div>
        </div>
      </div>
      <div className="st-src">Illustrative rules of thumb, reviewed with The Flavor Factory&rsquo;s flavorists [CONFIRM with Alex]. No formulas, codes or usage levels, ever.</div>
    </section>
  );
}

function Close({ live }: { live: boolean }) {
  return (
    <section id="close" className="st-close">
      <div className="st-close-orb" />
      <div className="st-k st-rise">The morning · {EVENT.date}</div>
      <h2 className="st-rise">You will leave with a Playbook<br />that has <em>your name</em> on it.</h2>
      <div className="st-qs st-rise">{OBJECTIVES.map((o) => <div key={o.n}><span>{o.n}</span>{o.ask}</div>)}</div>
      <ol className="st-agenda st-rise">{AGENDA.map(([t, l]) => <li key={t}><b>{t}</b>{l}</li>)}</ol>
      {live ? <a className="st-play" href={`/playbook/${LIVE_CODE}`}>Open the room&rsquo;s Playbook</a> : <p className="st-note">{EVENT.time} ET · {EVENT.room} room · Church &amp; Dwight. Come curious, and hungry for something other than mint.</p>}
      <footer className="st-foot">Confidential and private · TheraBreath × The Flavor Factory</footer>
    </section>
  );
}
