'use client';
import { useContext } from 'react';
import Light from '../Light';
import { R, Enter, SceneProps } from './ui';
import { EVENT, SIGNALS, PRIMARY_TERRITORIES as TERRITORIES, CODE, NEXT_STEPS } from '@/lib/content';
import { SessionState, people, tallyPick, ranked } from '@/lib/state';
import { candidates } from './Build';
import { planRows, dueLabel } from '../show/Plan';
import { LiveCtx } from '../show/ShowScenes';

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
            <ul>{p.l.length ? p.l.map((x, j) => <li key={j}>{x}</li>) : <li className="ghost">To be decided</li>}</ul>
          </div>
        ))}
        <div className="page cover">
          <div className="k">TheraBreath × The Flavor Factory</div>
          <b className="cover-t">The Flavor Playbook</b>
          <span className="it">{EVENT.sub}</span>
          <div className="cover-names">Built by {d.names.length ? d.names.join(', ') : 'everyone who was there'}</div>
          <div className="k" style={{ marginTop: 'auto' }}>v0.1 · co-authored {EVENT.date.replace('Monday, ', '')} · {EVENT.city}</div>
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
export function Next({ s, step }: SceneProps) {
  // The first step names the directions from Now, Next, Later and who has them.
  const agreed = planRows(s).filter((r) => r.what).slice(0, 3);
  return (
    <div className="pad next">
      <Enter i={0}><div className="k">What happens next</div></Enter>
      <Enter i={1}><h2 className="h1">Thank you. <span className="it">Here’s what happens next.</span></h2></Enter>
      <div className="steps">
        {NEXT_STEPS.map((n, i) => (
          <R key={n.t} b={i + 1} step={step} className="nstep"><span className="num">0{i + 1}</span><b className="h3">{n.t}</b>
            {i === 0 && agreed.length ? <ul className="agreed">{agreed.map((r) => <li key={r.id}><b>{r.what}</b><span>{[r.owner && `TFF: ${r.owner}`, r.reviewer && `C&D: ${r.reviewer}`].filter(Boolean).join(' · ') || 'Owners to agree'}</span><em>{[r.label, r.base, r.due ? `next sample ${dueLabel(r.due)}` : ''].filter(Boolean).join(' · ')}</em></li>)}</ul> : <p>{n.d}</p>}
          </R>
        ))}
      </div>
    </div>
  );
}

// 43. Thank you: an ambient field in the colors of the territories the room chose.
// The room's one-word tasting answers, each once, without the ones the presenter hid from the TV.
export function roomWords(s: any) {
  const hidden = new Set<string>(s.hidden || []); const seen = new Set<string>(); const out: string[] = [];
  for (const r of Object.values(s.ratings || {}) as any[]) for (const x of Object.values(r) as any[]) {
    const w = String(x?.word || '').trim(); const k = w.toLowerCase();
    if (w && !seen.has(k) && !hidden.has('word:' + k)) { seen.add(k); out.push(w); }
  }
  return out;
}
export function Lunch({ s, step }: SceneProps) {
  // The last slide is a thank-you card (it said Lunch until November 2). Since November 6 it sits over a soft field of the
  // room's one-word tasting answers (three or more), and build 1 is the Mystery Flavor reveal: one line from sealed.ts,
  // on the TV only, and the build skips itself while the line is empty.
  const d = decisions(s);
  const cols = (d.ter.length ? d.ter : TERRITORIES.slice(0, 3)).flatMap((t) => t.palette.slice(0, 2));
  const live = useContext(LiveCtx);
  const reveal = live?.still ? '' : live?.reveal || '';
  const words = roomWords(s);
  const showReveal = step >= 1 && !!reveal;
  return (
    <div className={'lunch' + (showReveal ? ' lunch-reveal' : '')}>
      <div className="aurora">{cols.map((c, i) => <i key={i} style={{ ['--c' as any]: c, ['--i' as any]: i }} />)}</div>
      {words.length >= 3 && <div className="lunch-words" aria-hidden="true">{words.slice(0, 28).map((w, i) => <span key={w} style={{ ['--i' as any]: i, left: `${8 + ((i * 37) % 84)}%`, top: `${10 + ((i * 53) % 78)}%`, fontSize: 26 + ((i * 7) % 4) * 8 }}>{w}</span>)}</div>}
      <div className="lunch-in">
        <div className="k">TheraBreath × The Flavor Factory</div>
        <h1 className="hero center">Thank you.</h1>
        <p className="sub it center">For spending the morning with us.</p>
        {showReveal && <p className="lunch-mystery center"><span className="k">One last thing.</span><span className="it">The Mystery Flavor was {reveal}.</span></p>}
      </div>
    </div>
  );
}
