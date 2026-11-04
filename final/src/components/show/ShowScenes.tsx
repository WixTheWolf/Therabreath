'use client';
// The scenes only the presentation has. Everything the room decides lives in the shared session: phones vote and score,
// and the concept cards, the white-space marks and Now, Next and Later go into the same log by tapping (nothing is typed
// on the day), so the Playbook at the end, the results page and every phone see the same thing. Hand votes for anyone
// without a phone, and the count of paper scorecards, go in from the presenter view (/host/presenter).
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Light from '../Light';
import { R, Enter, Src, SceneProps } from '../scenes/ui';
import { teamConcepts } from '../scenes/CoCreate';
import { useQR } from '../scenes/Opening';
import {
  EVENT, OBJECTIVES, TOPICS, RUN, TEAM, ABOUT, SCIENCE, IMAGINATION, ROSS_WORDS, SIGNALS, SAMPLES, PRIMARY_TERRITORIES as PLATFORMS,
  SURVEY, ROLES, FORMATS, ROSS_GOAL, HORIZONS, WHITESPACE, DIRECTIONS, MYSTERY, CRITERIA, JAR, NEXT_STEPS,
} from '@/lib/content';
import type { FilmAct, FilmState } from '@/lib/showLink';
import { tallyPick, ranked, tasteSummary, voteCounts, tasters as tasterCounts, SessionState } from '@/lib/state';
import { PLAN_READBACK, PlanTap, planRows, planCell } from './Plan';
import { ConceptCards } from './Concepts';
import { CONCEPT_FIELDS } from '@/lib/conceptLibrary';

// goStep moves to a build of the current slide (a direction's profile card on the map, say).
export type Live = { send: (kind: string, data?: any, pid?: string) => any; still: boolean; joinUrl: string; goStep: (step: number) => void };
export const LiveCtx = createContext<Live | null>(null);
const useLive = () => useContext(LiveCtx)!;
// "12 people have voted · 3 chips by hand": the phones, then what the presenter view added for people without one.
const tally = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const byHandNote = (n: number, one: string, many: string) => (n ? ` · ${n} ${n === 1 ? one : many} by hand` : '');

// The four objectives: one hue and one photograph each.
export const OBJ_HUE = [200, 32, 335, 262];
export const OBJ_IMG = ['/img/open-1-ice.webp', '/img/open-2-citrus.webp', '/img/open-3-bloom.webp', '/img/open-4-violet.webp'];
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
      <Enter i={1}><h2 className="h2" style={{ maxWidth: 1500 }}>We’ve built the morning <span className="it">around your four objectives.</span></h2></Enter>
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
  const t = tallyPick(s, 'signals');
  const c = voteCounts(s, 'signals');
  const max = Math.max(1, ...Object.values(t));
  const top3 = ranked(t).filter(([, n]) => n > 0).slice(0, 3).map((x) => x[0]);
  const revealed = step >= 1;
  return (
    <div className="vt" style={{ ['--h' as any]: OBJ_HUE[0] }}>
      <div className="vt-glow" />
      <div className="pad">
        <Enter i={0}><div className="k">Vote on your phone · {tally(c.phones, 'vote', 'votes')} so far{byHandNote(c.hand, 'vote', 'votes')}</div></Enter>
        <Enter i={1}><h2 className="h1 vt-q">Which three matter most <span className="it">for TheraBreath?</span></h2></Enter>
        <div className="glassbars">
          {SIGNALS.map((sig) => {
            const n = t[sig.id] || 0; const top = revealed && top3.includes(sig.id);
            return (
              <div key={sig.id} className={'gb' + (top ? ' top' : '') + (revealed && !top ? ' dim' : '')} style={{ ['--h' as any]: sig.hue }} data-nonav>
                <div className="gb-glass"><div className="gb-liquid" style={{ height: `${Math.max(3, (n / max) * 100)}%` }}><i /></div><b className="num">{n}</b></div>
                <div className="gb-lab"><span className="num">0{sig.n}</span>{sig.title.replace(/\.$/, '')}</div>
              </div>
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
  const who = tasterCounts(s), n = who.phones + who.cards;
  const left = Math.max(0, (s.paperCards || 0) - who.cards); // paper cards counted on the day, typed in after the morning
  const metrics = CRITERIA.map((c) => [c.key, c.l] as const);
  const cell = (v: number) => { const a = Math.max(0, Math.min(1, (v - 1) / 4)); return { background: `color-mix(in oklab, var(--accent) ${Math.round(a * 85)}%, transparent)`, opacity: v ? 1 : 0.4 }; };
  const guesses = Object.values(s.ratings[MYSTERY] || {}).map((r) => r.fruitGuess).filter(Boolean) as string[];
  const words = rows.flatMap((r) => r.sum.words.map((w) => ({ w, code: r.code })));
  return (
    <div className="tl">
      <img className="tl-img" src="/img/tasting-cups.webp" alt="" />
      <div className="tl-shade" />
      <div className="pad">
        <Enter i={0}><div className="k">The blind tasting · made in the bases you sent · {who.cards ? `${who.phones} scored on phones, ${who.cards} on paper` : `${n} ${n === 1 ? 'person has' : 'people have'} scored`}{left ? ` · plus ${left} paper ${left === 1 ? 'card' : 'cards'}, added after the morning` : ''}</div></Enter>
        <Enter i={1}><h2 className="h1">Four samples, <span className="it">tasted blind.</span></h2></Enter>
        <Enter i={2}><p className="lede tl-lede">Score each one on your phone or on the paper card. Once everyone’s done, we’ll tell you what they are.</p></Enter>
        <div className="heat">
          <div className="hrow head"><span />{metrics.map(([, l]) => <span key={l}>{l}</span>)}{JAR.map((j) => <span key={j.key}>{j.l}</span>)}</div>
          {rows.map((r) => (
            <div key={r.code} className="hrow">
              <div className={'hname' + (step >= 2 ? ' flip' : '')}><b className="num">{r.code}</b><span>{step >= 2 ? s.revealed?.samples[r.code]?.name || r.base : r.base}{/* The Mystery Flavor stays a mystery: its name goes up, but what's in it isn't shown. */}{step >= 2 && r.code !== MYSTERY && <small>{s.revealed?.samples[r.code]?.note}</small>}</span></div>
              {metrics.map(([m]) => <div key={m} className="hcell" style={cell(r.sum[m])}><b className="num">{r.sum[m] ? r.sum[m].toFixed(1) : ''}</b></div>)}
              {JAR.map((j) => { const top = ranked(r.sum[j.key])[0]; return <div key={j.key} className="hjar">{top ? <><span>{top[0]}</span><b className="num">{top[1]}</b></> : null}</div>; })}
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
  const t = tallyPick(s, 'directions');
  const c = voteCounts(s, 'directions');
  const max = Math.max(1, ...Object.values(t));
  const order = ranked(t).filter(([, n]) => n > 0).map((x) => x[0]);
  const revealed = step >= 1;
  return (
    <div className="vt" style={{ ['--h' as any]: OBJ_HUE[1] }}>
      <div className="vt-glow" />
      <div className="pad">
        <Enter i={0}><div className="k">Vote on your phone · five chips each · {tally(c.phones, 'person has', 'people have')} voted{byHandNote(c.hand, 'chip', 'chips')}</div></Enter>
        <Enter i={1}><h2 className="h1 vt-q">What should get <span className="it">a next round?</span></h2></Enter>
        <div className="orbs nr">
          {DIRECTIONS.map((d, i) => {
            const n = t[d.id] || 0; const [c1, c2] = dirColors(d.id); const rank = order.indexOf(d.id); const top = revealed && rank > -1 && rank < 3;
            return (
              <div key={d.id} className={'orb' + (top ? ' top' : '') + (revealed && order.length && !top ? ' dim' : '')} style={{ ['--c1' as any]: c1, ['--c2' as any]: c2, ['--s' as any]: `${130 + (n / max) * 110}px`, ['--i' as any]: i }} data-nonav>
                <div className="orb-ball"><b className="num">{n}</b></div>
                <span>{directionName(d.id, s)}</span><small className="k">{d.sub}</small>
                {top && <em className="k">Number {rank + 1}</em>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// The concept cards: up to three, started from the chips vote and changed by tapping in the presenter view (see
// Concepts.tsx). The TV shows them; nothing here is typed.
export const FIELDS = CONCEPT_FIELDS.map((x) => ({ f: x.key, key: x.key, l: x.l, opts: x.opts || [] }));
export function ConceptCanvas({ s }: SceneProps) {
  return (
    <div className="pad ccv">
      <Enter i={0}><div className="k">Up to three concepts</div></Enter>
      <Enter i={1}><h2 className="h2" style={{ maxWidth: 1600 }}>{TOPICS[2].questions[0]} <span className="it">{TOPICS[2].questions[1]}</span></h2></Enter>
      <ConceptCards s={s} />
    </div>
  );
}

// Where TheraBreath fits in a day: the moments from morning to night on one line, with "On the go" set apart. Build 1
// shows where we think TheraBreath already is (our read of the public listings, to challenge), build 2 the moment the
// pre-brief answers say is missing, build 3 everything still open. Below, one row for each of the top three from the
// chips vote (or every sample and direction if no chips came in): click a cell to mark where it could fit.
export function dayRows(s: SessionState) {
  const t = tallyPick(s, 'directions');
  const top = ranked(t).filter(([, n]) => n > 0).slice(0, 3).map(([id]) => id);
  const list = top.length ? top.map((id) => DIRECTIONS.find((d) => d.id === id)).filter(Boolean) as typeof DIRECTIONS : DIRECTIONS;
  return list.map((d) => ({ id: d.id, name: directionName(d.id, s), sub: t[d.id] ? `${t[d.id]} ${t[d.id] === 1 ? 'chip' : 'chips'} · ${d.sub}` : d.sub, color: d.colors[1] }));
}
export const markLabel = (s: SessionState, cell: string) => {
  const [id, m] = cell.split('|');
  const name = teamConcepts(s).find((c) => c.id === id)?.name || directionName(id, s);
  return `${name} · ${m}`;
};
// The pre-brief's most common answer to who the next flavor is for, with its count, or that it was split.
const segLine = (r: [string, number][], n: number) => {
  if (!r.length) return '';
  if (r[1] && r[1][1] === r[0][1]) return ` In the pre-brief, the answers were split on who the next flavor should be for.`;
  return ` In the pre-brief, the most common answer for who the next flavor should be for was ${r[0][0].charAt(0).toLowerCase() + r[0][0].slice(1)} (${r[0][1]} of ${n}).`;
};
export function WhiteSpaceShow({ s, step }: SceneProps) {
  const live = useLive();
  const marks = s.marks || [];
  const answers = Object.values(s.survey || {});
  const tally = (key: 'consumer' | 'moment') => { const t: Record<string, number> = {}; answers.forEach((a) => a[key] && (t[a[key]!] = (t[a[key]!] || 0) + 1)); return t; };
  const mom = tally('moment'), seg = tally('consumer');
  const maxM = Math.max(1, ...Object.values(mom));
  const topMom = ranked(mom)[0]?.[0];
  const cols = [...WHITESPACE.moments.filter((m) => m !== 'On the go'), 'On the go'];
  const rows = dayRows(s);
  const now = (m: string) => step >= 1 && !!WHITESPACE.present[m];
  const open = (m: string) => step >= 3 && !WHITESPACE.present[m];
  return (
    <div className="pad dy">
      <Enter i={0}><div className="k">White-space opportunities · our read, so correct us where we’re wrong</div></Enter>
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
      <div className="src stage-src">{WHITESPACE.read}{step >= 2 ? segLine(ranked(seg), answers.length) : ''}</div>
    </div>
  );
}

// Now, Next, Later: the concepts and the top three from the chips vote sit in a tray; tap one, then tap Now, Next or
// Later to place it. Lines can be moved or taken back the same way. Their fields are tapped in the presenter view.
export function Board({ s }: SceneProps) {
  const live = useLive();
  return (
    <div className="pad sb">
      <Enter i={0}><div className="k">Now, Next, Later</div></Enter>
      <Enter i={1}><h2 className="h2" style={{ maxWidth: 1600 }}>What should go first? <span className="it">And what has to be true for it to work?</span></h2></Enter>
      <Enter i={2} className="sb-tap"><PlanTap s={s} send={live.send} still={live.still} /></Enter>
    </div>
  );
}

// What the morning decided, in one place: shared by the Playbook scene and the results page.
export function decided(s: SessionState) {
  return {
    signals: ranked(tallyPick(s, 'signals')).filter(([, n]) => n > 0).slice(0, 3).map(([id, n]) => ({ t: SIGNALS.find((x) => x.id === id)?.title || id, so: SIGNALS.find((x) => x.id === id)?.so || '', n })),
    directions: ranked(tallyPick(s, 'directions')).filter(([, n]) => n > 0).slice(0, 3).map(([id, n]) => ({ t: directionName(id, s), n })),
    concepts: teamConcepts(s),
    plan: planRows(s),
    tasting: SAMPLES.map((x) => ({ ...x, name: directionName(x.code, s), sum: tasteSummary(s, x.code) })),
  };
}

// What we decided and what happens next. Build 0 fans the four chapters out; builds 1 to 4 open each one at reading
// size (the trends, the directions with the tasting, the concepts, and the plan with its owners last), so it can be read
// back to the room; builds 5 to 7 close them into the cover and bring in the three next steps one at a time.
export function Playbook({ s, step }: SceneProps) {
  const d = decided(s);
  const pages = [
    { k: 'Chapter 1', t: 'Trends', l: d.signals.map((x) => x.t) },
    { k: 'Chapter 2', t: 'Directions', l: d.directions.map((x) => x.t) },
    { k: 'Chapter 3', t: 'Concepts', l: d.concepts.map((c) => c.name).filter(Boolean) },
    { k: 'Chapter 4', t: 'The plan', l: d.plan.slice(0, 6).map((x) => `${x.label} · ${x.what}`) },
  ];
  const reading = step >= 1 && step <= 4;
  const next = step >= 5;
  // The first step names what goes forward from Now, Next, Later and who has it.
  const agreed = d.plan.filter((r) => r.what).slice(0, 3);
  return (
    <div className={'assemble' + (reading ? ' reading' : '') + (next ? ' pb-next' : '')}>
      <Light scene="drop" theme="b" camera={{ pos: [0, 0.4, 9.5], target: [0, -0.4, 0], fov: 26, shift: [0, 0.1] }} frame={(t) => ({ rot: t * 0.08 })} fallback="/img/cover-drop.jpg" style={{ position: 'absolute', inset: 0, opacity: 0.55 }} />
      <div className={'stack' + (next ? ' closed' : '')}>
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
      {!next ? (
        <div className="as-copy">
          <Enter i={0}><div className="k">Wrapping up</div></Enter>
          <Enter i={1}><h2 className="h1">Here’s what<br /><span className="it">we decided.</span></h2></Enter>
          <Enter i={2}><p className="lede as-lede">We’ll write it all up and send it to everyone here within 8 business days.</p></Enter>
        </div>
      ) : (
        <div className="as-copy pb-steps" key="next">
          <Enter i={0}><div className="k">What happens next</div></Enter>
          <Enter i={1}><h2 className="h1">Thank you. <span className="it">Here’s what happens next.</span></h2></Enter>
          <ol className="pb-list">
            {NEXT_STEPS.map((n, i) => (
              <R key={n.t} as="li" b={5 + i} step={step} className="pb-step"><span className="num">0{i + 1}</span>
                <div><b>{n.t}</b>
                  {i === 0 && agreed.length ? <ul className="agreed">{agreed.map((r) => <li key={r.id}><b>{r.what}</b><span>{[r.owner && `TFF: ${r.owner}`, r.reviewer && `C&D: ${r.reviewer}`].filter(Boolean).join(' · ') || 'Owners to agree'}</span></li>)}</ul> : <p>{n.d}</p>}
                </div>
              </R>
            ))}
          </ol>
        </div>
      )}
      {reading && <ReadPage key={step} n={step} d={d} />}
    </div>
  );
}

// One chapter of the Playbook at a size the back of the room can read.
const CH = ['Trends', 'Directions', 'Concepts', 'The plan'];
function ReadPage({ n, d }: { n: number; d: ReturnType<typeof decided> }) {
  const none = (t: string) => <p className="rp-none">{t}</p>;
  let body: React.ReactNode = null, title = '';
  if (n === 1) {
    title = 'The three trends that matter most';
    body = d.signals.length ? <ol className="rp-rank">{d.signals.map((x, j) => <li key={x.t}><span className="num">{j + 1}</span><span><b>{x.t.replace(/\.$/, '')}</b>{x.so && <small>{x.so}</small>}</span><em>{x.n} {x.n === 1 ? 'vote' : 'votes'}</em></li>)}</ol> : none('No trend votes came in.');
  } else if (n === 2) {
    title = 'What gets a next round';
    body = (
      <>
        {d.directions.length ? <ol className="rp-rank">{d.directions.map((x, j) => <li key={x.t}><span className="num">{j + 1}</span><b>{x.t}</b><em>{x.n} {x.n === 1 ? 'chip' : 'chips'}</em></li>)}</ol> : none('No chips were placed.')}
        <div className="rp-taste">
          <span className="rp-cap">The tasting, averaged from 1 to 5</span>
          {d.tasting.map((x) => <div key={x.code}><b>{x.code}. {x.name}</b><span>{x.sum.n ? CRITERIA.map((c) => `${c.l} ${x.sum[c.key].toFixed(1)}`).join(' · ') : 'No scores'}</span></div>)}
        </div>
      </>
    );
  } else if (n === 3) {
    title = 'The concepts we put together';
    body = d.concepts.length ? (
      <div className="rp-concepts" style={{ gridTemplateColumns: `repeat(${Math.min(3, d.concepts.length)}, 1fr)` }}>{d.concepts.slice(0, 3).map((c: any) => (
        <div key={c.id} className="rp-concept">
          <b>{c.name || 'Untitled concept'}</b>
          <dl>{FIELDS.map((f) => c[f.key] ? <div key={f.f}><dt>{f.l}</dt><dd>{c[f.key]}</dd></div> : null)}</dl>
        </div>
      ))}</div>
    ) : none('No concepts were put together.');
  } else {
    title = 'Now, Next, Later, with the owners';
    body = d.plan.length ? (
      <table className={'rp-plan' + (d.plan.length > 7 ? ' many' : d.plan.length <= 4 ? ' few' : '')}>
        <thead><tr><th /><th>Direction</th>{PLAN_READBACK.map((c) => <th key={c.f}>{c.l}</th>)}</tr></thead>
        <tbody>{d.plan.slice(0, 10).map((r, j) => (
          <tr key={r.id} className={r.h.toLowerCase()}>
            <td>{j === 0 || d.plan[j - 1].h !== r.h ? <span className="rp-h">{r.label}</span> : null}</td>
            <td><b>{r.what || 'Untitled'}</b></td>
            {PLAN_READBACK.map((c) => <td key={c.f}>{planCell(r, c.f) || <i>To agree</i>}</td>)}
          </tr>
        ))}</tbody>
      </table>
    ) : none('The plan fills in from Now, Next, Later.');
  }
  return (
    <section className="rp" aria-label={`Chapter ${n}: ${CH[n - 1]}`}>
      <header><span className="k">Chapter {n} of 4 · {CH[n - 1]}</span><span className="k">The Flavor Playbook · draft</span></header>
      <h2 className="rp-t">{title}</h2>
      {body}
    </section>
  );
}

// The QR in the corner of the voting scenes, for anyone who has not joined yet.
export function JoinCorner({ url }: { url: string }) {
  const qr = useQR(url);
  return <div className="join-corner"><div className="qr" dangerouslySetInnerHTML={{ __html: qr }} /><span className="k">Scan to vote</span></div>;
}

// THE FLAVOR RACE fills the screen and starts with sound on the move that lands on it, and stops when the slide is
// left. `ctl` lets the presentation and the presenter view pause, play and restart it (Space or K, and R), and read how
// it's doing; `onChange` says when that changes. A browser that won't play sound before anyone has pressed a key or
// clicked in this window plays it muted with a note on the TV; a click on the picture brings the sound in. On paper
// (the PDF decks) it is the closing card, so a shared deck never gives the film away. There is no poster: the film
// fades up from black, so the screen stays black until it plays (a poster of the Moon flashed before the start).
export type FilmCtl = { act: (a: FilmAct) => void; state: () => FilmState | undefined };
export function ShowFilm({ still, ctl, onChange }: { still: boolean; ctl?: React.MutableRefObject<FilmCtl | null>; onChange?: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);
  const [shown, setShown] = useState(false); // black until the first frame plays, so nothing flashes while it buffers
  const change = useRef(onChange); change.current = onChange;
  useEffect(() => {
    const v = ref.current; if (!v) return;
    const play = () => { v.muted = false; v.play().then(() => setMuted(false)).catch(() => { v.muted = true; setMuted(true); v.play().catch(() => {}); }); };
    play();
    if (ctl) ctl.current = {
      act: (a) => {
        if (a === 'restart' || (a === 'toggle' && v.ended)) { v.currentTime = 0; setDone(false); play(); }
        else if (a === 'toggle') { if (v.paused) play(); else v.pause(); }
        else if (a === 'sound') play();
      },
      state: () => ({ playing: !v.paused && !v.ended, ended: v.ended, muted: v.muted, t: v.currentTime, d: Number.isFinite(v.duration) ? v.duration : 0, ts: Date.now() }),
    };
    return () => { v.pause(); if (ctl) ctl.current = null; };
  }, [ctl]);
  const ev = (f?: () => void) => () => { f?.(); change.current?.(); };
  if (still) return <div className="film"><div className="film-end on"><div className="k">TheraBreath × The Flavor Factory</div><h1 className="hero center">The Future<br /><span className="it">of Freshness</span></h1></div></div>;
  return (
    <div className="film" data-nonav onClick={() => ctl?.current?.act(muted ? 'sound' : 'toggle')}>
      <video ref={ref} playsInline preload="auto" className={shown ? 'on' : ''} onPlaying={() => setShown(true)}
        onPlay={ev(() => { setPaused(false); setDone(false); })} onPause={ev(() => setPaused(true))} onEnded={ev(() => setDone(true))}
        onVolumeChange={ev(() => setMuted(!!ref.current?.muted))} onLoadedMetadata={ev()} onSeeked={ev()}>
        <source src="/media/flavor-race.mp4" type="video/mp4" />
      </video>
      {muted && !done && <div className="film-sound">Click for sound</div>}
      {paused && !done && !muted && <div className="film-paused">Paused</div>}
      <div className={'film-end' + (done ? ' on' : '')}><div className="k">TheraBreath × The Flavor Factory</div><h1 className="hero center">The Future<br /><span className="it">of Freshness</span></h1></div>
    </div>
  );
}
