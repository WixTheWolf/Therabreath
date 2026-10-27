'use client';
// The scenes only the presentation has: the title, who we are, the brief with its times, one opener per objective in
// Ross's words, the discussion scenes, the paper tasting, and the four scenes the room fills in live (the concept
// cards, the white space, Now, Next and Later, and the Playbook they add up to). Everything the room types or marks is
// held in Inputs and saved on the presenting laptop; there are no phones and no votes.
import React, { createContext, useContext } from 'react';
import Light from '../Light';
import { R, Enter, Src, SceneProps } from '../scenes/ui';
import {
  EVENT, OBJECTIVES, TOPICS, RUN, TEAM, SCIENCE, IMAGINATION, ROSS_WORDS, SIGNALS, SAMPLES, PRIMARY_TERRITORIES as PLATFORMS,
  SURVEY, ROLES, FORMATS, ROSS_GOAL, HORIZONS, WHITESPACE,
} from '@/lib/content';
import { ranked } from '@/lib/state';

export type Inputs = {
  picks: Record<string, string[]>; concepts: Record<string, string>; nnl: Record<string, string>; ws: string[];
  pick: (k: string, id: string, max: number) => void; type: (id: string, v: string) => void; write: (id: string, v: string) => void; mark: (cell: string) => void;
};
export const InputCtx = createContext<Inputs | null>(null);
const useInputs = () => useContext(InputCtx)!;

// The four objectives: one hue each, used by the opener and the discussion that closes it.
export const OBJ_HUE = [190, 28, 330, 260];
export const CHAPTER_NAMES = ['What is changing', 'Where flavor can go', 'What we could make', 'First, next and later'];
export const when = (n: string) => { const bs = RUN.filter((b) => b.obj === n); return bs.length ? `${bs[0].t} to ${bs[bs.length - 1].end}` : ''; };

// The directions the room can send to a next round: the four samples, then the two platforms not in the tasting.
export const DIRECTIONS = [
  ...SAMPLES.map((x) => ({ id: x.code, label: x.name, sub: `Sample ${x.code}`, c1: PLATFORMS.find((t) => t.id === x.territory)!.palette[0], c2: PLATFORMS.find((t) => t.id === x.territory)!.palette[1] })),
  ...PLATFORMS.filter((t) => !SAMPLES.some((x) => x.territory === t.id)).map((t) => ({ id: t.id, label: t.name, sub: 'Platform', c1: t.palette[0], c2: t.palette[1] })),
];
export const directionName = (id: string) => DIRECTIONS.find((d) => d.id === id)?.label || id;

export function ShowTitle() {
  return (
    <>
      <Light scene="drop" theme="b" camera={{ pos: [0, 0.4, 9.5], target: [0, -0.4, 0], fov: 26, shift: [0, 0.18] }} frame={(t) => ({ rot: t * 0.1 })} fallback="/img/cover-drop.jpg" />
      <div className="title-lock">
        <Enter i={0}><div className="k">TheraBreath × The Flavor Factory</div></Enter>
        <Enter i={1}><h1 className="hero center show-title">The Future <span className="it">of Freshness</span></h1></Enter>
        <Enter i={2}><div className="sub it center">{EVENT.sub}</div></Enter>
        <Enter i={3}><div className="meta center">{EVENT.date} · {EVENT.room} room · {EVENT.city}</div></Enter>
      </div>
      <div className="logos"><img src="/img/tff-logo-white.webp" alt="The Flavor Factory" /></div>
    </>
  );
}

export function Team() {
  return (
    <div className="pad st">
      <Enter i={0}><div className="k">Who we are · how we work</div></Enter>
      <Enter i={1}><h2 className="h1">Flavor is science <span className="it">and imagination.</span></h2></Enter>
      <div className="st-two">
        <Enter i={2} className="st-panel sci"><div className="st-head"><span className="k">Science</span><b>How a flavor survives the bottle</b></div><div className="st-chips">{SCIENCE.map((x) => <span key={x}>{x}</span>)}</div></Enter>
        <Enter i={3} className="st-panel ima"><div className="st-head"><span className="k">Imagination</span><b>Why someone wants it</b></div><div className="st-chips">{IMAGINATION.map((x) => <span key={x}>{x}</span>)}</div></Enter>
      </div>
      <div className="st-people">
        {TEAM.map((t, i) => <Enter key={t.name} i={4 + i} className="st-person"><b>{t.name}</b><span className="k">{t.title}</span></Enter>)}
      </div>
      <Enter i={8} className="st-ask"><p>You asked to see our &ldquo;{ROSS_WORDS.capabilities}.&rdquo; <span className="it">By noon you will have seen each one at work.</span></p></Enter>
    </div>
  );
}

// Ross's four objectives, word for word, each with the time of the morning that answers it.
export function ShowBrief({ step }: SceneProps) {
  return (
    <div className="pad">
      <Enter i={0}><div className="k">Your brief, our agenda</div></Enter>
      <Enter i={1}><h2 className="h2" style={{ maxWidth: 1500 }}>You asked for four things. <span className="it">Here is how we will answer them by noon.</span></h2></Enter>
      <div className="brief-tiles">
        {OBJECTIVES.map((o, i) => (
          <R key={o.n} b={i + 1} step={step} className="bt">
            <div className="bt-n num">{o.n}</div>
            <p className="bt-ask">{o.ask}</p>
            <div className="bt-to"><span>{when(o.n)}</span><b>{TOPICS[i].title.replace(/\.$/, '')}</b></div>
          </R>
        ))}
      </div>
      <R b={5} step={step} className="bt-goal"><span className="k">And one goal, in your words</span><p>&ldquo;&hellip;new flavor experiences that both <em>{ROSS_GOAL.loyal}</em> and <em>{ROSS_GOAL.fresh.replace(/\.$/, '')}</em>.&rdquo;</p><Src k="ross" style={{ position: 'static' }} /></R>
    </div>
  );
}

// Each objective opens on one screen: its number, its question, and Ross's words.
export function Opener({ idx }: SceneProps) {
  const o = OBJECTIVES[idx - 1], t = TOPICS[idx - 1];
  return (
    <div className="opener" style={{ ['--h' as any]: OBJ_HUE[idx - 1] }}>
      <div className="op-light" />
      <div className="op-num num">{o.n}</div>
      <div className="op-copy">
        <Enter i={0}><div className="k">Objective {o.n} of 04 · {when(o.n)}</div></Enter>
        <Enter i={1}><h1 className="hero op-title">{t.title}</h1></Enter>
        <Enter i={2} className="op-ross"><span className="k">In Ross&rsquo;s words</span><p>&ldquo;{o.ask}&rdquo;</p></Enter>
      </div>
    </div>
  );
}

// A discussion: the question large, the options as glass chips the presenter marks as the room decides, then a second
// question on the next build.
type Chip = { id: string; label: string; sub?: string; hue?: number; c1?: string; c2?: string };
function Talk({ step, n, pkey, max, q1, q2, chips, label }: { step: number; n: number; pkey: string; max: number; q1: React.ReactNode; q2: string; chips: Chip[]; label: string }) {
  const { picks, pick } = useInputs();
  const on = picks[pkey] || [];
  return (
    <div className="talk" style={{ ['--h' as any]: OBJ_HUE[n - 1] }}>
      <div className="op-light soft" />
      <div className="pad">
        <Enter i={0}><div className="k">Objective {OBJECTIVES[n - 1].n} · For discussion</div></Enter>
        <Enter i={1}><h2 className="h1 talk-q">{q1}</h2></Enter>
        <Enter i={2} className="talk-chips">
          <span className="k">{label}{on.length ? ` · ${on.length} marked` : ''}</span>
          <div className={'tc-grid n' + chips.length}>
            {chips.map((c) => (
              <button key={c.id} className={'tc' + (on.includes(c.id) ? ' on' : '')} onClick={() => pick(pkey, c.id, max)} data-nonav
                style={{ ['--ch' as any]: c.hue ?? 190, ['--c1' as any]: c.c1 || `hsl(${c.hue ?? 190} 80% 80%)`, ['--c2' as any]: c.c2 || `hsl(${c.hue ?? 190} 70% 55%)` }}>
                <i />{c.sub && <span className="k">{c.sub}</span>}<b>{c.label}</b>
              </button>
            ))}
          </div>
        </Enter>
        <R b={1} step={step} className="talk-q2"><span className="k">And</span><p className="h2 it">{q2}</p></R>
      </div>
    </div>
  );
}

export function Talk1({ step }: SceneProps) {
  return <Talk step={step} n={1} pkey="signals" max={3} label="Seven signals" q1={<>Which three signals matter most <span className="it">for TheraBreath?</span></>} q2={TOPICS[0].questions[1]}
    chips={SIGNALS.map((x) => ({ id: x.id, label: x.title.replace(/\.$/, ''), sub: `0${x.n}`, hue: x.hue }))} />;
}

export function Talk2({ step }: SceneProps) {
  return <Talk step={step} n={2} pkey="directions" max={6} label="Directions for a next round" q1={<>Which territory feels most like TheraBreath, <span className="it">and which stretches it furthest?</span></>} q2={TOPICS[1].questions[1]}
    chips={DIRECTIONS.map((d) => ({ id: d.id, label: d.label, sub: d.sub, c1: d.c1, c2: d.c2 }))} />;
}

// The blind tasting, scored on the paper card. The names flip in on the next build.
export function PaperTasting({ step }: SceneProps) {
  const rows = [['Appeal', '1 to 5'], ['Feels like TheraBreath', '1 to 5'], ['Newness', '1 to 5'], ['One word', 'for each sample']];
  return (
    <div className="pad pt">
      <Enter i={0}><div className="k">Blind tasting · samples A to D, made in the TheraBreath bases you sent</div></Enter>
      <Enter i={1}><h2 className="h1">Taste first. <span className="it">Names later.</span></h2></Enter>
      <div className="pt-rows">
        {SAMPLES.map((x, i) => (
          <Enter key={x.code} i={2 + i} className={'pt-row' + (step >= 1 ? ' flip' : '')}>
            <b className="num pt-code">{x.code}</b>
            <span className="k pt-base">{x.base}</span>
            <div className="pt-sealed">{x.mystery ? <em>Write down the fruits you taste</em> : <em>Sealed until the reveal</em>}</div>
            <div className="pt-name"><b>{x.name}</b><span>{x.note}</span></div>
          </Enter>
        ))}
      </div>
      <Enter i={6} className="pt-card">
        <span className="k">On your card</span>
        <ul>{rows.map(([a, b]) => <li key={a}><b>{a}</b><span>{b}</span></li>)}</ul>
        <p>Rinse and pause between samples.</p>
      </Enter>
      <R b={1} step={step} className="src stage-src">Development concepts made for this conversation: not products, claims or commercial formulations. Workshop reactions, not consumer validation.</R>
    </div>
  );
}

// The concept cards: up to three, typed in as the room decides. Each box suggests the morning's own options.
const GROWS = ['Loyal users', 'New consumers', 'Both'];
export const FIELDS: { f: string; l: string; opts: string[] }[] = [
  { f: 'dir', l: 'Start from', opts: [...SAMPLES.map((x) => `${x.code}. ${x.name}`), ...PLATFORMS.map((t) => t.name)] },
  { f: 'who', l: 'Who it is for', opts: SURVEY.consumer.options },
  { f: 'when', l: 'The moment', opts: SURVEY.moment.options },
  { f: 'role', l: 'Role in the range', opts: ROLES.map((r) => r.id) },
  { f: 'format', l: 'Format', opts: FORMATS },
  { f: 'grows', l: 'What it grows', opts: GROWS },
];
export function ConceptCanvas() {
  const { concepts, type } = useInputs();
  return (
    <div className="pad ccv">
      <Enter i={0}><div className="k">Objective 03 · Concepts, built in the room</div></Enter>
      <Enter i={1}><h2 className="h2" style={{ maxWidth: 1600 }}>{TOPICS[2].questions[0]} <span className="it">{TOPICS[2].questions[1]}</span></h2></Enter>
      <div className="ccv-grid">
        {[1, 2, 3].map((c, i) => (
          <Enter key={c} i={2 + i} className={'cv-card ccv-card' + (concepts[`${c}-name`] ? ' named' : '')}>
            <span className="k">Concept {c}</span>
            <input className="ccv-name" value={concepts[`${c}-name`] || ''} onChange={(e) => type(`${c}-name`, e.target.value)} placeholder="Name it" aria-label={`Concept ${c} name`} data-nonav />
            {FIELDS.map((x) => (
              <label key={x.f} className={concepts[`${c}-${x.f}`] ? 'on' : ''} data-nonav>
                <span>{x.l}</span>
                <input list={`ccv-${x.f}`} value={concepts[`${c}-${x.f}`] || ''} onChange={(e) => type(`${c}-${x.f}`, e.target.value)} />
              </label>
            ))}
          </Enter>
        ))}
      </div>
      {FIELDS.map((x) => <datalist key={x.f} id={`ccv-${x.f}`}>{x.opts.map((o) => <option key={o} value={o} />)}</datalist>)}
    </div>
  );
}

// White space: the moments of the day by the consumers from the pre-brief. Build 1 fills where TheraBreath is today
// (our read, to challenge), build 2 brings in the room's own pre-brief answers, build 3 lights the open cells. Click a
// cell to mark where a concept lands.
export function WhiteSpaceShow({ s, step }: SceneProps) {
  const { ws, mark } = useInputs();
  const answers = Object.values(s.survey || {});
  const count = (key: 'consumer' | 'moment') => { const t: Record<string, number> = {}; answers.forEach((a) => a[key] && (t[a[key]!] = (t[a[key]!] || 0) + 1)); return t; };
  const mom = count('moment'), seg = count('consumer');
  const topMom = ranked(mom).slice(0, 2).map((x) => x[0]), topSeg = ranked(seg).slice(0, 2).map((x) => x[0]);
  const maxM = Math.max(1, ...Object.values(mom)), maxS = Math.max(1, ...Object.values(seg));
  const voted = answers.length > 0;
  const hot = (sg: string, m: string) => step >= 3 && !WHITESPACE.today(sg, m) && (voted ? topMom.includes(m) && topSeg.includes(sg) : false);
  const open = (sg: string, m: string) => step >= 3 && !WHITESPACE.today(sg, m);
  return (
    <div className="pad wsp">
      <Enter i={0}><div className="k">Objective 04 · White space · moments of the day by consumer · our read, to challenge</div></Enter>
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
              const cell = `${sg}|${m}`, today = WHITESPACE.today(sg, m);
              return <button key={m} data-nonav onClick={() => mark(cell)} aria-label={`${sg}, ${m}`} className={'wsp-cell' + (step >= 1 && today ? ' today' : '') + (hot(sg, m) ? ' hot' : open(sg, m) ? ' open' : '') + (ws.includes(cell) ? ' mark' : '')} style={{ ['--i' as any]: r * WHITESPACE.moments.length + c }} />;
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="wsp-side">
        <R b={1} step={step} className="wsp-note"><i className="today" /><span>Where TheraBreath is today: the sink, morning and night, and the dry mouth lozenge on the go.</span></R>
        <R b={2} step={step} className="wsp-note"><i className="vote" /><span>{voted ? `${answers.length} pre-brief answers: the consumer you most want to win, and the moment you say is missing.` : 'Your pre-brief answers land here: the consumer to win, and the moment that is missing.'}</span></R>
        <R b={3} step={step} className="wsp-note hot"><i className="hot" /><span>White space: the day between the sinks. No TheraBreath flavor built for it yet.</span></R>
        <R b={3} step={step} className="wsp-note"><i className="mark" /><span>Where today&rsquo;s concepts land.</span></R>
      </div>
      <div className="src stage-src">{WHITESPACE.read}{voted ? ' Pre-brief answers from this room.' : ''}</div>
    </div>
  );
}

// Now, Next, Later: typed in as the room decides, with the morning's directions and concepts in a tray above.
export function Board() {
  const { nnl, write, picks, concepts } = useInputs();
  const tray = [...[1, 2, 3].map((c) => (concepts[`${c}-name`] || '').trim()).filter(Boolean), ...(picks.directions || []).map(directionName)];
  return (
    <div className="pad sb">
      <Enter i={0}><div className="k">Objective 04 · The pipeline</div></Enter>
      <Enter i={1}><h2 className="h2" style={{ maxWidth: 1600 }}>{TOPICS[3].questions[0].replace(/, and.*$/, '?')} <span className="it">And what has to be true for it to work?</span></h2></Enter>
      <Enter i={2} className="sb-tray"><span className="k">From this morning</span>{tray.length ? [...new Set(tray)].map((x) => <span key={x} className="tchip">{x}</span>) : <em>The concepts and the directions marked for a next round appear here.</em>}</Enter>
      <div className="sb-cols">
        {HORIZONS.map((h, i) => (
          <Enter key={h.id} i={3 + i} className={'sb-col ' + h.id.toLowerCase()}>
            <label data-nonav>
              <b>{h.label}</b><span className="k">{h.when}</span>
              <textarea value={nnl[h.id] || ''} onChange={(e) => write(h.id, e.target.value)} placeholder="One line per direction, as the room decides" />
            </label>
          </Enter>
        ))}
      </div>
      <Enter i={6} className="src stage-src">For each: a TFF owner, a C&amp;D reviewer, the base and the next sample action.</Enter>
    </div>
  );
}

// The Playbook the morning wrote: four chapters from what the room marked and typed, then the cover.
export function Playbook({ step }: SceneProps) {
  const { picks, concepts, nnl } = useInputs();
  const lines = (id: string) => (nnl[id] || '').split('\n').map((x) => x.trim()).filter(Boolean);
  const pages = [
    { k: 'Chapter 1', t: 'Signals', l: (picks.signals || []).map((id) => SIGNALS.find((x) => x.id === id)?.title || id) },
    { k: 'Chapter 2', t: 'Directions', l: (picks.directions || []).map(directionName) },
    { k: 'Chapter 3', t: 'Concepts', l: [1, 2, 3].map((c) => (concepts[`${c}-name`] || '').trim()).filter(Boolean) },
    { k: 'Chapter 4', t: 'Pipeline', l: HORIZONS.flatMap((h) => lines(h.id).map((x) => `${h.label} · ${x}`)).slice(0, 6) },
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
        <div className="page cover" style={{ ['--i' as any]: 4 }}>
          <div className="k">TheraBreath × The Flavor Factory</div>
          <b className="cover-t">The Flavor Playbook</b>
          <span className="it">{EVENT.sub}</span>
          <div className="cover-names">Built in the room by Church &amp; Dwight Oral Care R&amp;D and The Flavor Factory</div>
          <div className="k" style={{ marginTop: 'auto' }}>v0.1 · {EVENT.date.replace('Monday, ', '')} · {EVENT.city}</div>
        </div>
      </div>
      <div className="as-copy">
        <Enter i={0}><div className="k">What the morning wrote</div></Enter>
        <Enter i={1}><h2 className="h1">The Playbook<br /><span className="it">you just built.</span></h2></Enter>
        <Enter i={2}><p className="lede as-lede">Written up and sent to everyone in the room within 8 business days.</p></Enter>
      </div>
    </div>
  );
}

// THE FLAVOR RACE fills the screen and starts with sound on the keypress that lands on it. On paper it is the poster.
export function ShowFilm({ still }: { still: boolean }) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = React.useState(false);
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
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
