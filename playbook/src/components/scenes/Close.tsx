'use client';
import Light from '../Light';
import { R, Enter, SceneProps } from './ui';
import { EVENT, SIGNALS, TERRITORIES, CODE, NEXT_STEPS } from '@/lib/content';
import { SessionState, people, tallyPick, ranked } from '@/lib/state';
import { candidates } from './Build';

// What the room decided, in one place. Shared by the Stage close and the Playbook document.
export function decisions(s: SessionState) {
  const sig = ranked(tallyPick(s, 'signals')).slice(0, 3).map(([id]) => SIGNALS.find((x) => x.id === id)!).filter(Boolean);
  const ter = ranked(tallyPick(s, 'territories')).slice(0, 3).map(([id]) => TERRITORIES.find((x) => x.id === id)!).filter(Boolean);
  const items = candidates(s);
  const top = items.filter((x) => x.dots > 0).slice(0, 5);
  const placed = items.filter((x) => s.placements[x.id]);
  return { sig, ter, top, placed, names: people(s).filter((p) => !p.sim).map((p) => p.name) };
}

// 41. The Playbook you just built: five pages fly in and stack into a document.
export function Assemble({ s, step }: SceneProps) {
  const d = decisions(s);
  const pages = [
    { k: 'Chapter 1', t: 'Signals', l: d.sig.map((x) => x.title) },
    { k: 'Chapter 2', t: 'Territories', l: d.ter.map((x) => x.name) },
    { k: 'Chapter 3', t: 'Concepts', l: d.top.map((x) => x.name) },
    { k: 'Chapter 4', t: 'Pipeline', l: d.placed.slice(0, 4).map((x) => `${s.placements[x.id].horizon} · ${x.name}`) },
    { k: 'Chapter 5', t: 'Flavor Code', l: CODE.slice(0, 4).map((c) => c.t) },
  ];
  return (
    <div className="assemble">
      <Light scene="drop" theme="b" camera={{ pos: [0, 0.4, 9.5], target: [0, -0.4, 0], fov: 26, shift: [0, 0.1] }} frame={(t) => ({ rot: t * 0.08 })} fallback="/img/cover-drop.jpg" style={{ position: 'absolute', inset: 0, opacity: 0.55 }} />
      <div className={'stack' + (step >= 1 ? ' closed' : '')}>
        {pages.map((p, i) => (
          <div key={p.t} className="page" style={{ ['--i' as any]: i }}>
            <div className="k">{p.k}</div><b>{p.t}</b>
            <ul>{p.l.length ? p.l.map((x, j) => <li key={j}>{x}</li>) : <li className="ghost">Decided in the room</li>}</ul>
          </div>
        ))}
        <div className="page cover">
          <div className="k">TheraBreath × The Flavor Factory</div>
          <b className="cover-t">The Flavor Playbook</b>
          <span className="it">{EVENT.sub}</span>
          <div className="cover-names">Built by {d.names.length ? d.names.join(', ') : 'the room'}</div>
          <div className="k" style={{ marginTop: 'auto' }}>{EVENT.date} · v0.9</div>
        </div>
      </div>
      <div className="as-copy">
        <Enter i={0}><div className="k">Close</div></Enter>
        <Enter i={1}><h2 className="h1">The Playbook<br /><span className="it">you just built.</span></h2></Enter>
      </div>
    </div>
  );
}

// 42. What happens next
export function Next({ step }: SceneProps) {
  return (
    <div className="pad next">
      <Enter i={0}><div className="k">What happens next</div></Enter>
      <Enter i={1}><h2 className="h1">Thank you for building this <span className="it">with us.</span></h2></Enter>
      <div className="steps">
        {NEXT_STEPS.map((n, i) => <R key={n.t} b={i + 1} step={step} className="nstep"><span className="num">0{i + 1}</span><b className="h3">{n.t}</b><p>{n.d}</p><em className="src">[CONFIRM date]</em></R>)}
      </div>
    </div>
  );
}

// 43. Lunch: an ambient field in the colors of the territories the room chose.
export function Lunch({ s }: SceneProps) {
  const d = decisions(s);
  const cols = (d.ter.length ? d.ter : TERRITORIES.slice(0, 3)).flatMap((t) => t.palette.slice(0, 2));
  return (
    <div className="lunch">
      <div className="aurora">{cols.map((c, i) => <i key={i} style={{ ['--c' as any]: c, ['--i' as any]: i }} />)}</div>
      <div className="lunch-in">
        <div className="k">TheraBreath × The Flavor Factory</div>
        <h1 className="hero center">Lunch.</h1>
        <p className="sub it center">The Playbook v1.0 arrives within 8 business days.</p>
      </div>
    </div>
  );
}
