'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import Light, { project } from '../Light';
import { R, Enter, SceneProps, Src } from './ui';
import { EVENT, JULY, OBJECTIVES, SURVEY } from '@/lib/content';
import { people, ranked } from '@/lib/state';
import Orb from '../Orb';
import { LEAN, leans, listOf, roomProfile, prebrief, plainAudience } from '@/lib/prebrief';

export function useQR(text: string) {
  const [svg, setSvg] = useState('');
  useEffect(() => { if (text) QRCode.toString(text, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#0B1B2B', light: '#0000' } }).then(setSvg); }, [text]);
  return svg;
}

const DROP_CAM = { pos: [0, 0.55, 8.6], target: [0, -0.45, 0], fov: 26, shift: [0.30, 0.02] };

// Names rise through the drop as people join and burst into light at the tip; once settled they are listed under the count.
function Bubbles({ s, cam }: { s: any; cam: any }) {
  const list = people(s).filter((p) => !p.paper).slice(-9);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { let r = 0; const f = () => { setNow(Date.now()); r = requestAnimationFrame(f); }; r = requestAnimationFrame(f); return () => cancelAnimationFrame(r); }, []);
  const px = 1080 / 2 / Math.tan(13 * Math.PI / 180) / 8.6;
  return (
    <div className="layer">
      {list.map((p, i) => {
        const age = (now - p.joined) / 1000;
        const life = 9;
        const u = Math.min(1, Math.max(0, age / life));
        let hsh = 7; for (const ch of p.pid) hsh = (hsh * 31 + ch.charCodeAt(0)) % 1000003; const seedX = ((hsh % 1000) / 1000 - 0.5) * 1.6;
        const y = u >= 1 ? -0.55 + ((hsh >> 3) % 70) / 100 : -0.88 + 1.55 * (u * (0.6 + 0.4 * u));
        const settled = u >= 1;
        const narrow = Math.min(1, Math.max(0.12, (0.78 - y) / 1.1));
        const x = (settled ? seedX * 0.5 : seedX * 0.45) * narrow + Math.sin(age * 1.4 + i) * 0.03 * narrow;
        const [sx, sy] = project([x, y, 0.3 * narrow], cam);
        const r = (0.058 - i * 0.002) * px * (settled ? 0.7 : 1);
        const burst = !settled ? Math.max(0, 1 - Math.abs(u - 0.9) * 10) : 0;
        // People who join within a second or so of each other rise together: each later name drops a line, so the
        // names never print on top of each other.
        const k = list.slice(0, i).filter((q) => Math.abs(q.joined - p.joined) < 1500).length;
        return (
          <div key={p.pid}>
            <i className="bubble" style={{ left: sx, top: sy, width: r * 2, height: r * 2, opacity: settled ? 0.55 : 1 }} />
            {burst > 0 && <i className="spark" style={{ left: sx, top: sy, opacity: burst }} />}
            <span className="bname" style={{ left: sx + r + 12, top: sy + k * 34, opacity: settled ? 0 : Math.min(1, age * 2) }}>{p.name}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Arrival({ s, ctx }: SceneProps) {
  const qr = useQR(ctx.joinUrl);
  const joined = people(s).filter((p) => !p.paper);
  const n = joined.length;
  const hidden = new Set(s.hidden || []);
  const warm = joined.filter((p) => p.warm && !hidden.has('warm:' + p.pid)).slice(-6);
  return (
    <>
      <Light scene="drop" theme="b" camera={DROP_CAM} frame={(t) => ({ rot: 0.6 + t * 0.12 })} fallback="/img/cover-drop.jpg" />
      <Bubbles s={s} cam={DROP_CAM} />
      <div className="arrival-copy">
        <Enter i={0}><div className="k">Welcome. We start at 10:00.</div></Enter>
        <Enter i={1}><h1 className="hero">The Future<br /><span className="it">of Freshness</span></h1></Enter>
        <Enter i={2}><div className="sub">Grab a seat and scan the code. Your phone is your scorecard this morning.</div></Enter>
        <Enter i={3}><div className="meta">{EVENT.lockup}</div></Enter>
      </div>
      <Enter i={4} className="join">
        <div className="qr" dangerouslySetInnerHTML={{ __html: qr }} />
        <div><h3>Scan to join</h3><p>Point your phone’s camera at the code. All we need is your first name.</p><code>{ctx.code}</code></div>
      </Enter>
      {/* Nothing shows until the first phone joins, so a slow start never puts a big zero on the TV. */}
      {n > 0 && <div className="presence quiet"><div className="lbl"><b className="num">{n}</b> joined</div><div className="presence-names">{joined.slice(-16).map((p) => p.name).join(' · ')}</div>
        {/* The warm-up answers as people join, with their first names; anything the presenter hid stays off the TV. */}
        {warm.length > 0 && <ul className="presence-warm">{warm.map((p) => <li key={p.pid} style={{ ['--i' as any]: 0 }}><b>{p.name}</b> {p.warm}</li>)}</ul>}
      </div>}
    </>
  );
}

export function Title({ s }: SceneProps) {
  return (
    <>
      <Light scene="drop" theme="b" camera={{ pos: [0, 0.4, 9.5], target: [0, -0.4, 0], fov: 26, shift: [0, 0.18] }} frame={(t) => ({ rot: t * 0.1 })} fallback="/img/cover-drop.jpg" />
      <div className="title-lock">
        <Enter i={0}><div className="k">TheraBreath × The Flavor Factory</div></Enter>
        <Enter i={1}><h1 className="hero center">The Flavor Playbook</h1></Enter>
        <Enter i={2}><div className="sub it center">{EVENT.sub}</div></Enter>
        <Enter i={3}><div className="title-note">The Future of Freshness is the morning. The Flavor Playbook is what the morning writes.</div></Enter>
      </div>
      <div className="logos"><img src="/img/tff-logo-white.webp" alt="The Flavor Factory" /></div>
    </>
  );
}

export function July({ step }: SceneProps) {
  return (
    <div className="pad">
      <Enter i={0}><div className="k">From July to today</div></Enter>
      <Enter i={1}><h2 className="h1" style={{ maxWidth: 1500 }}>When your team came to Norco in July, we covered the first four.<br /><span className="it">Today is about growth.</span></h2></Enter>
      <div className="july">
        {JULY.map((w, i) => (
          <div key={w} className={'jf' + (i === 4 ? ' grow' : '') + (i === 4 && step >= 1 ? ' lit' : '')} style={{ ['--i' as any]: i }}>
            <span className="num">0{i + 1}</span><b>{w}</b>{i === 4 && <em>November</em>}{i < 4 && <em>July</em>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Brief({ step }: SceneProps) {
  return (
    <div className="pad">
      <Enter i={0}><div className="k">Your brief, our agenda</div></Enter>
      <Enter i={1}><h2 className="h2" style={{ maxWidth: 1500 }}>We’ve built the morning <span className="it">around your four objectives.</span></h2></Enter>
      <div className="brief-tiles">
        {OBJECTIVES.map((o, i) => (
          <R key={o.n} b={i + 1} step={step} className="bt">
            <div className="bt-n num">{o.n}</div>
            <p className="bt-ask">{o.ask}</p>
            <div className="bt-to"><span>{o.act}</span><b>{o.chapter}</b></div>
          </R>
        ))}
      </div>
      <R b={5} step={step} className="bt-goal"><span className="k">And one goal, in your words</span><p>New flavor experiences that <em>strengthen our appeal with existing loyal users</em> and <em>attract new consumers to the franchise.</em></p><Src k="ross" style={{ position: 'static' }} /></R>
    </div>
  );
}

export function Prework({ s, step }: SceneProps) {
  const answers = Object.values(s.survey);
  const count = (key: 'consumer' | 'moment') => { const t: Record<string, number> = {}; answers.forEach((a) => a[key] && (t[a[key]!] = (t[a[key]!] || 0) + 1)); return ranked(t); };
  const cons = count('consumer'), mom = count('moment');
  // Who people typed when they picked "Someone else".
  const others = [...new Set(answers.map((a) => a.other?.trim()).filter(Boolean) as string[])];
  // And the occasions people typed when they picked "Another occasion".
  const otherMoments = [...new Set(answers.map((a) => a.momentOther?.trim()).filter(Boolean) as string[])];
  // The same veto from several people shows once, with a count.
  const vetoCount: Record<string, [string, number]> = {};
  for (const v of answers.map((a) => a.veto).filter(Boolean) as string[]) { const key = v.trim().toLowerCase().replace(/[.!]+$/, ''); if (!key) continue; vetoCount[key] = [vetoCount[key]?.[0] || v.trim().replace(/[.!]+$/, ''), (vetoCount[key]?.[1] || 0) + 1]; }
  const vetoes = Object.values(vetoCount).sort((a, b) => b[1] - a[1]);
  const max = (l: [string, number][]) => Math.max(1, ...l.map((x) => x[1]));
  const profiled = answers.filter((a) => a.profile).length;
  // The headline and the first question come from the answers when they say something clear (no tie), else the slide
  // keeps its own wording.
  const pb = prebrief(s), aud = pb.topAudience, ln = pb.lean;
  // Build 3: the off-brand answer the presenter featured, at full size (the build skips itself with nothing featured).
  const quote = pb.featuredQuote, featuring = step >= 3 && !!quote;
  const Bars = ({ list }: { list: [string, number][] }) => (
    <div className="pw-bars">{list.slice(0, 5).map(([k, v]) => <div key={k} className={v === max(list) ? 'top' : ''}><span>{k}</span><i style={{ width: `${(v / max(list)) * 100}%` }} /><b className="num">{v}</b></div>)}{!list.length && <div className="empty">No answers yet.</div>}</div>
  );
  return (
    <div className={'pad' + (featuring ? ' pw-featuring' : '')}>
      {/* The question sits beside the count from the first build: it's for the whole slide, and the list of off-brand
          answers below can run long. */}
      <Enter i={0} className={'pw-top' + (aud ? ' has-h' : '')}>
        <div className="pw-hd"><div className="k">You told us · {answers.length} {answers.length === 1 ? 'answer' : 'answers'}</div>{aud && <h2 className="h2 pw-h">{aud.count} of {aud.total} of you want to win <span className="it">{plainAudience(aud.label)}.</span></h2>}</div>
        <div className="room-ask pw-ask"><span className="k">For the room</span><div className="pw-qs">{ln && <p>You lean {ln.text}. Is your consumer the same, or are you the exception?</p>}<p>Anything here you’d argue with?</p></div></div>
      </Enter>
      <div className="pw-grid">
        <R b={0} step={step} className="pw-card"><h3 className="h3">Who you’d focus on first</h3><Bars list={cons} />{others.length > 0 && <p className="src pw-others">Someone else: {others.slice(0, 6).join(', ')}</p>}</R>
        <R b={1} step={step} className="pw-card"><h3 className="h3">The occasion you’d explore first</h3><Bars list={mom} />{otherMoments.length > 0 && <p className="src pw-others">{SURVEY.moment.other}: {otherMoments.slice(0, 6).join(', ')}</p>}</R>
      </div>
      {answers.some((x) => x.profile) && <R b={1} step={step} className="pw-orb"><Orb profile={roomProfile(answers)} size={300} /><div><span className="k">Your own taste in freshness</span><p className="h3 it">{leanLine(roomProfile(answers))}</p><p className="pw-avg">{leanNote(roomProfile(answers), profiled)}</p></div></R>}
      <R b={2} step={step} className="vetoes">
        <div className="k">What would feel wrong for TheraBreath</div>
        {/* One answer per line, each in its own quotes, in the words people typed; a repeat shows once with how many said it. */}
        {vetoes.length ? <ul className="pw-off">{vetoes.slice(0, 6).map(([v, n], i) => <li key={i} style={{ ['--i' as any]: i }}>&ldquo;{v}&rdquo;{n > 1 && <span className="pw-n">{n} people</span>}</li>)}</ul> : <p className="empty pw-none">No answers yet.</p>}
        {vetoes.length > 6 && <p className="pw-more">And {vetoes.length - 6} more.</p>}
      </R>
      {featuring && <div className="pw-feature"><span className="k">One of you wrote</span><p className="pw-quote">&ldquo;{quote}&rdquo;</p><span className="pw-back it">We’ll come back to this.</span></div>}
    </div>
  );
}

// The freshness sliders, read back in the slider's own words: what the answers lean toward on each, and how many sit in
// the middle (the rules are in prebrief.ts, which the other slides read too).
function leanLine(p: Record<string, number>) {
  const l = leans(p);
  return l.length ? `Your answers lean toward ${listOf(l)}.` : 'Your answers sit in the middle on every slider.';
}
function leanNote(p: Record<string, number>, n: number) {
  const mid = Object.keys(LEAN).length - leans(p).length, words = ['', 'one', 'two', 'three', 'four'];
  const avg = `The average of ${n} ${n === 1 ? 'answer' : 'answers'}`;
  return mid > 0 && mid < Object.keys(LEAN).length ? `${avg}; the other ${words[mid]} ${mid === 1 ? 'sits' : 'sit'} in the middle.` : `${avg}.`;
}


export function Thesis({ step }: SceneProps) {
  return (
    <div className="thesis">
      <div className={'tl1' + (step >= 0 ? ' on' : '')}>TheraBreath took the burn out of mouthwash.</div>
      <div className={'tl2 it' + (step >= 1 ? ' on' : '')}>The next job is giving more people a reason to want it.</div>
    </div>
  );
}
