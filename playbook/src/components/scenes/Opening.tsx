'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import Light, { project } from '../Light';
import { R, Enter, SceneProps, Src } from './ui';
import { EVENT, JULY, OBJECTIVES, SURVEY } from '@/lib/content';
import { people, ranked } from '@/lib/state';
import Orb, { describe } from '../Orb';

export function useQR(text: string) {
  const [svg, setSvg] = useState('');
  useEffect(() => { if (text) QRCode.toString(text, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#0B1B2B', light: '#0000' } }).then(setSvg); }, [text]);
  return svg;
}

const DROP_CAM = { pos: [0, 0.55, 8.6], target: [0, -0.45, 0], fov: 26, shift: [0.30, 0.02] };

// Names rise through the drop as people join, then burst into light at the tip.
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
        return (
          <div key={p.pid}>
            <i className="bubble" style={{ left: sx, top: sy, width: r * 2, height: r * 2, opacity: settled ? 0.55 : 1 }} />
            {burst > 0 && <i className="spark" style={{ left: sx, top: sy, opacity: burst }} />}
            <span className="bname" style={{ left: sx + r + 12, top: sy, opacity: settled ? 0.55 : Math.min(1, age * 2) }}>{p.name}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Arrival({ s, ctx }: SceneProps) {
  const qr = useQR(ctx.joinUrl);
  const n = people(s).length;
  return (
    <>
      <Light scene="drop" theme="b" camera={DROP_CAM} frame={(t) => ({ rot: 0.6 + t * 0.12 })} fallback="/img/cover-drop.jpg" />
      <Bubbles s={s} cam={DROP_CAM} />
      <div className="arrival-copy">
        <Enter i={0}><div className="k">Welcome. We start at 10:00.</div></Enter>
        <Enter i={1}><h1 className="hero">The Flavor<br />Playbook</h1></Enter>
        <Enter i={2}><div className="sub it">{EVENT.sub}</div></Enter>
        <Enter i={3}><div className="meta">{EVENT.lockup}</div></Enter>
      </div>
      <Enter i={4} className="join">
        <div className="qr" dangerouslySetInnerHTML={{ __html: qr }} />
        <div><h3>Join the session</h3><p>Point your camera here. First name only.</p><code>{ctx.code}</code></div>
      </Enter>
      <div className="presence"><div className="count num">{n}</div><div className="lbl">In the room</div></div>
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
      </div>
      <div className="logos"><img src="/img/tff-logo-white.webp" alt="The Flavor Factory" /></div>
    </>
  );
}

export function July({ step }: SceneProps) {
  return (
    <div className="pad">
      <Enter i={0}><div className="k">From July to today</div></Enter>
      <Enter i={1}><h2 className="h1" style={{ maxWidth: 1400 }}>In July, you came to Norco.<br /><span className="it">Today, we build together.</span></h2></Enter>
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
      <Enter i={1}><h2 className="h2" style={{ maxWidth: 1500 }}>You asked for four things. <span className="it">Here is how we will deliver them by noon.</span></h2></Enter>
      <div className="brief-tiles">
        {OBJECTIVES.map((o, i) => (
          <R key={o.n} b={i + 1} step={step} className="bt">
            <div className="bt-n num">{o.n}</div>
            <p className="bt-ask">{o.ask}</p>
            <div className="bt-to"><span>{o.act}</span><b>Chapter: {o.chapter}</b></div>
          </R>
        ))}
      </div>
    </div>
  );
}

export function Prework({ s, step }: SceneProps) {
  const answers = Object.values(s.survey);
  const count = (key: 'consumer' | 'moment') => { const t: Record<string, number> = {}; answers.forEach((a) => a[key] && (t[a[key]!] = (t[a[key]!] || 0) + 1)); return ranked(t); };
  const cons = count('consumer'), mom = count('moment');
  const vetoes = answers.map((a) => a.veto).filter(Boolean) as string[];
  const max = (l: [string, number][]) => Math.max(1, ...l.map((x) => x[1]));
  const Bars = ({ list }: { list: [string, number][] }) => (
    <div className="pw-bars">{list.slice(0, 5).map(([k, v], i) => <div key={k} className={i === 0 ? 'top' : ''}><span>{k}</span><i style={{ width: `${(v / max(list)) * 100}%` }} /><b className="num">{v}</b></div>)}{!list.length && <div className="empty">Answers arrive from the pre-work survey.</div>}</div>
  );
  return (
    <div className="pad">
      <Enter i={0}><div className="k">The room already spoke · {answers.length} pre-work answers</div></Enter>
      <div className="pw-grid">
        <R b={0} step={step} className="pw-card"><h3 className="h3">{SURVEY.consumer.q}</h3><Bars list={cons} /></R>
        <R b={1} step={step} className="pw-card"><h3 className="h3">{SURVEY.moment.q}</h3><Bars list={mom} /></R>
      </div>
      {answers.some((x) => x.profile) && <R b={1} step={step} className="pw-orb"><Orb profile={roomProfile(answers)} size={300} /><div><span className="k">The room&rsquo;s freshness</span><p className="h3 it">{describe(roomProfile(answers), 'The room wants freshness that is')}</p></div></R>}
      <R b={2} step={step} className="vetoes">
        <div className="k">Flavors you would never approve</div>
        <div className="cloud">{vetoes.length ? vetoes.slice(0, 14).map((v, i) => <span key={i} style={{ ['--i' as any]: i, fontSize: 30 + ((i * 17) % 5) * 6 }}>{v}</span>) : <span className="empty">Vetoes arrive from the pre-work survey.</span>}</div>
      </R>
    </div>
  );
}

function roomProfile(answers: any[]) {
  const ps = answers.map((a) => a.profile).filter(Boolean); const out: Record<string, number> = {};
  for (const k of ['adv', 'cool', 'bot', 'exp', 'occ']) out[k] = ps.length ? Math.round(ps.reduce((s, p) => s + (p[k] || 3), 0) / ps.length) : 3;
  return out;
}

export function Thesis({ step }: SceneProps) {
  return (
    <div className="thesis">
      <div className={'tl1' + (step >= 0 ? ' on' : '')}>TheraBreath took away the burn.</div>
      <div className={'tl2 it' + (step >= 1 ? ' on' : '')}>Now let&rsquo;s add the want.</div>
    </div>
  );
}
