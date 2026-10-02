'use client';
import { useEffect, useState } from 'react';
import { R, Enter, SceneProps } from './ui';
import { MISSIONS, SEEDS, TERRITORIES } from '@/lib/content';
import { people, tallyPick, ranked, SessionState, Concept } from '@/lib/state';

const terr = (id: string) => TERRITORIES.find((t) => t.id === id)!;
export const teamConcepts = (s: SessionState) => [1, 2, 3].map((team) => s.concepts[`t${team}-1`]).filter(Boolean) as Concept[];

// 33. Mission briefing: three mixed teams.
export function Missions({ s }: SceneProps) {
  const ps = people(s);
  return (
    <div className="pad missions">
      <Enter i={0}><div className="k">Co-create · mission briefing</div></Enter>
      <Enter i={1}><h2 className="h1">Three teams. <span className="it">Three missions.</span></h2></Enter>
      <div className="mcards">
        {[1, 2, 3].map((team, i) => {
          const m = MISSIONS.find((x) => x.id === s.missions[team - 1]) || MISSIONS[i];
          const crew = ps.filter((p) => p.team === team);
          return (
            <Enter key={team} i={2 + i} className="mcard">
              <div className="mc-n num">{team}</div>
              <div className="k">Team {team}</div>
              <h3 className="h3">{m.title}</h3>
              <div className="crew">{crew.map((p) => <span key={p.pid}>{p.name}</span>)}{!crew.length && <em>Pick a team on your phone</em>}</div>
            </Enter>
          );
        })}
      </div>
    </div>
  );
}

// 34. Seed cards: fourteen provocations fanned across the wall.
export function Seeds({}: SceneProps) {
  return (
    <div className="pad seeds">
      <Enter i={0}><div className="k">Co-create · fourteen seed cards</div></Enter>
      <Enter i={1}><h2 className="h2">Provocations, not answers. <span className="it">Use, remix or ignore.</span></h2></Enter>
      <div className="seedwall">
        {SEEDS.map((sd, i) => { const t = terr(sd.territory); return (
          <div key={sd.id} className="seed" style={{ ['--i' as any]: i, ['--c1' as any]: t.palette[0], ['--c2' as any]: t.palette[1], ['--r' as any]: `${((i * 37) % 7) - 3}deg` }}>
            <div className="seed-top"><span className="num">{String(sd.n).padStart(2, '0')}</span><em>{sd.horizon}</em></div>
            <b>{sd.name}</b>
            <p>{sd.idea}</p>
            <span className="seed-t">{t.name}</span>
          </div>
        ); })}
      </div>
    </div>
  );
}

// 35. The Concept Canvas: three live team canvases and a draining glass timer.
function GlassTimer({ s }: { s: SessionState }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { let r = 0; const f = () => { setNow(Date.now()); r = requestAnimationFrame(f); }; r = requestAnimationFrame(f); return () => cancelAnimationFrame(r); }, []);
  const t = s.timer; const rem = t.total ? (t.running ? Math.max(0, (t.endsAt - now) / 1000) : t.remaining) : 15 * 60; const total = t.total || 15 * 60;
  const lvl = rem / total; const m = Math.floor(rem / 60), sec = Math.floor(rem % 60);
  return (
    <div className={'gtimer' + (rem < 60 && t.total ? ' last' : '')}>
      <div className="gt-glass"><div className="gt-liquid" style={{ height: `${lvl * 100}%` }}><i /></div></div>
      <div className="gt-num num">{m}:{String(sec).padStart(2, '0')}</div>
      <div className="k">{t.running ? 'Building' : t.total ? 'Paused' : 'Ready'}</div>
    </div>
  );
}

export function Canvas({ s }: SceneProps) {
  const fields: [keyof Concept, string][] = [['segment', 'For'], ['occasion', 'When'], ['first', 'First'], ['heart', 'Heart'], ['finish', 'Finish'], ['format', 'Format'], ['incremental', 'Why it is incremental']];
  return (
    <div className="pad canvas">
      <Enter i={0}><div className="k">Co-create · the Concept Canvas · 15 minutes</div></Enter>
      <div className="canvas-grid">
        {[1, 2, 3].map((team) => {
          const c = s.concepts[`t${team}-1`]; const m = MISSIONS.find((x) => x.id === s.missions[team - 1]);
          const filled = c ? fields.filter(([k]) => (c as any)[k]).length + (c.name ? 1 : 0) : 0;
          return (
            <div key={team} className="cv-card">
              <div className="cv-top"><span className="k">Team {team}</span><span className="cv-pct" style={{ ['--p' as any]: `${(filled / (fields.length + 1)) * 100}%` }} /></div>
              <div className="cv-mission">{m?.title}</div>
              <h3 className="h3">{c?.name || <span className="ghost">Name the concept</span>}</h3>
              <dl>{fields.map(([k, l]) => <div key={k} className={(c as any)?.[k] ? 'on' : ''}><dt>{l}</dt><dd>{(c as any)?.[k] || ''}</dd></div>)}</dl>
              {!!c?.suggestions?.length && <div className="cv-sugg">{c.suggestions.slice(-2).map((x, i) => <span key={i}>{x.text}</span>)}</div>}
            </div>
          );
        })}
        <GlassTimer s={s} />
      </div>
    </div>
  );
}

// 36. Pitches: each concept becomes a poster in its territory colors.
export function Poster({ c, big, dots }: { c: Concept; big?: boolean; dots?: number }) {
  const t = TERRITORIES.find((x) => (c.why || '').toLowerCase().includes(x.name.toLowerCase())) || TERRITORIES[(c.team + 1) % 7];
  return (
    <div className={'poster' + (big ? ' big' : '')} style={{ ['--c1' as any]: t.palette[0], ['--c2' as any]: t.palette[1], ['--c3' as any]: t.palette[2] }}>
      <div className="po-light" />
      <div className="po-in">
        <div className="k">Team {c.team}{c.horizon ? ` · ${c.horizon}` : ''}</div>
        <div className="po-name">{c.name || 'Untitled concept'}</div>
        <div className="po-for">{[c.segment, c.occasion].filter(Boolean).join(' · ')}</div>
        <div className="po-notes">{(['first', 'heart', 'finish'] as const).map((k) => c[k] && <div key={k}><span>{k}</span>{c[k]}</div>)}</div>
        {c.format && <div className="po-format">{c.format}</div>}
      </div>
      {dots !== undefined && <div className="po-dots">{Array.from({ length: dots }, (_, i) => <i key={i} style={{ ['--i' as any]: i }} />)}<b className="num">{dots}</b></div>}
    </div>
  );
}

export function Pitches({ s, step }: SceneProps) {
  const cs = teamConcepts(s);
  const c = cs[Math.min(step, cs.length - 1)];
  return (
    <div className="pad pitches">
      <Enter i={0}><div className="k">Pitches · {cs.length ? `${Math.min(step, cs.length - 1) + 1} of ${cs.length}` : 'waiting for canvases'}</div></Enter>
      {c ? <div className="pitch-stage" key={c.id}><Poster c={c} big /><div className="pitch-side">{c.incremental && <><span className="k">Why it is incremental</span><p className="h3 it">{c.incremental}</p></>}{!!c.sensation?.length && <div className="chips-row">{c.sensation.map((x) => <span key={x}>{x}</span>)}</div>}</div></div>
        : <h2 className="h1" style={{ marginTop: 120 }}>The posters build themselves <span className="it">from the team canvases.</span></h2>}
    </div>
  );
}

// 37. Dot vote: three dots each across concepts and seeds. Dots rain onto the posters.
export function Dots({ s, step }: SceneProps) {
  const t = tallyPick(s, 'concepts');
  const v = s.votes.concepts;
  const voters = Object.keys(v?.picks || {}).length;
  const cs = teamConcepts(s);
  const topSeeds = ranked(Object.fromEntries(SEEDS.map((x) => [x.id, t[x.id] || 0]))).slice(0, 6);
  const revealed = v?.revealed || step >= 1;
  const top = ranked(t).slice(0, 3).map((x) => x[0]);
  return (
    <div className="pad dots">
      <Enter i={0}><div className="k">Dot vote · {voters} {voters === 1 ? 'voter' : 'voters'} {v?.open ? '· open' : v?.locked ? '· locked' : ''}</div></Enter>
      <Enter i={1}><h2 className="h2">Three dots each. <span className="it">What goes into the Playbook?</span></h2></Enter>
      <div className="dot-grid">
        {cs.map((c) => <div key={c.id} className={revealed && top.includes(c.id) ? 'won' : ''}><Poster c={c} dots={t[c.id] || 0} /></div>)}
        <div className="dot-seeds">
          {topSeeds.map(([id, n]) => { const sd = SEEDS.find((x) => x.id === id)!; return <div key={id} className={'ds' + (revealed && top.includes(id) ? ' won' : '')}><span>{sd.name}</span><i style={{ width: `${Math.min(100, n * 12)}%` }} /><b className="num">{n}</b></div>; })}
        </div>
      </div>
      {revealed && <div className="lock-note"><span className="k">Top concepts locked into Chapter 3</span></div>}
    </div>
  );
}
