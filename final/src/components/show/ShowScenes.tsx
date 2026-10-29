'use client';
// The scenes only the presentation has. Everything the room decides lives in the shared session: phones vote and score,
// and the presentation types the concept cards, the white-space marks and Now, Next and Later into the same log, so the
// Playbook at the end, the results page and every phone see the same thing. Votes take a hand count too: clicking a bar,
// an orb or a row adds one vote for someone without a phone.
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Light from '../Light';
import { R, Enter, Src, SceneProps } from '../scenes/ui';
import { teamConcepts } from '../scenes/CoCreate';
import { candidates } from '../scenes/Build';
import { useQR } from '../scenes/Opening';
import {
  EVENT, OBJECTIVES, TOPICS, RUN, TEAM, ABOUT, SCIENCE, IMAGINATION, ROSS_WORDS, SIGNALS, SAMPLES, PRIMARY_TERRITORIES as PLATFORMS,
  SURVEY, ROLES, FORMATS, ROSS_GOAL, HORIZONS, WHITESPACE, DIRECTIONS, MYSTERY,
} from '@/lib/content';
import { tallyPick, ranked, tasteSummary, uid, SessionState } from '@/lib/state';

export type Live = { send: (kind: string, data?: any, pid?: string) => any; still: boolean; joinUrl: string };
export const LiveCtx = createContext<Live | null>(null);
const useLive = () => useContext(LiveCtx)!;
// One vote for someone without a phone, counted like any other.
const hand = (live: Live, key: string, value: any) => live.send('pick', { key, value, paper: true }, 'hand-' + uid());

// The four objectives: one hue and one photograph each.
export const OBJ_HUE = [200, 32, 335, 262];
const OBJ_IMG = ['/img/open-1-ice.webp', '/img/open-2-citrus.webp', '/img/open-3-bloom.webp', '/img/open-4-violet.webp'];
export const when = (n: string) => { const bs = RUN.filter((b) => b.obj === n); return bs.length ? `${bs[0].t} to ${bs[bs.length - 1].end}` : ''; };
// A sample's name lives in the session once it's known (see sealedClient.ts); until then a direction is its letter.
export const directionName = (id: string, s?: SessionState | null) => s?.revealed?.samples[id]?.name || DIRECTIONS.find((d) => d.id === id)?.label || id;
const dirColors = (id: string) => DIRECTIONS.find((x) => x.id === id)?.colors || ['#BFE9F2', '#6CC7DD'];

export function ShowTitle() {
  return (
    <>
      <Light scene="drop" theme="b" camera={{ pos: [0, 0.4, 9.5], target: [0, -0.4, 0], fov: 26, shift: [0, 0.18] }} frame={(t) => ({ rot: t * 0.1 })} fallback="/img/cover-drop.jpg" />
      <div className="title-lock">
        <Enter i={0}><div className="k">TheraBreath × The Flavor Factory</div></Enter>
        <Enter i={1}><h1 className="hero center show-title">The Future <span className="it">of Freshness</span></h1></Enter>
        <Enter i={2}><div className="sub center">{EVENT.sub}</div></Enter>
        <Enter i={3}><div className="meta center">{EVENT.date} · {EVENT.room} room · {EVENT.city}</div></Enter>
      </div>
      <div className="logos"><img src="/img/tff-logo-white.webp" alt="The Flavor Factory" /></div>
    </>
  );
}

export function Team() {
  return (
    <div className="st">
      <img className="st-img" src="/img/lab-bench.webp" alt="" />
      <div className="pad">
        <Enter i={0}><div className="k">The Flavor Factory · Norco, California</div></Enter>
        <Enter i={1}><h2 className="h1">Who we are</h2></Enter>
        <Enter i={2}><p className="lede st-lede">{ABOUT}</p></Enter>
        <div className="st-two">
          <Enter i={3} className="st-panel sci"><span className="k">What we test in the lab</span><div className="st-chips">{SCIENCE.map((x) => <span key={x}>{x}</span>)}</div></Enter>
          <Enter i={4} className="st-panel ima"><span className="k">What we bring in from outside oral care</span><div className="st-chips">{IMAGINATION.map((x) => <span key={x}>{x}</span>)}</div></Enter>
        </div>
        <div className="st-people">
          {TEAM.map((t, i) => <Enter key={t.name} i={5 + i} className="st-person"><b>{t.name}</b><span className="k">{t.title}</span></Enter>)}
        </div>
        <Enter i={9} className="st-ask"><p>You asked to see our {ROSS_WORDS.capabilities}. <span className="it">That’s what we’re here to show you.</span></p></Enter>
      </div>
    </div>
  );
}

// Ross's four objectives, word for word, each with the time of the morning that covers it.
export function ShowBrief({ step }: SceneProps) {
  return (
    <div className="pad">
      <Enter i={0}><div className="k">From Ross&rsquo;s invitation</div></Enter>
      <Enter i={1}><h2 className="h2" style={{ maxWidth: 1500 }}>You asked for four things. <span className="it">Here’s when we’ll get to each one.</span></h2></Enter>
      <div className="brief-tiles">
        {OBJECTIVES.map((o, i) => (
          <R key={o.n} b={i + 1} step={step} className="bt" style={{ ['--h' as any]: OBJ_HUE[i] }}>
            <div className="bt-n num">{o.n}</div>
            <p className="bt-ask">{o.ask}</p>
            <div className="bt-to"><span>{when(o.n)}</span><b>{TOPICS[i].title}</b></div>
          </R>
        ))}
      </div>
      <R b={5} step={step} className="bt-goal"><span className="k">And the goal behind them</span><p>&ldquo;&hellip;new flavor experiences that both <em>{ROSS_GOAL.loyal}</em> and <em>{ROSS_GOAL.fresh.replace(/\.$/, '')}</em>.&rdquo;</p><Src k="ross" style={{ position: 'static' }} /></R>
    </div>
  );
}

// Each objective opens on one screen: a photograph in its color, its number, its question and Ross's words.
export function Opener({ idx }: SceneProps) {
  const o = OBJECTIVES[idx - 1], t = TOPICS[idx - 1];
  return (
    <div className="opener" style={{ ['--h' as any]: OBJ_HUE[idx - 1] }}>
      <img className="op-img" src={OBJ_IMG[idx - 1]} alt="" />
      <div className="op-shade" />
      <div className="op-num num">{o.n}</div>
      <div className="op-copy">
        <Enter i={0}><div className="k">Part {idx} of 4 · {when(o.n)}</div></Enter>
        <Enter i={1}><h1 className="hero op-title">{t.title}</h1></Enter>
        <Enter i={2} className="op-ross"><span className="k">From Ross&rsquo;s invitation</span><p>&ldquo;{o.ask}&rdquo;</p></Enter>
      </div>
    </div>
  );
}

// The phone vote: pick three of the seven trends. Bars fill as votes land; build 1 lights the top three; build 2 asks
// what we missed.
export function SignalVoteShow({ s, step }: SceneProps) {
  const live = useLive();
  const t = tallyPick(s, 'signals');
  const voters = Object.keys(s.votes.signals?.picks || {}).length;
  const max = Math.max(1, ...Object.values(t));
  const top3 = ranked(t).filter(([, n]) => n > 0).slice(0, 3).map((x) => x[0]);
  const revealed = step >= 1;
  return (
    <div className="vt" style={{ ['--h' as any]: OBJ_HUE[0] }}>
      <div className="vt-glow" />
      <div className="pad">
        <Enter i={0}><div className="k">Vote on your phone · {voters} {voters === 1 ? 'vote' : 'votes'} so far</div></Enter>
        <Enter i={1}><h2 className="h1 vt-q">Which three matter most <span className="it">for TheraBreath?</span></h2></Enter>
        <div className="glassbars">
          {SIGNALS.map((sig) => {
            const n = t[sig.id] || 0; const top = revealed && top3.includes(sig.id);
            return (
              <button key={sig.id} className={'gb' + (top ? ' top' : '') + (revealed && !top ? ' dim' : '')} style={{ ['--h' as any]: sig.hue }} data-nonav onClick={() => !live.still && hand(live, 'signals', [sig.id])}>
                <div className="gb-glass"><div className="gb-liquid" style={{ height: `${Math.max(3, (n / max) * 100)}%` }}><i /></div><b className="num">{n}</b></div>
                <div className="gb-lab"><span className="num">0{sig.n}</span>{sig.title.replace(/\.$/, '')}</div>
              </button>
            );
          })}
        </div>
        <R b={2} step={step} className="vt-next"><span className="k">And</span><p className="h2 it">{TOPICS[0].questions[1]}</p></R>
      </div>
    </div>
  );
}

// The blind tasting, scored on phones (or the paper card). The heat map fills as scores land; build 1 shows their words
// and the Mystery Flavor guesses; build 2 flips in the names.
export function TastingLive({ s, step }: SceneProps) {
  const rows = SAMPLES.map((x) => ({ ...x, sum: tasteSummary(s, x.code) }));
  const tasters = Math.max(0, ...rows.map((r) => r.sum.n));
  const metrics: ['appeal' | 'feels' | 'newness', string][] = [['appeal', 'Appeal'], ['feels', 'Feels like TheraBreath'], ['newness', 'Newness']];
  const cell = (v: number) => { const a = Math.max(0, Math.min(1, (v - 1) / 4)); return { background: `color-mix(in oklab, var(--accent) ${Math.round(a * 85)}%, transparent)`, opacity: v ? 1 : 0.4 }; };
  const guesses = Object.values(s.ratings[MYSTERY] || {}).map((r) => r.fruitGuess).filter(Boolean) as string[];
  const words = rows.flatMap((r) => r.sum.words.map((w) => ({ w, code: r.code })));
  return (
    <div className="tl">
      <img className="tl-img" src="/img/tasting-cups.webp" alt="" />
      <div className="tl-shade" />
      <div className="pad">
        <Enter i={0}><div className="k">The blind tasting · made in the bases you sent · {tasters} {tasters === 1 ? 'person has' : 'people have'} scored</div></Enter>
        <Enter i={1}><h2 className="h1">Four samples, <span className="it">tasted blind.</span></h2></Enter>
        <Enter i={2}><p className="lede tl-lede">Score each one on your phone or on the paper card. Once everyone’s done, we’ll tell you what they are.</p></Enter>
        <div className="heat">
          <div className="hrow head"><span />{metrics.map(([, l]) => <span key={l}>{l}</span>)}<span>Who it’s for</span></div>
          {rows.map((r) => (
            <div key={r.code} className="hrow">
              <div className={'hname' + (step >= 2 ? ' flip' : '')}><b className="num">{r.code}</b><span>{step >= 2 ? s.revealed?.samples[r.code]?.name || r.base : r.base}{step >= 2 && <small>{s.revealed?.samples[r.code]?.note}</small>}</span></div>
              {metrics.map(([m]) => <div key={m} className="hcell" style={cell(r.sum[m])}><b className="num">{r.sum[m] ? r.sum[m].toFixed(1) : ''}</b></div>)}
              <div className="hwho">{ranked(r.sum.who).slice(0, 3).map(([w, n]) => <span key={w}>{w} <b>{n}</b></span>)}</div>
            </div>
          ))}
        </div>
        <R b={1} step={step} className="words">
          {guesses.length > 0 && <span className="tl-guess">Fruit guesses for {MYSTERY}: {guesses.slice(-8).join(' · ')}</span>}
          {words.slice(-16).map((x, i) => <span key={i} style={{ ['--i' as any]: i, fontSize: 26 + ((i * 13) % 4) * 6 }}>{x.w}</span>)}
          {!words.length && !guesses.length && <span className="empty">Your one-word answers will show up here.</span>}
        </R>
      </div>
    </div>
  );
}

// The chip vote: five chips each across the four samples and the two directions not in the tasting. Orbs grow as chips
// land; build 1 ranks the top three.
export function NextRound({ s, step }: SceneProps) {
  const live = useLive();
  const t = tallyPick(s, 'directions');
  const voters = Object.keys(s.votes.directions?.picks || {}).length;
  const max = Math.max(1, ...Object.values(t));
  const order = ranked(t).filter(([, n]) => n > 0).map((x) => x[0]);
  const revealed = step >= 1;
  return (
    <div className="vt" style={{ ['--h' as any]: OBJ_HUE[1] }}>
      <div className="vt-glow" />
      <div className="pad">
        <Enter i={0}><div className="k">Vote on your phone · five chips each · {voters} {voters === 1 ? 'person has' : 'people have'} voted</div></Enter>
        <Enter i={1}><h2 className="h1 vt-q">What should get <span className="it">a next round?</span></h2></Enter>
        <div className="orbs nr">
          {DIRECTIONS.map((d, i) => {
            const n = t[d.id] || 0; const [c1, c2] = dirColors(d.id); const rank = order.indexOf(d.id); const top = revealed && rank > -1 && rank < 3;
            return (
              <button key={d.id} className={'orb' + (top ? ' top' : '') + (revealed && order.length && !top ? ' dim' : '')} style={{ ['--c1' as any]: c1, ['--c2' as any]: c2, ['--s' as any]: `${130 + (n / max) * 110}px`, ['--i' as any]: i }} data-nonav onClick={() => !live.still && hand(live, 'directions', { [d.id]: 1 })}>
                <div className="orb-ball"><b className="num">{n}</b></div>
                <span>{directionName(d.id, s)}</span><small className="k">{d.sub}</small>
                {top && <em className="k">Number {rank + 1}</em>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// An input that writes to the session as you type (after a short pause) and picks up changes from elsewhere when idle.
function Synced({ value, commit, area, ...rest }: { value: string; commit: (v: string) => void; area?: boolean } & Record<string, any>) {
  const [v, setV] = useState(value);
  const focused = useRef(false); const timer = useRef<any>(null);
  useEffect(() => { if (!focused.current) setV(value); }, [value]);
  const props = {
    ...rest, value: v, 'data-nonav': true,
    onFocus: () => { focused.current = true; },
    onBlur: () => { focused.current = false; clearTimeout(timer.current); if (v !== value) commit(v); },
    onChange: (e: any) => { const x = e.target.value; setV(x); clearTimeout(timer.current); timer.current = setTimeout(() => commit(x), 700); },
  };
  return area ? <textarea {...props} /> : <input {...props} />;
}

// The concept cards: up to three, typed in as the room talks. Each box suggests the morning's own options.
const GROWS = ['Loyal users', 'New consumers', 'Both'];
export const FIELDS: { f: string; key: string; l: string; opts: string[] }[] = [
  { f: 'dir', key: 'why', l: 'Starts from', opts: [...SAMPLES.map((x) => `Sample ${x.code}`), ...PLATFORMS.map((t) => t.name)] },
  { f: 'who', key: 'segment', l: 'Who it’s for', opts: SURVEY.consumer.options },
  { f: 'when', key: 'occasion', l: 'When', opts: SURVEY.moment.options },
  { f: 'role', key: 'role', l: 'Role in the range', opts: ROLES.map((r) => r.id) },
  { f: 'format', key: 'format', l: 'Format', opts: FORMATS },
  { f: 'grows', key: 'incremental', l: 'What it grows', opts: GROWS },
];
export function ConceptCanvas({ s }: SceneProps) {
  const live = useLive();
  const set = (team: number, key: string, v: string) => live.send('concept', { team, slot: 1, fields: { [key]: v.slice(0, 120) } });
  return (
    <div className="pad ccv">
      <Enter i={0}><div className="k">Part 3 · Up to three concepts</div></Enter>
      <Enter i={1}><h2 className="h2" style={{ maxWidth: 1600 }}>{TOPICS[2].questions[0]} <span className="it">{TOPICS[2].questions[1]}</span></h2></Enter>
      <div className="ccv-grid">
        {[1, 2, 3].map((c, i) => {
          const con = (s.concepts[`t${c}-1`] || {}) as any;
          return (
            <Enter key={c} i={2 + i} className={'cv-card ccv-card' + (con.name ? ' named' : '')}>
              <span className="k">Concept {c}</span>
              <Synced className="ccv-name" value={con.name || ''} commit={(v: string) => set(c, 'name', v)} placeholder="Working name" aria-label={`Concept ${c} name`} />
              {FIELDS.map((x) => (
                <label key={x.f} className={con[x.key] ? 'on' : ''} data-nonav>
                  <span>{x.l}</span>
                  <Synced list={`ccv-${x.f}`} value={con[x.key] || ''} commit={(v: string) => set(c, x.key, v)} />
                </label>
              ))}
            </Enter>
          );
        })}
      </div>
      {FIELDS.map((x) => <datalist key={x.f} id={`ccv-${x.f}`}>{(x.f === 'dir' ? [...SAMPLES.map((m) => `${m.code}. ${directionName(m.code, s)}`), ...x.opts.slice(SAMPLES.length)] : x.opts).map((o) => <option key={o} value={o} />)}</datalist>)}
    </div>
  );
}

// The dot vote: three dots each across the concepts and the four samples. Build 1 ranks the top three.
export function DotsShow({ s, step }: SceneProps) {
  const live = useLive();
  const t = tallyPick(s, 'concepts');
  const voters = Object.keys(s.votes.concepts?.picks || {}).length;
  // Concepts first, then the samples, in a fixed order so rows do not jump while votes land.
  const items = [...candidates(s)].sort((a, b) => (a.kind === b.kind ? a.id.localeCompare(b.id) : a.kind === 'concept' ? -1 : 1));
  const max = Math.max(1, ...items.map((x) => t[x.id] || 0));
  const top = ranked(t).filter(([, n]) => n > 0).slice(0, 3).map((x) => x[0]);
  const revealed = step >= 1;
  return (
    <div className="vt" style={{ ['--h' as any]: OBJ_HUE[2] }}>
      <div className="vt-glow" />
      <div className="pad">
        <Enter i={0}><div className="k">Vote on your phone · three dots each · {voters} {voters === 1 ? 'person has' : 'people have'} voted</div></Enter>
        <Enter i={1}><h2 className="h1 vt-q">Which ideas <span className="it">should we develop?</span></h2></Enter>
        <div className="dotlist">
          {items.map((x, i) => {
            const n = t[x.id] || 0; const rank = top.indexOf(x.id);
            return (
              <button key={x.id} className={'dl' + (revealed && rank > -1 ? ' top' : '') + (revealed && rank < 0 ? ' dim' : '')} style={{ ['--c' as any]: x.color, ['--i' as any]: i }} data-nonav onClick={() => !live.still && hand(live, 'concepts', { [x.id]: 1 })}>
                <span className="dl-name"><b>{x.name}</b><small>{x.sub}</small></span>
                <span className="dl-dots">{Array.from({ length: n }, (_, j) => <i key={j} style={{ ['--j' as any]: j }} />)}</span>
                <span className="dl-bar"><i style={{ width: `${(n / max) * 100}%` }} /></span>
                <b className="num dl-n">{n}</b>
                {revealed && rank > -1 && <em className="k">Number {rank + 1}</em>}
              </button>
            );
          })}
          {!teamConcepts(s).length && <p className="empty">The concepts we write together will show up here, next to the four samples.</p>}
        </div>
      </div>
    </div>
  );
}

// Where TheraBreath fits in a day: the moments from morning to night on one line, with "On the go" set apart. Build 1
// shows where we think TheraBreath already is (our read of the public listings, to challenge), build 2 the moment the
// pre-brief answers say is missing, build 3 everything still open. Below, one row per concept written this morning (or
// the samples and directions before any are written): click a cell to mark where that idea could fit.
const CONCEPT_COLORS = ['#3FB6D3', '#E39A35', '#D96C9C'];
export function dayRows(s: SessionState) {
  const cs = teamConcepts(s);
  return cs.length
    ? cs.map((c) => ({ id: c.id, name: c.name, sub: c.segment ? `For ${c.segment}` : `Concept ${c.team}`, color: CONCEPT_COLORS[(c.team - 1) % 3] }))
    : DIRECTIONS.map((d) => ({ id: d.id, name: directionName(d.id, s), sub: d.sub, color: d.colors[1] }));
}
export const markLabel = (s: SessionState, cell: string) => {
  const [id, m] = cell.split('|');
  const name = teamConcepts(s).find((c) => c.id === id)?.name || directionName(id, s);
  return `${name} · ${m}`;
};
export function WhiteSpaceShow({ s, step }: SceneProps) {
  const live = useLive();
  const marks = s.marks || [];
  const answers = Object.values(s.survey || {});
  const tally = (key: 'consumer' | 'moment') => { const t: Record<string, number> = {}; answers.forEach((a) => a[key] && (t[a[key]!] = (t[a[key]!] || 0) + 1)); return t; };
  const mom = tally('moment'), seg = tally('consumer');
  const maxM = Math.max(1, ...Object.values(mom));
  const topMom = ranked(mom)[0]?.[0], topSeg = ranked(seg)[0];
  const cols = [...WHITESPACE.moments.filter((m) => m !== 'On the go'), 'On the go'];
  const rows = dayRows(s);
  const now = (m: string) => step >= 1 && !!WHITESPACE.present[m];
  const open = (m: string) => step >= 3 && !WHITESPACE.present[m];
  return (
    <div className="pad dy">
      <Enter i={0}><div className="k">Part 4 · White-space opportunities · our read, so correct us where we’re wrong</div></Enter>
      <div className="wsp-head">
        <div className={'wsp-h' + (step < 3 ? ' on' : '')}><h2 className="h2">Where TheraBreath shows up <span className="it">in a day.</span></h2></div>
        <div className={'wsp-h' + (step >= 3 ? ' on' : '')}><h2 className="h2">Most of the day <span className="it">is still open.</span></h2></div>
      </div>
      <div className="dy-grid" style={{ ['--cols' as any]: cols.length, ['--rows' as any]: rows.length }}>
        <div className="dy-key">
          <R b={1} step={step} className="dy-k"><i className="now" />TheraBreath today</R>
          <R b={2} step={step} className="dy-k"><i className="vote" />{answers.length ? `Missing, from ${answers.length} pre-briefs` : 'Missing, from your pre-briefs'}</R>
          <R b={3} step={step} className="dy-k"><i className="open" />Still open</R>
        </div>
        {cols.map((m, c) => (
          <div key={m} className={'dy-col' + (m === 'On the go' ? ' any' : '') + (step >= 2 && m === topMom ? ' top' : '')} style={{ ['--c' as any]: c }}>
            <div className="dy-bar"><i style={{ height: step >= 2 ? `${((mom[m] || 0) / maxM) * 64}px` : 0 }} />{step >= 2 && mom[m] ? <b className="num">{mom[m]}</b> : null}</div>
            <span className="dy-dot" />
            <span className="dy-name">{m}</span>
            <em className={'dy-now' + (now(m) ? ' on' : '') + (open(m) ? ' open' : '')}>{now(m) ? WHITESPACE.present[m] : open(m) ? 'Open' : ''}</em>
          </div>
        ))}
        {rows.map((r) => (
          <React.Fragment key={r.id}>
            <div className="dy-row" style={{ ['--rc' as any]: r.color }}><i /><b>{r.name}</b><small>{r.sub}</small></div>
            {cols.map((m) => {
              const cell = `${r.id}|${m}`;
              return <button key={m} data-nonav onClick={() => !live.still && live.send('mark', { cell })} aria-label={`${r.name}, ${m}`} style={{ ['--rc' as any]: r.color }}
                className={'dy-cell' + (now(m) ? ' now' : '') + (open(m) ? ' open' : '') + (marks.includes(cell) ? ' mark' : '') + (m === 'On the go' ? ' any' : '')} />;
            })}
          </React.Fragment>
        ))}
      </div>
      <R b={3} step={step} className="dy-lede">Ross asked for flavors that <span className="it">unlock new usage occasions.</span> Every open moment is one. Click a cell to mark where an idea fits.</R>
      <div className="src stage-src">{WHITESPACE.read}{step >= 2 && topSeg ? ` In the pre-brief, most of you said you want to win ${topSeg[0].charAt(0).toLowerCase() + topSeg[0].slice(1)}.` : ''}</div>
    </div>
  );
}

// Now, Next, Later: typed in as the room decides, with the winners of the morning's votes in a tray above.
export function Board({ s }: SceneProps) {
  const live = useLive();
  const tray = [...ranked(tallyPick(s, 'concepts')).filter(([, n]) => n > 0).slice(0, 3).map(([id]) => candidates(s).find((x) => x.id === id)?.name || id), ...ranked(tallyPick(s, 'directions')).filter(([, n]) => n > 0).slice(0, 3).map(([id]) => directionName(id, s))];
  return (
    <div className="pad sb">
      <Enter i={0}><div className="k">Part 4 · Now, Next, Later</div></Enter>
      <Enter i={1}><h2 className="h2" style={{ maxWidth: 1600 }}>What should go first? <span className="it">And what has to be true for it to work?</span></h2></Enter>
      <Enter i={2} className="sb-tray"><span className="k">Top votes this morning</span>{tray.length ? [...new Set(tray)].map((x) => <span key={x} className="tchip">{x}</span>) : <em>The top concepts and directions from the votes will show up here.</em>}</Enter>
      <div className="sb-cols">
        {HORIZONS.map((h, i) => (
          <Enter key={h.id} i={3 + i} className={'sb-col ' + h.id.toLowerCase()}>
            <label data-nonav>
              <b>{h.label}</b><span className="k">{h.when}</span>
              <Synced area value={s.board?.[h.id] || ''} commit={(v: string) => live.send('board', { horizon: h.id, text: v })} placeholder="One line per direction" />
            </label>
          </Enter>
        ))}
      </div>
      <Enter i={6} className="src stage-src">For each one, name a TFF owner, a C&amp;D reviewer, the base and the next sample step.</Enter>
    </div>
  );
}

// What the morning decided, in one place: shared by the Playbook scene and the results page.
export function decided(s: SessionState) {
  const lines = (id: string) => (s.board?.[id] || '').split('\n').map((x) => x.trim()).filter(Boolean);
  const items = candidates(s);
  return {
    signals: ranked(tallyPick(s, 'signals')).filter(([, n]) => n > 0).slice(0, 3).map(([id, n]) => ({ t: SIGNALS.find((x) => x.id === id)?.title || id, n })),
    directions: ranked(tallyPick(s, 'directions')).filter(([, n]) => n > 0).slice(0, 3).map(([id, n]) => ({ t: directionName(id, s), n })),
    ideas: ranked(tallyPick(s, 'concepts')).filter(([, n]) => n > 0).slice(0, 3).map(([id, n]) => ({ t: items.find((x) => x.id === id)?.name || id, n })),
    concepts: teamConcepts(s),
    plan: HORIZONS.flatMap((h) => lines(h.id).map((x) => ({ h: h.label, t: x }))),
    tasting: SAMPLES.map((x) => ({ ...x, name: directionName(x.code, s), sum: tasteSummary(s, x.code) })),
  };
}

export function Playbook({ s, step }: SceneProps) {
  const d = decided(s);
  const pages = [
    { k: 'Chapter 1', t: 'Trends', l: d.signals.map((x) => x.t) },
    { k: 'Chapter 2', t: 'Directions', l: d.directions.map((x) => x.t) },
    { k: 'Chapter 3', t: 'Concepts', l: (d.ideas.length ? d.ideas.map((x) => x.t) : d.concepts.map((c) => c.name).filter(Boolean)) },
    { k: 'Chapter 4', t: 'The plan', l: d.plan.slice(0, 6).map((x) => `${x.h} · ${x.t}`) },
  ];
  return (
    <div className="assemble">
      <Light scene="drop" theme="b" camera={{ pos: [0, 0.4, 9.5], target: [0, -0.4, 0], fov: 26, shift: [0, 0.1] }} frame={(t) => ({ rot: t * 0.08 })} fallback="/img/cover-drop.jpg" style={{ position: 'absolute', inset: 0, opacity: 0.55 }} />
      <div className={'stack' + (step >= 1 ? ' closed' : '')}>
        {pages.map((p, i) => (
          <div key={p.t} className="page" style={{ ['--i' as any]: i }}>
            <div className="k">{p.k}</div><b>{p.t}</b>
            <ul>{p.l.length ? p.l.map((x, j) => <li key={j}>{x}</li>) : <li className="ghost">Decided today</li>}</ul>
          </div>
        ))}
        <div className="page cover" style={{ ['--i' as any]: 4 }}>
          <div className="k">TheraBreath × The Flavor Factory</div>
          <b className="cover-t">The Flavor Playbook</b>
          <span className="it">What we decided on {EVENT.date.replace('Monday, ', '')}</span>
          <div className="cover-names">Church &amp; Dwight Oral Care R&amp;D and The Flavor Factory</div>
          <div className="k" style={{ marginTop: 'auto' }}>Draft · {EVENT.city}</div>
        </div>
      </div>
      <div className="as-copy">
        <Enter i={0}><div className="k">Wrapping up</div></Enter>
        <Enter i={1}><h2 className="h1">Here’s what<br /><span className="it">we decided.</span></h2></Enter>
        <Enter i={2}><p className="lede as-lede">We’ll write it all up and send it to everyone here within 8 business days.</p></Enter>
      </div>
    </div>
  );
}

// The QR in the corner of the voting scenes, for anyone who has not joined yet.
export function JoinCorner({ url }: { url: string }) {
  const qr = useQR(url);
  return <div className="join-corner"><div className="qr" dangerouslySetInnerHTML={{ __html: qr }} /><span className="k">Scan to vote</span></div>;
}

// THE FLAVOR RACE fills the screen and starts with sound on the keypress that lands on it. On paper it is the poster.
export function ShowFilm({ still }: { still: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const v = ref.current; if (!v) return;
    v.muted = false;
    v.play().catch(() => { v.muted = true; setMuted(true); v.play().catch(() => {}); });
    return () => v.pause();
  }, []);
  if (still) return <div className="film"><img src="/media/flavor-race-poster.jpg" alt="THE FLAVOR RACE" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /></div>;
  return (
    <div className="film" data-nonav onClick={() => { const v = ref.current!; v.muted = false; setMuted(false); v.play(); }}>
      <video ref={ref} playsInline preload="auto" poster="/media/flavor-race-poster.jpg" onEnded={() => setDone(true)}>
        <source src="/media/flavor-race.mp4" type="video/mp4" />
      </video>
      {muted && !done && <div className="film-sound">Click for sound</div>}
      <div className={'film-end' + (done ? ' on' : '')}><div className="k">TheraBreath × The Flavor Factory</div><h1 className="hero center">The Future<br /><span className="it">of Freshness</span></h1></div>
    </div>
  );
}
