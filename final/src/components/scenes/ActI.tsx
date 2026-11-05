'use client';
import React, { useContext, useEffect, useState } from 'react';
import Light, { project } from '../Light';
import { R, Enter, SceneProps, Src, clean } from './ui';
import { CLIMB, GAP, PORTFOLIO, MARKET, SIGNALS, SOURCES, WHITESPACE, OBJECTIVES } from '@/lib/content';
import { tallyPick, ranked } from '@/lib/state';
import { LiveCtx } from '../show/ShowScenes';

// 6. The climb: a share line that draws itself.
export function Climb({ step }: SceneProps) {
  const W = 1500, H = 360, X = (i: number) => 60 + i * ((W - 160) / (CLIMB.length - 1)), Y = (v: number) => H - 40 - (v / 30) * (H - 80);
  const d = CLIMB.map((c, i) => `${i ? 'L' : 'M'}${X(i)} ${Y(c.v)}`).join(' ');
  return (
    <div className="pad">
      <Enter i={0}><div className="k">The climb · share of mouthwash</div></Enter>
      <Enter i={1}><h2 className="h1">Number 2 in mouthwash.<br /><span className="it">Earned one flavor at a time.</span></h2></Enter>
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
      <R b={1} step={step} className="climb-note lede">A record 26.8% in Q3 2026, up from 25.3% in Q2.</R>
      <Src k={['warc', 'q4call', 'q2call', 'q3call']} />
    </div>
  );
}

// 7. Out of every 100 households. It opens on the thesis; build 1 fills the glasses (65 of 100 buy mouthwash, 14 of 100
// buy TheraBreath), build 2 splits the 100 into three groups that add up (14, 51, 35), build 3 says what flavor could do
// and asks which group. One unit throughout: households out of 100. The record share of sales (a different measure) is
// in the talking points, not on screen, so the two never sit side by side.
const GLASS_CAM = { pos: [0, 1.3, 10.8], target: [0, 0.98, 0], fov: 24, shift: [0.36, 0.0] };
const OTHER = { another: GAP.category - GAP.tb, none: 100 - GAP.category };
export function Gap({ step }: SceneProps) {
  return (
    <>
      <div className={'thesis gap-thesis' + (step === 0 ? '' : ' away')}>
        <div className="tl1 on">TheraBreath built a strong position on a rinse without the burn.</div>
        <div className="tl2 it on">The next job is giving more people a reason to want it.</div>
      </div>
      {step >= 1 && <Glasses step={step} />}
    </>
  );
}
function Glasses({ step }: { step: number }) {
  // The labels count up with the glasses, from the glasses' first drawn frame, and stay hidden until then so the TV never
  // reads 0%. The PDF export (?still=1) shows the final figures straight away.
  const still = !!useContext(LiveCtx)?.still;
  const [t0, setT0] = useState(0);
  const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  const [lab, setLab] = useState([0, 0]);
  useEffect(() => { if (still) setLab([GAP.category, GAP.tb]); }, [still]);
  useEffect(() => { const id = setTimeout(() => setT0((v) => v || performance.now()), 8000); return () => clearTimeout(id); }, []);
  useEffect(() => { if (!t0 || still) return; let r = 0; const f = () => { const t = (performance.now() - t0) / 1000; setLab([Math.round(GAP.category * ease((t - 0.4) / 2.6)), Math.round(GAP.tb * ease((t - 0.4) / 2.6))]); if (t < 3.2) r = requestAnimationFrame(f); }; r = requestAnimationFrame(f); return () => cancelAnimationFrame(r); }, [t0, still]);
  const shown = still || t0 > 0;
  const [x0, y0] = project([-0.95, 0, 0.9], GLASS_CAM), [x1, y1] = project([0.95, 0, 0.9], GLASS_CAM);
  const glow = step >= 2 ? 1 : 0;
  return (
    <>
      <Light scene="glasses" theme="a" camera={GLASS_CAM} frame={(t) => ({ fill: [Math.max(0.001, (GAP.category / 100) * ease((t - 0.4) / 2.6)), Math.max(0.001, (GAP.tb / 100) * ease((t - 0.4) / 2.6))], glow })} onStart={() => setT0(performance.now())} />
      <div className="gap-copy gap-talk">
        <Enter i={0}><div className="k">Out of every 100 households</div></Enter>
        <Enter i={1} className="gap-share">TheraBreath is already number 2 in mouthwash.</Enter>
        <R b={2} step={step} className="gap-groups">
          <div className="tb"><b className="num">{GAP.tb}</b><span>buy TheraBreath</span></div>
          <div><b className="num">{OTHER.another}</b><span>buy mouthwash, not TheraBreath</span></div>
          <div><b className="num">{OTHER.none}</b><span>don&rsquo;t buy mouthwash</span></div>
        </R>
        <R b={3} step={step}><div className="gap-second it">Flavor could give more of these households a reason to try it.</div></R>
        <R b={3} step={step} className="room-ask"><span className="k">For the room</span><p>Which should a new flavor focus on first: the {GAP.tb}, the {OTHER.another} or the {OTHER.none}?</p></R>
      </div>
      <Src k="q3call" extra={`Household penetration: TheraBreath ${GAP.tb}%, mouthwash ${GAP.category}%`} style={{ left: 120, width: 820 }} />
      <div className={'glabel' + (shown ? ' on' : '')} style={{ left: x0, top: y0 + 20 }}><div className="num">{lab[0]}</div><div className="who">of 100 buy mouthwash</div></div>
      <div className={'glabel' + (shown ? ' on' : '')} style={{ left: x1, top: y1 + 20 }}><div className="num">{lab[1]}</div><div className="who">of 100 buy TheraBreath</div></div>
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
        <Enter i={0}><div className="k">Your portfolio today · {PORTFOLIO.length} flavors across six formats</div></Enter>
        <div className="pf-title">
          <div className={'pft' + (zoom ? ' out' : '')}><h2 className="h1">{PORTFOLIO.filter((v) => /mint/i.test(v.flavor)).length} of your {PORTFOLIO.length} products are mint,<br /><span className="it">and that’s a real strength.</span></h2></div>
          <div className={'pft' + (zoom ? '' : ' out')}><h2 className="h1 it" style={{ maxWidth: 900 }}>There’s a lot of room around mint.</h2></div>
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
      <Enter i={0}><div className="k">Recent launches · all public</div></Enter>
      <Enter i={1}><h2 className="h2" style={{ maxWidth: 1500 }}>Your competitors are launching flavors, <span className="it">mostly as limited editions.</span></h2></Enter>
      <div className="market">
        <div className="mk-line" />
        {MARKET.map((m, i) => (
          <R key={i} b={i + 1} step={step} className={'mk' + (m.who === 'TheraBreath' ? ' tb' : '')}>
            <div className="mk-when">{m.when}</div><i />
            <div className="mk-who">{m.who}</div>
            <p>{m.what}</p>
            <div className="src">{clean(SOURCES[m.src])}</div>
          </R>
        ))}
      </div>
      <R b={MARKET.length + 1} step={step} className="mk-turn"><span className="k">Where you stand</span><p>TheraBreath has been alcohol-free and dye-free from the start. It uses sodium chlorite, and it already has a kids line. <span className="it">So the real question is how flavor keeps it ahead.</span></p></R>
    </div>
  );
}

// The seven signals in one scene: a list on the left, and each build lights one signal with its proofs and its so what.
export function Signals({ step }: SceneProps) {
  const k = Math.min(SIGNALS.length, Math.max(0, step));
  const sig = k > 0 ? SIGNALS[k - 1] : null;
  return (
    <div className="signal sigs" style={{ ['--h' as any]: sig ? sig.hue : 190 }}>
      <div className="sig-light" style={{ opacity: sig ? 1 : 0.35 }} />
      <div className="pad" style={{ position: 'relative' }}>
        <Enter i={0}><div className="k">What we’re seeing</div></Enter>
        <Enter i={1}><h2 className="h2">Seven trends we think matter <span className="it">for oral care.</span></h2></Enter>
        <div className="sigs-list">
          {SIGNALS.map((x, i) => <div key={x.id} className={'sl' + (i === k - 1 ? ' on' : i < k - 1 ? ' past' : '')} style={{ ['--h' as any]: x.hue, ['--i' as any]: i }}><span className="num">0{x.n}</span><b>{x.title}</b></div>)}
        </div>
        {sig && (
          <div className="sigs-focus" key={sig.id}>
            <div className="k">Trend {sig.n} of 7 · Seen in {sig.from === 'Oral care' ? 'oral care' : 'food and flavor'}</div>
            <h3 className="sf-title">{sig.title}</h3>
            <div className="sf-proofs">{sig.proofs.map((p, i) => <div key={i} className="proof" style={{ ['--d' as any]: `${i * 180}ms` }}><p>{p.t}</p><div className="src">{clean(SOURCES[p.src])}</div></div>)}</div>
            <div className="sig-so"><span className="k">What it could mean for TheraBreath</span><div className="h3 it">{sig.so}</div></div>
          </div>
        )}
        {sig && <div className="sigs-ask" key={'ask-' + sig.id}><span className="k">For the room</span><p>{sig.ask}</p></div>}
        {!sig && <div className="sigs-hint">Each one comes with its public sources, where the evidence comes from (oral care itself, or food and flavor more widely), what it could mean for TheraBreath and a question for the room. They’re discussion starters, and you’ll vote on them right after.</div>}
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
          {sig.proofs.map((p, i) => <R key={i} b={1} d={i * 180} step={step} className="proof"><p>{p.t}</p><div className="src">{clean(SOURCES[p.src])}</div></R>)}
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

// White space: eight moments across, eight consumers down. Build 1 fills where TheraBreath lives today (the sink, morning and
// night, plus the dry mouth lozenge on the go). Build 2 brings in the room's own pre-work answers as bars on the moments and
// the consumers. Build 3 lights the open cells where the room's top moment and top consumer meet: the white space.
export function WhiteSpace({ s, step }: SceneProps) {
  const answers = Object.values(s.survey);
  const count = (key: 'consumer' | 'moment') => { const t: Record<string, number> = {}; answers.forEach((a) => a[key] && (t[a[key]!] = (t[a[key]!] || 0) + 1)); return t; };
  const mom = count('moment'), seg = count('consumer');
  const topMom = ranked(mom).slice(0, 2).map((x) => x[0]), topSeg = ranked(seg).slice(0, 2).map((x) => x[0]);
  const maxM = Math.max(1, ...Object.values(mom)), maxS = Math.max(1, ...Object.values(seg));
  const voted = answers.length > 0;
  const hot = (sg: string, m: string) => step >= 3 && !WHITESPACE.today(sg, m) && (voted ? topMom.includes(m) && topSeg.includes(sg) : !['Wake-up', 'Wind-down'].includes(m));
  const warm = (sg: string, m: string) => step >= 3 && !WHITESPACE.today(sg, m) && voted && (topMom.includes(m) || topSeg.includes(sg));
  const lead = voted && topSeg[0] && topMom[0] ? `${topSeg[0]} · ${topMom[0]}` : 'the day between the sinks';
  return (
    <div className="pad wsp">
      <Enter i={0}><div className="k">White space · moments of the day by the consumers you named · our read, to challenge</div></Enter>
      <div className="wsp-head">
        <div className={'wsp-h' + (step < 3 ? ' on' : '')}><h2 className="h2">Where does TheraBreath <span className="it">live today?</span></h2></div>
        <div className={'wsp-h' + (step >= 3 ? ' on' : '')}><h2 className="h2">The day happens <span className="it">between the sinks.</span></h2></div>
      </div>
      <div className="wsp-grid" style={{ ['--cols' as any]: WHITESPACE.moments.length }}>
        <div className="wsp-corner" />
        {WHITESPACE.moments.map((m) => (
          <div key={m} className={'wsp-col' + (step >= 2 && topMom.includes(m) ? ' top' : '')}>
            <i style={{ height: step >= 2 ? `${((mom[m] || 0) / maxM) * 44}px` : 0 }} />
            <span>{m}</span>{step >= 2 && mom[m] ? <b className="num">{mom[m]}</b> : null}
          </div>
        ))}
        {WHITESPACE.segments.map((sg, r) => (
          <React.Fragment key={sg}>
            <div className={'wsp-row' + (step >= 2 && topSeg.includes(sg) ? ' top' : '')}><span>{sg}</span>{step >= 2 && seg[sg] ? <b className="num">{seg[sg]}</b> : null}<i style={{ width: step >= 2 ? `${((seg[sg] || 0) / maxS) * 100}%` : 0 }} /></div>
            {WHITESPACE.moments.map((m, c) => {
              const today = WHITESPACE.today(sg, m);
              return <div key={m} className={'wsp-cell' + (step >= 1 && today ? ' today' : '') + (hot(sg, m) ? ' hot' : warm(sg, m) ? ' warm' : '')} style={{ ['--i' as any]: r * WHITESPACE.moments.length + c }} />;
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="wsp-side">
        <R b={1} step={step} className="wsp-note"><i className="today" /><span>Where TheraBreath is today: the sink, morning and night, and the dry mouth lozenge on the go.</span></R>
        <R b={2} step={step} className="wsp-note"><i className="vote" /><span>{voted ? `${answers.length} pre-work answers: the consumer you most want to win, and the moment you say is missing.` : 'The room\u2019s pre-work answers land here: the consumer to win, the moment that is missing.'}</span></R>
        <R b={3} step={step} className="wsp-note hot"><i className="hot" /><span>White space: <b>{lead}</b>. No TheraBreath flavor built for it yet.</span></R>
        <R b={3} step={step} className="wsp-obj"><span className="k">Your objective 04</span><p>{OBJECTIVES[3].ask}</p></R>
      </div>
      <div className="src stage-src" style={{ position: 'absolute', left: 120, bottom: 118 }}>{WHITESPACE.read} Pre-work answers from this room.</div>
    </div>
  );
}
