'use client';
import { useEffect, useState } from 'react';
import Light, { project } from '../Light';
import { R, Enter, SceneProps, Src } from './ui';
import { CLIMB, GAP, PORTFOLIO, MARKET, SIGNALS, SOURCES } from '@/lib/content';
import { tallyPick, ranked } from '@/lib/state';

// 6. The climb: a share line that draws itself.
export function Climb({ step }: SceneProps) {
  const W = 1500, H = 360, X = (i: number) => 60 + i * ((W - 160) / (CLIMB.length - 1)), Y = (v: number) => H - 40 - (v / 30) * (H - 80);
  const d = CLIMB.map((c, i) => `${i ? 'L' : 'M'}${X(i)} ${Y(c.v)}`).join(' ');
  return (
    <div className="pad">
      <Enter i={0}><div className="k">The climb · US mouthwash share</div></Enter>
      <Enter i={1}><h2 className="h1">Number 2 in US mouthwash.<br /><span className="it">Next stop: number 1.</span></h2></Enter>
      <svg className="climb" viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs><linearGradient id="cl" x1="0" x2="1"><stop offset="0" stopColor="var(--fg3)" /><stop offset="1" stopColor="var(--accent)" /></linearGradient></defs>
        {[0, 10, 20, 30].map((v) => <g key={v}><line x1={40} x2={W - 40} y1={Y(v)} y2={Y(v)} stroke="var(--rule2)" /><text x={0} y={Y(v) + 6} className="axis">{v}%</text></g>)}
        <path d={d} className="climb-line" fill="none" stroke="url(#cl)" strokeWidth={5} strokeLinecap="round" />
        {CLIMB.map((c, i) => (
          <g key={i} className="climb-pt" style={{ ['--i' as any]: i }}>
            <circle cx={X(i)} cy={Y(c.v)} r={i === CLIMB.length - 1 ? 14 : 9} className={i === CLIMB.length - 1 ? 'last' : ''} />
            <text x={X(i)} y={Y(c.v) - 34} textAnchor="middle" className="cv">{c.approx ? 'just under 22%' : `${c.v}%`}</text>
            <text x={X(i)} y={H + 0} textAnchor="middle" className="cl">{c.label}</text>
          </g>
        ))}
      </svg>
      <R b={1} step={step} className="climb-note lede">25.3% in Q2 2026, up 4.5 points. Consumption growth above 20%.</R>
      <Src k={['warc', 'q4call', 'q2call']} />
    </div>
  );
}

// 7. The gap: 65 vs 14. The empty space fills with light.
const GLASS_CAM = { pos: [0, 1.3, 10.8], target: [0, 0.98, 0], fov: 24, shift: [0.36, 0.0] };
export function Gap({ step }: SceneProps) {
  const [t0] = useState(() => performance.now());
  const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  const [lab, setLab] = useState([0, 0]);
  useEffect(() => { let r = 0; const f = () => { const t = (performance.now() - t0) / 1000; setLab([Math.round(65 * ease((t - 0.4) / 2.6)), Math.round(14 * ease((t - 0.4) / 2.6))]); if (t < 3.2) r = requestAnimationFrame(f); }; r = requestAnimationFrame(f); return () => cancelAnimationFrame(r); }, [t0]);
  const [x0, y0] = project([-0.95, 0, 0.9], GLASS_CAM), [x1, y1] = project([0.95, 0, 0.9], GLASS_CAM), [tx, ty] = project([1.61, 1.55, 0], GLASS_CAM);
  const stepRef = step;
  return (
    <>
      <Light scene="glasses" theme="a" camera={GLASS_CAM} frame={(t) => ({ fill: [Math.max(0.001, 0.65 * ease((t - 0.4) / 2.6)), Math.max(0.001, 0.14 * ease((t - 0.4) / 2.6))], glow: stepRef >= 1 ? 1 : 0 })} />
      <div className="gap-copy">
        <div className="k">The gap · household penetration</div>
        <R b={1} step={step}><h1 className="h1"><span className="it">86</span> of every 100 US households have not met TheraBreath yet.</h1></R>
        <R b={2} step={step}><div className="gap-second it">Flavor is how we introduce ourselves.</div></R>
        <Src k="q2call" extra="TheraBreath 14%, mouthwash category 65%" style={{ position: 'absolute', top: 700, left: 0, width: 760 }} />
      </div>
      <div className="glabel" style={{ left: x0, top: y0 + 20 }}><div className="num">{lab[0]}<sup>%</sup></div><div className="who">Mouthwash category</div></div>
      <div className="glabel" style={{ left: x1, top: y1 + 20 }}><div className="num">{lab[1]}<sup>%</sup></div><div className="who">TheraBreath</div></div>
      <R b={1} step={step} className="tag86" style={{ left: Math.min(tx + 10, 1600), top: ty }}>The 86%</R>
    </>
  );
}

// Everything mint makes possible: light in the territory palettes fills the open space.
const POSSIBLE = Array.from({ length: 42 }, (_, i) => { const cols = ['#F4B860', '#E0407B', '#8FAF97', '#D98E3A', '#57518F', '#F2677B', '#CFE8C6', '#BFE9F2']; const a = i * 2.39996, r = 180 + (i * 53) % 520; return [Math.round(1180 + Math.cos(a) * r * 1.3), Math.round(560 + Math.sin(a) * r * 0.75), 14 + (i * 7) % 34, cols[i % cols.length]] as [number, number, number, string]; });

// 8. The portfolio: a constellation of mints that zooms out into open space.
export function Portfolio({ step }: SceneProps) {
  const groups = ['Rinse', 'Toothpaste', 'Kids', 'Lozenge', 'Gum', 'Sachet'];
  const centers: Record<string, [number, number]> = { Rinse: [0, 0], Toothpaste: [300, -170], Kids: [-330, -200], Lozenge: [-300, 190], Gum: [270, 200], Sachet: [30, 280] };
  const nodes = PORTFOLIO.map((v, i) => {
    const g = groups.indexOf(v.format); const inG = PORTFOLIO.filter((x) => x.format === v.format); const k = inG.indexOf(v);
    const a = (k / inG.length) * Math.PI * 2 + g; const rr = v.format === 'Rinse' ? 150 : 70;
    const [cx, cy] = centers[v.format];
    return { v, x: cx + Math.cos(a) * rr * (0.55 + (k % 2) * 0.45), y: cy + Math.sin(a) * rr * (0.55 + (k % 2) * 0.45), mint: /mint/i.test(v.flavor) };
  });
  const zoom = step >= 1;
  return (
    <div className="portfolio">
      <div className="pad" style={{ position: 'absolute', zIndex: 2 }}>
        <Enter i={0}><div className="k">The portfolio today · {PORTFOLIO.length} flavors across six formats</div></Enter>
        <div className="pf-title">
          <div className={'pft' + (zoom ? ' out' : '')}><h2 className="h1">We have mastered mint.</h2></div>
          <div className={'pft' + (zoom ? '' : ' out')}><h2 className="h1 it" style={{ maxWidth: 900 }}>The next chapter is everything mint makes possible.</h2></div>
        </div>
      </div>
      <div className={'constellation' + (zoom ? ' zoom' : '')}>
        {nodes.map((n, i) => (
          <div key={i} className={'star' + (n.mint ? ' mint' : ' other')} style={{ left: 1180 + n.x, top: 560 + n.y, ['--i' as any]: i }}>
            <i /><span>{n.v.flavor}</span>
          </div>
        ))}
        {groups.map((g) => <div key={g} className="cgroup" style={{ left: 1180 + centers[g][0], top: 560 + centers[g][1] + (g === 'Rinse' ? 190 : 100) }}>{g}</div>)}
      </div>
      <div className={'possible' + (zoom ? ' on' : '')}>{POSSIBLE.map((p, i) => <i key={i} style={{ left: p[0], top: p[1], ['--s' as any]: `${p[2]}px`, ['--c' as any]: p[3], ['--i' as any]: i }} />)}</div>
      <Src k="listings" style={{ position: 'absolute', left: 120, bottom: 118 }} />
    </div>
  );
}

// 9. The market is moving: a neutral timeline of public flavor moves.
export function Market({ step }: SceneProps) {
  return (
    <div className="pad">
      <Enter i={0}><div className="k">The market is moving · public launches</div></Enter>
      <Enter i={1}><h2 className="h2" style={{ maxWidth: 1400 }}>The flavor race has started. <span className="it">It is being run at the shelf, one limited edition at a time.</span></h2></Enter>
      <div className="market">
        <div className="mk-line" />
        {MARKET.map((m, i) => (
          <R key={i} b={i + 1} step={step} className={'mk' + (m.who === 'TheraBreath' ? ' tb' : '')}>
            <div className="mk-when">{m.when}</div><i />
            <div className="mk-who">{m.who}</div>
            <p>{m.what}</p>
            <div className="src">{SOURCES[m.src]}</div>
          </R>
        ))}
      </div>
    </div>
  );
}

// 10 to 16. The seven signals: a deck of glass cards; the current one fills the screen.
export function Signal({ step, idx }: SceneProps) {
  const sig = SIGNALS[idx - 1];
  return (
    <div className="signal" style={{ ['--h' as any]: sig.hue }}>
      <div className="sig-light" />
      <div className="sig-deck">{SIGNALS.map((x, i) => <div key={x.id} className={'sd' + (i === idx - 1 ? ' on' : i < idx - 1 ? ' past' : '')} style={{ ['--i' as any]: i, ['--h' as any]: x.hue }}><span className="num">0{x.n}</span></div>)}</div>
      <div className="pad" style={{ position: 'relative' }}>
        <Enter i={0}><div className="k">Signal {sig.n} of 7</div></Enter>
        <Enter i={1}><h2 className="hero sig-title">{sig.title}</h2></Enter>
        <div className="sig-proofs">
          {sig.proofs.map((p, i) => <R key={i} b={1} d={i * 180} step={step} className="proof"><p>{p.t}</p><div className="src">{SOURCES[p.src]}</div></R>)}
        </div>
        <R b={2} step={step} className="sig-so"><span className="k">So what for TheraBreath</span><div className="h2 it">{sig.so}</div></R>
      </div>
    </div>
  );
}

// 17. Live vote: seven glass bars that fill with liquid in real time.
export function SignalVote({ s, step }: SceneProps) {
  const t = tallyPick(s, 'signals');
  const v = s.votes.signals;
  const voters = Object.keys(v?.picks || {}).length;
  const max = Math.max(1, ...Object.values(t));
  const top3 = ranked(t).slice(0, 3).map((x) => x[0]);
  const revealed = v?.revealed || step >= 1;
  return (
    <div className="pad">
      <Enter i={0}><div className="k">Live vote · {voters} {voters === 1 ? 'vote' : 'votes'} {v?.open ? '· open' : v?.locked ? '· locked' : ''}</div></Enter>
      <Enter i={1}><h2 className="h2">Which three signals matter most for TheraBreath?</h2></Enter>
      <div className="glassbars">
        {SIGNALS.map((sig) => {
          const n = t[sig.id] || 0; const lvl = n / max; const top = revealed && top3.includes(sig.id);
          return (
            <div key={sig.id} className={'gb' + (top ? ' top' : '')} style={{ ['--h' as any]: sig.hue }}>
              <div className="gb-glass"><div className="gb-liquid" style={{ height: `${Math.max(3, lvl * 100)}%` }}><i /></div><b className="num">{n}</b></div>
              <div className="gb-lab"><span className="num">0{sig.n}</span>{sig.title.replace(/\.$/, '')}</div>
            </div>
          );
        })}
      </div>
      {revealed && <div className="lock-note"><span className="k">Locked into Chapter 1</span></div>}
    </div>
  );
}
