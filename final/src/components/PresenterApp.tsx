'use client';
// The presenter view (/host/presenter): the laptop's own screen while the presentation is full screen on the TV. P in
// the presentation opens it. It shows the talking points, where we are, Eastern time against the run of show and the
// short-version state, and it moves the presentation (over showLink.ts, so both windows must be in the same browser).
// It is also where hand votes go in for anyone without a phone (and come back out), where paper scorecards are counted,
// and where the concept cards and Now, Next, Later are filled in, all by tapping. Nothing here is on the TV.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { useLiveSurvey } from '@/lib/liveSurvey';
import { SCENES } from '@/lib/scenes';
import { pointsOf, titleOf } from '@/lib/sceneNotes';
import { EVENT, SIGNALS, DIRECTIONS, SAMPLES, MYSTERY, HORIZONS, CRITERIA, PRIMARY_TERRITORIES as TERRITORIES } from '@/lib/content';
import { tallyPick, voteCounts, tasters, tastingProgress, byHand, onPaper, people, uid, Ev, SessionState } from '@/lib/state';
import { PlanTap } from './show/Plan';
import { ConceptEditor } from './show/Concepts';
import { runTiming, etClock } from '@/lib/time';
import { SLIDE_MIN, SLIDE_TIMES } from '@/lib/slideTimes';
import { showChannel, ShowPos, ShowCmd, ShowMsg, FilmState } from '@/lib/showLink';

type Send = (kind: string, data?: any, pid?: string) => any;
const dirName = (s: SessionState, id: string) => s.revealed?.samples[id]?.name || DIRECTIONS.find((d) => d.id === id)?.label || id;

export default function PresenterApp({ code }: { code: string }) {
  const { state: s, events, send, sendMany, status } = useSession(code, { admin: true, interval: 600 });
  const [pos, setPos] = useState<ShowPos | null>(null);
  const [seen, setSeen] = useState(0);
  const [now, setNow] = useState(0); // set after the first render, so the server's clock never meets the laptop's
  const [chan, setChan] = useState<BroadcastChannel | null>(null);

  // Ask the presentation where it is once; after that it sends a heartbeat. Silence for a few seconds means its window
  // closed (or is stuck): the dot turns amber, and the buttons stay live in case it's only a moment.
  useEffect(() => {
    const ch = showChannel(code); setChan(ch); if (!ch) return;
    ch.onmessage = (m) => { const x = m.data as ShowMsg; if (x.t === 'pos') { setPos(x.pos); setSeen(Date.now()); } };
    const hello = () => ch.postMessage({ t: 'hello' } satisfies ShowMsg);
    hello(); const iv = setInterval(hello, 4000);
    return () => { clearInterval(iv); ch.close(); };
  }, [code]);
  useEffect(() => { setNow(Date.now()); const iv = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(iv); }, []);
  const linked = !!pos && now - seen < 7000;
  const off = !pos; // never heard from the presentation: nothing to move yet
  const cmd = useCallback((c: ShowCmd) => chan?.postMessage({ t: 'cmd', cmd: c } satisfies ShowMsg), [chan]);
  const onFilm = useRef(false);

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('input, textarea, select')) return;
      if (e.key === ' ' && el.closest('button')) return; // a button reached with Tab: Space presses it, nothing else
      // On the film, as in the presentation: Space or K pauses and plays, R starts it again.
      if (onFilm.current && [' ', 'k', 'K', 'r', 'R'].includes(e.key)) { e.preventDefault(); cmd({ c: 'film', a: /r/i.test(e.key) ? 'restart' : 'toggle' }); return; }
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); cmd({ c: 'go', d: 1 }); }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); cmd({ c: 'go', d: -1 }); }
      else if (e.key === ']') cmd({ c: 'jump', d: 1 });
      else if (e.key === '[') cmd({ c: 'jump', d: -1 });
      else if (e.key === 's' || e.key === 'S') cmd({ c: 'short' });
      else if (e.key === 'b' || e.key === 'B') cmd({ c: 'blank' });
      else if (e.key === 'End') cmd({ c: 'goto', i: SCENES.length - 1 });
    };
    addEventListener('keydown', kd); return () => removeEventListener('keydown', kd);
  }, [cmd]);

  // Without the presentation open, the session still says where the room is.
  const i = pos?.i ?? s.scene, step = pos?.step ?? s.step;
  const sc = SCENES[Math.min(i, SCENES.length - 1)];
  onFilm.current = linked && sc.id === 'film';
  const tm = now ? runTiming(sc.block, new Date(now)) : null;
  const joined = people(s).filter((p) => !p.paper).length;
  const room = sc.id === 'signals' ? <HandVotes s={s} events={events} send={send} k="signals" title="Hand votes: the three trends" items={SIGNALS.map((x) => ({ id: x.id, label: x.title.replace(/\.$/, '') }))} value={(id) => [id]} />
    : sc.id === 'nextround' ? <HandVotes s={s} events={events} send={send} k="directions" title="Hand chips: what deserves the next round" how="Each person without a phone has five chips too, and can stack them. Ask where their five go and add one per chip." items={DIRECTIONS.map((d) => ({ id: d.id, label: dirName(s, d.id), sub: d.sub }))} value={(id) => ({ [id]: 1 })} />
    : sc.id === 'tasting' ? <PaperCount s={s} send={send} code={code} step={step} />
    : sc.id === 'concepts' ? <ConceptEditor s={s} send={send} />
    : sc.id === 'board' || sc.id === 'playbook' ? <PlanEditor s={s} send={send} />
    : sc.id === 'map' ? <Profiles step={step} off={off} cmd={cmd} i={i} short={!!pos?.short} />
    : sc.id === 'film' ? <FilmPanel f={linked ? pos?.film : undefined} now={now} cmd={cmd} next={pos?.next || ''} prev={pos?.prev || ''} />
    : <Joined s={s} code={code} />;

  return (
    // A click never leaves a button focused, so Space and the arrows keep moving the presentation instead of pressing
    // the last button again (an extra hand vote, say).
    <main className="pv" data-theme="b" onMouseDown={(e) => { if ((e.target as HTMLElement).closest('button')) e.preventDefault(); }}>
      <header className="pv-bar">
        <div className={'pv-link' + (linked ? ' ok' : pos ? ' stale' : '')}><i />{linked ? `Slide ${pos!.at} of ${pos!.total}` : pos ? 'The presentation isn’t answering' : 'Not linked to the presentation'}</div>
        <div className="pv-clock"><b className="num">{now ? etClock(new Date(now)) : ''}</b><span>Eastern</span></div>
        {tm && <div className={'pv-run' + (tm.over ? ' over' : '')}>This part {tm.from} to {tm.to}{SLIDE_MIN[sc.id] ? <span className="pv-slide"> · this slide {SLIDE_TIMES[sc.id].from} to {SLIDE_TIMES[sc.id].to}</span> : null}{tm.over ? <b>{tm.over} min over</b> : null}</div>}
        <div className="pv-flags">
          {pos?.short && <span className="pv-flag">Short version</span>}
          {pos?.blank && <span className="pv-flag warn">TV is blank</span>}
          {code !== EVENT.code && <span className="pv-flag rehearse">Rehearsal {code}</span>}
          <span className={'pv-net' + (status.online ? '' : ' bad')}>{status.online ? `${joined} ${joined === 1 ? 'phone' : 'phones'} joined` : 'Reconnecting'}</span>
        </div>
      </header>

      {!linked && (
        <p className="pv-alert" role="status">This window moves the presentation only when both are open in this browser. Open the presentation from the team page (Present on the day), then press P there. Hand votes and paper cards still go in from here.</p>
      )}

      <div className={'pv-main' + (['concepts', 'board', 'playbook'].includes(sc.id) ? ' wide' : '')}>
        <section className="pv-now" aria-live="polite">
          <h1>{titleOf(sc)}</h1>
          {sc.builds > 0 && <p className="pv-build">Build {step} of {sc.builds}</p>}
          <ul className="pv-points">{pointsOf(sc).map((x, j) => <li key={j}>{x}</li>)}</ul>
          {pos?.next && <p className="pv-next">Next: <b>{pos.next}</b></p>}
          {sc.id === 'map' && <button className="pv-skipfilm" disabled={off} onClick={() => cmd({ c: 'goto', i: SCENES.findIndex((x) => x.id === 'tasting') })}>Running late: skip the film, go to the tasting</button>}
        </section>
        <aside className="pv-room">{room}</aside>
      </div>

      <footer className="pv-ctl">
        <button disabled={off} onClick={() => cmd({ c: 'go', d: -1 })}><Icon d="M10 3 5 8l5 5" />Back</button>
        <button disabled={off} className="primary" onClick={() => cmd({ c: 'go', d: 1 })}>{(pos ? pos.build : step < sc.builds) ? 'Next build' : 'Next slide'}<Icon d="m6 3 5 5-5 5" /></button>
        <button disabled={off} onClick={() => cmd({ c: 'jump', d: -1 })}>Previous part</button>
        <button disabled={off} onClick={() => cmd({ c: 'jump', d: 1 })}>Next part</button>
        <label className="pv-goto"><span>Go to</span>
          <select disabled={off} value={i} onChange={(e) => cmd({ c: 'goto', i: Number(e.target.value) })}>
            {SCENES.map((x, j) => { const empty = x.id === 'prework' && pos?.told === false; return <option key={x.id} value={j} disabled={empty}>{j + 1}. {titleOf(x)}{x.optional ? ' (optional)' : ''}{empty ? ' (skipped: no answers yet)' : ''}</option>; })}
          </select>
        </label>
        <button disabled={off} aria-pressed={!!pos?.short} onClick={() => cmd({ c: 'short' })}>Short version</button>
        <button disabled={off} aria-pressed={!!pos?.blank} onClick={() => cmd({ c: 'blank' })}>Blank the TV</button>
      </footer>
    </main>
  );
}

function Icon({ d }: { d: string }) {
  return <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

// One row per option: the count so far, and buttons to add a vote for someone without a phone or take the latest
// one back. A hand vote is a pick from a one-off id (hand-...), so taking it back removes exactly that one.
const counts = (v: any, id: string) => (Array.isArray(v) ? v.includes(id) : !!v && typeof v === 'object' && Number(v[id]) > 0);
function HandVotes({ s, events, send, k, title, items, value, how }: { s: SessionState; events: Ev[]; send: Send; k: string; title: string; items: { id: string; label: string; sub?: string }[]; value: (id: string) => any; how?: string }) {
  const t = tallyPick(s, k), c = voteCounts(s, k);
  const picks = s.votes[k]?.picks || {};
  const handFor = (id: string) => Object.entries(picks).filter(([pid, v]) => byHand(pid) && counts(v, id)).length;
  const add = (id: string) => send('pick', { key: k, value: value(id), paper: true }, 'hand-' + uid());
  const undo = (id: string) => {
    const e = [...events].reverse().find((x) => x.kind === 'pick' && x.pid && byHand(x.pid) && x.data?.key === k && picks[x.pid] && counts(x.data.value, id));
    if (e) send('unpick', { key: k }, e.pid);
  };
  return (
    <>
      <h2>{title}</h2>
      <p className="pv-sub">{c.phones} on phones · {c.hand} by hand. {how || 'Add one for each person voting by show of hands.'}</p>
      <ul className="pv-votes">
        {items.map((x) => {
          const h = handFor(x.id);
          return (
            <li key={x.id}>
              <span className="pv-vname">{x.label}{x.sub && <small>{x.sub}</small>}</span>
              <b className="num">{t[x.id] || 0}</b>
              <span className="pv-vhand">{h ? `${h} by hand` : ''}</span>
              <button className="pv-round" disabled={!h} aria-label={`Take back a hand vote for ${x.label}`} onClick={() => undo(x.id)}><Icon d="M3.5 8h9" /></button>
              <button className="pv-round add" aria-label={`Add a hand vote for ${x.label}`} onClick={() => add(x.id)}><Icon d="M3.5 8h9M8 3.5v9" /></button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

// Paper scorecards on the day: count each card as it's handed in, with +1 (and -1 for a mistake). The cards themselves
// are typed in after the morning, on /host/cards, and their scores join the results and the write-up from there.
// Once the scores have been on the TV, scoring stays closed even back on the blind build; Reopen scoring (on the blind
// build, asked twice) is the one way to open it again, for someone who genuinely hadn't finished.
function PaperCount({ s, send, code, step }: { s: SessionState; send: Send; code: string; step: number }) {
  const [reopening, setReopening] = useState(false);
  const t = s.votes.tasting;
  const who = tasters(s);
  const n = s.paperCards || 0;
  const prog = tastingProgress(s, SAMPLES.map((x) => x.code));
  return (
    <>
      <h2>Who has finished</h2>
      <p className="pv-sub"><b className="num">{prog.done}</b> of {prog.phones} {prog.phones === 1 ? 'phone has' : 'phones have'} scored all four. {SAMPLES.map((x) => `${x.code} ${prog.per[x.code]}`).join(' · ')}.</p>
      <p className="pv-sub">The TV shows only these counts until the next build, which puts the scores up and closes scoring on the phones. If anyone is still scoring, the first press says so and a second press goes on.</p>
      <h2>Paper scorecards</h2>
      <p className="pv-sub">{who.phones} scored on phones. Tap +1 for each paper card handed in. You type them in after the morning, so nothing to type now.</p>
      <div className="pv-paper">
        <button className="pv-round" disabled={!n} aria-label="Take back one paper card" onClick={() => send('papercard', { d: -1 })}><Icon d="M3.5 8h9" /></button>
        <b className="num">{n}</b><span>{n === 1 ? 'paper card' : 'paper cards'}</span>
        <button className="primary" onClick={() => send('papercard', { d: 1 })}><Icon d="M3.5 8h9M8 3.5v9" />+1 paper card</button>
      </div>
      {who.cards > 0 && <p className="pv-sub">{who.cards} already typed in.</p>}
      {t?.locked && (
        <>
          <h2>Scoring is closed</h2>
          <p className="pv-sub">{t.revealed ? 'The scores have been on the TV, so going back to the blind build doesn’t reopen scoring on the phones.' : 'Scoring closed when we moved past the tasting.'}{step >= 1 ? ' To let someone finish, go back to the blind build first.' : ''}</p>
          {step === 0 && (reopening
            ? <span className="pv-confirm">Reopen scoring on the phones? <button onClick={() => { send('vote', { key: 'tasting', action: 'open' }); setReopening(false); }}>Reopen</button><button onClick={() => setReopening(false)}>Keep it closed</button></span>
            : <button onClick={() => setReopening(true)}>Reopen scoring</button>)}
        </>
      )}
      <p className="pv-sub">After the morning: <a href={`/host/cards${code === EVENT.code ? '' : `?code=${code}`}`} target="_blank" rel="noreferrer">type in the paper cards</a>.</p>
    </>
  );
}

// Now, Next, Later from the laptop: the same board as the TV, and the selected line's fields to tap.
function PlanEditor({ s, send }: { s: SessionState; send: Send }) {
  return (
    <>
      <h2>Now, Next, Later</h2>
      <p className="pv-sub">Place it when the group agrees: tap a concept or direction, then Now, Next or Later. More ideas holds the rest. Tap a line to fill in its fields, move it or take it back. Nothing to type.</p>
      <PlanTap s={s} send={send} edit />
    </>
  );
}

// THE FLAVOR RACE from the laptop: how far in it is, and play, pause, start again, skip on or go back. The clock runs
// here between the presentation's heartbeats.
const mmss = (x: number) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
function FilmPanel({ f, now, cmd, next, prev }: { f?: FilmState; now: number; cmd: (c: ShowCmd) => void; next: string; prev: string }) {
  const t = !f ? 0 : f.playing ? Math.min(f.d || Infinity, f.t + Math.max(0, now - f.ts) / 1000) : f.t;
  const state = !f ? 'Waiting for the presentation' : f.ended ? 'Finished. The closing card is on the TV.' : f.muted && f.playing ? 'Playing without sound. Click the picture on the TV once, or press Sound on.' : f.playing ? 'Playing' : t > 0 ? 'Paused' : 'Ready';
  return (
    <>
      <h2>THE FLAVOR RACE</h2>
      <p className="pv-sub" role="status">{state}</p>
      <div className="pv-film">
        <b className="num">{mmss(t)}</b><span>of {f?.d ? mmss(f.d) : '2:23'}</span>
        <div className="pv-filmbar" aria-hidden="true"><i style={{ width: `${f?.d ? Math.min(100, (t / f.d) * 100) : 0}%` }} /></div>
      </div>
      <div className="pv-filmctl">
        <button className="primary" disabled={!f} onClick={() => cmd({ c: 'film', a: 'toggle' })}>{f?.ended ? 'Play again' : f?.playing ? 'Pause' : 'Play'}</button>
        <button disabled={!f} onClick={() => cmd({ c: 'film', a: 'restart' })}>Start again</button>
        {f?.muted && <button disabled={!f} onClick={() => cmd({ c: 'film', a: 'sound' })}>Sound on</button>}
      </div>
      <div className="pv-filmctl">
        {next && <button disabled={!f} onClick={() => cmd({ c: 'go', d: 1 })}>Skip to {next}</button>}
        {prev && <button disabled={!f} onClick={() => cmd({ c: 'go', d: -1 })}>Back to {prev}</button>}
      </div>
      <p className="pv-sub">Running late? Skip the film and start the tasting. Nothing is decided on it.</p>
      <p className="pv-sub">Keys here or on the presentation: Space or K to pause and play, R to start again, the arrows to move on or back.</p>
    </>
  );
}

// The four directions: open any profile card on the TV, or go back to the map. The short version skips the two that
// aren't in the tasting when stepping through, but any card can still be opened here.
// The directions with samples in today's tasting; the other two are discussed and on the chips, but not tasted.
const TASTED = [...new Set(SAMPLES.map((x) => x.territory))];
function Profiles({ step, off, cmd, i, short }: { step: number; off: boolean; cmd: (c: ShowCmd) => void; i: number; short: boolean }) {
  const skipped = SCENES[i]?.skip || [];
  return (
    <>
      <h2>Profile cards</h2>
      <p className="pv-sub">Open a direction’s card on the TV, or click it on the TV itself. The arrows step through all four. The two not in the tasting get a short, fair explanation even in the short version: the room can put chips on them.</p>
      <ul className="pv-profiles">
        <li><button disabled={off} aria-pressed={step === 0} onClick={() => cmd({ c: 'goto', i, step: 0 })}>The map, all four</button></li>
        {TERRITORIES.map((t) => (
          <li key={t.id}><button disabled={off} aria-pressed={step === t.n} onClick={() => cmd({ c: 'goto', i, step: t.n })}>{t.n}. {t.name}{skipped.includes(t.n) ? <small>Optional</small> : <small>{TASTED.includes(t.id) ? 'In the tasting' : 'Not tasted, on the chips'}</small>}</button></li>
        ))}
      </ul>
    </>
  );
}

// Everywhere else: who's in the room on a phone.
function Joined({ s, code }: { s: SessionState; code: string }) {
  const list = people(s).filter((p) => !p.paper);
  const own = Object.keys(s.survey || {}).length;
  // A rehearsal counts the live answers it shows on "Your pre-brief answers" (read only).
  const live = Object.keys(useLiveSurvey(code, own === 0)).length;
  const pre = own || live;
  return (
    <>
      <h2>In the room</h2>
      <p className="pv-sub">{list.length} {list.length === 1 ? 'phone' : 'phones'} joined · {pre} pre-brief {pre === 1 ? 'answer' : 'answers'}{!own && live ? ' (from the live session)' : ''}. Hand votes go in here on the vote slides, and paper cards are counted on the tasting.</p>
      {list.length > 0 ? <ul className="pv-people">{list.map((p) => <li key={p.pid}>{p.name}</li>)}</ul> : <p className="pv-empty">Nobody has joined yet. The code is on the arrival screen.</p>}
    </>
  );
}
