'use client';
// The presenter view (/host/presenter): the laptop's own screen while the presentation is full screen on the TV. P in
// the presentation opens it. It shows the talking points, where we are, Eastern time against the run of show and the
// short-version state, and it moves the presentation (over showLink.ts, so both windows must be in the same browser).
// It is also where hand votes and paper scorecards go in for anyone without a phone, and where a mistaken one comes
// back out. Nothing here is on the TV.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { SCENES } from '@/lib/scenes';
import { EVENT, SIGNALS, DIRECTIONS, SAMPLES, WHO_CHIPS, MYSTERY, HORIZONS, CRITERIA, DEVELOP, PRIMARY_TERRITORIES as TERRITORIES } from '@/lib/content';
import { tallyPick, voteCounts, tasters, byHand, onPaper, people, uid, Ev, SessionState } from '@/lib/state';
import { candidates } from './scenes/Build';
import { Synced, PLAN_COLS, PlanLists, RemoveRow, planActions } from './show/Plan';
import { runTiming, etClock } from '@/lib/time';
import { showChannel, ShowPos, ShowCmd, ShowMsg } from '@/lib/showLink';

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

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('input, textarea, select')) return;
      if (e.key === ' ' && el.closest('button')) return; // a button reached with Tab: Space presses it, nothing else
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); cmd({ c: 'go', d: 1 }); }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); cmd({ c: 'go', d: -1 }); }
      else if (e.key === ']') cmd({ c: 'jump', d: 1 });
      else if (e.key === '[') cmd({ c: 'jump', d: -1 });
      else if (e.key === 's' || e.key === 'S') cmd({ c: 'short' });
      else if (e.key === 'b' || e.key === 'B') cmd({ c: 'blank' });
    };
    addEventListener('keydown', kd); return () => removeEventListener('keydown', kd);
  }, [cmd]);

  // Without the presentation open, the session still says where the room is.
  const i = pos?.i ?? s.scene, step = pos?.step ?? s.step;
  const sc = SCENES[Math.min(i, SCENES.length - 1)];
  const tm = now ? runTiming(sc.block, new Date(now)) : null;
  const joined = people(s).filter((p) => !p.paper).length;
  const room = sc.id === 'signalvote' ? <HandVotes s={s} events={events} send={send} k="signals" title="Hand votes: the three trends" items={SIGNALS.map((x) => ({ id: x.id, label: x.title.replace(/\.$/, '') }))} value={(id) => [id]} />
    : sc.id === 'nextround' ? <HandVotes s={s} events={events} send={send} k="directions" title="Hand votes: chips for a next round" items={DIRECTIONS.map((d) => ({ id: d.id, label: dirName(s, d.id), sub: d.sub }))} value={(id) => ({ [id]: 1 })} />
    : sc.id === 'dots' ? <HandVotes s={s} events={events} send={send} k="concepts" title="Hand votes: dots for the ideas" items={candidates(s).map((x) => ({ id: x.id, label: x.name || 'Untitled concept', sub: x.sub }))} value={(id) => ({ [id]: 1 })} />
    : sc.id === 'tasting' || sc.id === 'matrix' ? <PaperCards s={s} events={events} sendMany={sendMany} />
    : sc.id === 'board' || sc.id === 'playbook' || sc.id === 'next' ? <PlanEditor s={s} send={send} />
    : <Joined s={s} />;

  return (
    // A click never leaves a button focused, so Space and the arrows keep moving the presentation instead of pressing
    // the last button again (an extra hand vote, say).
    <main className="pv" data-theme="b" onMouseDown={(e) => { if ((e.target as HTMLElement).closest('button')) e.preventDefault(); }}>
      <header className="pv-bar">
        <div className={'pv-link' + (linked ? ' ok' : pos ? ' stale' : '')}><i />{linked ? `Slide ${pos!.at} of ${pos!.total}` : pos ? 'The presentation isn’t answering' : 'Not linked to the presentation'}</div>
        <div className="pv-clock"><b className="num">{now ? etClock(new Date(now)) : ''}</b><span>Eastern</span></div>
        {tm && <div className={'pv-run' + (tm.over ? ' over' : '')}>This part {tm.from} to {tm.to}{tm.over ? <b>{tm.over} min over</b> : null}</div>}
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

      <div className={'pv-main' + (['tasting', 'matrix', 'board', 'playbook', 'next'].includes(sc.id) ? ' wide' : '')}>
        <section className="pv-now" aria-live="polite">
          <h1>{sc.title}</h1>
          {sc.builds > 0 && <p className="pv-build">Build {step} of {sc.builds}</p>}
          <ul className="pv-points">{sc.points.map((x, j) => <li key={j}>{x}</li>)}</ul>
          {pos?.next && <p className="pv-next">Next: <b>{pos.next}</b></p>}
        </section>
        <aside className="pv-room">{room}</aside>
      </div>

      <footer className="pv-ctl">
        <button disabled={off} onClick={() => cmd({ c: 'go', d: -1 })}><Icon d="M10 3 5 8l5 5" />Back</button>
        <button disabled={off} className="primary" onClick={() => cmd({ c: 'go', d: 1 })}>{step < sc.builds ? 'Next build' : 'Next slide'}<Icon d="m6 3 5 5-5 5" /></button>
        <button disabled={off} onClick={() => cmd({ c: 'jump', d: -1 })}>Previous part</button>
        <button disabled={off} onClick={() => cmd({ c: 'jump', d: 1 })}>Next part</button>
        <label className="pv-goto"><span>Go to</span>
          <select disabled={off} value={i} onChange={(e) => cmd({ c: 'goto', i: Number(e.target.value) })}>
            {SCENES.map((x, j) => <option key={x.id} value={j}>{j + 1}. {x.title}{x.optional ? ' (optional)' : ''}</option>)}
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
function HandVotes({ s, events, send, k, title, items, value }: { s: SessionState; events: Ev[]; send: Send; k: string; title: string; items: { id: string; label: string; sub?: string }[]; value: (id: string) => any }) {
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
      <p className="pv-sub">{c.phones} on phones · {c.hand} by hand. Add one for each person voting by show of hands.</p>
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

// Paper scorecards, typed in from the card (the same questions as /scorecard and the phones). A card is one pid
// (paper-...) across the samples it scored, so removing it takes back exactly that card.
type Row = { appeal: number; feels: number; newness: number; who: string[]; guess: string; advance: string; word: string; fruitGuess: string };
const blankRow = (): Row => ({ appeal: 0, feels: 0, newness: 0, who: [], guess: '', advance: '', word: '', fruitGuess: '' });
const blankCard = () => Object.fromEntries(SAMPLES.map((x) => [x.code, blankRow()])) as Record<string, Row>;
function PaperCards({ s, events, sendMany }: { s: SessionState; events: Ev[]; sendMany: (evs: { kind: string; data?: any; pid?: string }[]) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [card, setCard] = useState(blankCard);
  const [err, setErr] = useState('');
  const [confirm, setConfirm] = useState('');
  const who = tasters(s);
  const cards = useMemo(() => {
    const order = events.filter((e) => e.kind === 'rate' && e.pid && onPaper(e.pid)).map((e) => e.pid!);
    return [...new Set(order)].map((pid) => {
      const done = SAMPLES.filter((x) => s.ratings[x.code]?.[pid]).map((x) => x.code);
      return { pid, done, name: SAMPLES.map((x) => s.ratings[x.code]?.[pid]?.card).find(Boolean) || '' };
    }).filter((c) => c.done.length);
  }, [events, s.ratings]);
  const set = (code: string, patch: Partial<Row>) => setCard((c) => ({ ...c, [code]: { ...c[code], ...patch } }));
  const save = () => {
    const rows = SAMPLES.map((x) => ({ code: x.code, r: card[x.code] }));
    const part = rows.filter(({ r }) => [r.appeal, r.feels, r.newness].some(Boolean) && ![r.appeal, r.feels, r.newness].every(Boolean));
    if (part.length) return setErr(`Sample ${part.map((x) => x.code).join(' and ')} needs all three scores, or none if the card left it blank.`);
    const full = rows.filter(({ r }) => r.appeal && r.feels && r.newness);
    if (!full.length) return setErr('Score at least one sample from the card.');
    const pid = 'paper-' + uid();
    sendMany(full.map(({ code, r }) => ({ kind: 'rate', pid, data: { sample: code, appeal: r.appeal, feels: r.feels, newness: r.newness, who: r.who, guess: r.guess || undefined, advance: r.advance || undefined, word: r.word.trim().split(/\s+/)[0] || undefined, fruitGuess: r.fruitGuess.trim() || undefined, card: name.trim().slice(0, 40) || undefined } })));
    setCard(blankCard()); setName(''); setErr(''); setOpen(false);
  };
  const remove = (pid: string, done: string[]) => { sendMany(done.map((code) => ({ kind: 'unrate', pid, data: { sample: code } }))); setConfirm(''); };

  return (
    <>
      <h2>Paper scorecards</h2>
      <p className="pv-sub">{who.phones} scored on phones · {cards.length} paper {cards.length === 1 ? 'card' : 'cards'} in. They count in the heat map as soon as they’re saved.</p>
      {cards.length > 0 && (
        <ul className="pv-cards">
          {cards.map((c, n) => (
            <li key={c.pid}>
              <span><b>{c.name || `Card ${n + 1}`}</b><small>Scored {c.done.join(', ')}</small></span>
              {confirm === c.pid
                ? <span className="pv-confirm">Remove this card? <button onClick={() => remove(c.pid, c.done)}>Remove</button><button onClick={() => setConfirm('')}>Keep</button></span>
                : <button onClick={() => setConfirm(c.pid)}>Remove</button>}
            </li>
          ))}
        </ul>
      )}
      {!open ? <button className="pv-add" onClick={() => setOpen(true)}><Icon d="M3.5 8h9M8 3.5v9" />Add a paper card</button> : (
        <form className="pv-card" onSubmit={(e) => { e.preventDefault(); save(); }}>
          <label className="pv-field"><span>Name on the card</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" maxLength={40} /></label>
          {SAMPLES.map((x) => {
            const r = card[x.code];
            return (
              <fieldset key={x.code} className="pv-sample">
                <legend><b>{x.code}</b>{s.revealed?.samples[x.code]?.name ? ` · ${s.revealed.samples[x.code].name}` : ''}<small>{x.base}</small></legend>
                {CRITERIA.map(({ key, l }) => (
                  <div key={key} className="pv-scale" role="group" aria-label={`${x.code}: ${l}`}>
                    <span>{l}</span>
                    <div>{[1, 2, 3, 4, 5].map((v) => <button type="button" key={v} aria-pressed={r[key] === v} onClick={() => set(x.code, { [key]: r[key] === v ? 0 : v })}>{v}</button>)}</div>
                  </div>
                ))}
                <div className="pv-chips" role="group" aria-label={`${x.code}: who would buy it`}>
                  <span>Who would buy it</span>
                  <div>{WHO_CHIPS.map((w) => <button type="button" key={w} aria-pressed={r.who.includes(w)} onClick={() => set(x.code, { who: r.who.includes(w) ? r.who.filter((y) => y !== w) : [...r.who, w] })}>{w}</button>)}</div>
                </div>
                <div className="pv-chips" role="group" aria-label={`${x.code}: which direction`}>
                  <span>Which direction</span>
                  <div>{TERRITORIES.map((t) => <button type="button" key={t.id} aria-pressed={r.guess === t.id} onClick={() => set(x.code, { guess: r.guess === t.id ? '' : t.id })}>{t.name}</button>)}</div>
                </div>
                <div className="pv-chips" role="group" aria-label={`${x.code}: would you develop it further`}>
                  <span>Develop further</span>
                  <div>{DEVELOP.opts.map((v) => <button type="button" key={v} aria-pressed={r.advance === v} onClick={() => set(x.code, { advance: r.advance === v ? '' : v })}>{v}</button>)}</div>
                </div>
                <div className="pv-words">
                  <label className="pv-field"><span>One word</span><input value={r.word} onChange={(e) => set(x.code, { word: e.target.value.slice(0, 24) })} /></label>
                  {x.code === MYSTERY && <label className="pv-field"><span>Fruits they tasted</span><input value={r.fruitGuess} onChange={(e) => set(x.code, { fruitGuess: e.target.value.slice(0, 160) })} /></label>}
                </div>
              </fieldset>
            );
          })}
          {err && <p className="pv-err" role="alert">{err}</p>}
          <div className="pv-formctl"><button type="submit" className="primary">Save this card</button><button type="button" onClick={() => { setOpen(false); setErr(''); }}>Cancel</button></div>
        </form>
      )}
    </>
  );
}

// Now, Next, Later from the laptop: the same rows the board shows on the TV, typed here instead.
function PlanEditor({ s, send }: { s: SessionState; send: Send }) {
  const act = planActions(send);
  const rows = Object.values(s.plan || {}).sort((a, b) => a.t - b.t);
  return (
    <>
      <h2>Now, Next, Later</h2>
      <p className="pv-sub">One line per direction, with its owners, base and next sample. It shows on the board, the Playbook and the last slides as you type.</p>
      {HORIZONS.map((h) => {
        const mine = rows.filter((r) => r.h === h.id);
        return (
          <section key={h.id} className="pv-plan">
            <h3>{h.label} <small>{h.when}</small></h3>
            {mine.map((r) => (
              <div key={r.id} className="pv-prow">
                <Synced className="pv-pwhat" value={r.what} commit={(v: string) => act.set(r.id, { what: v })} placeholder="Direction or concept" aria-label={`${h.label}: direction or concept`} />
                {PLAN_COLS.map((c) => <label key={c.f} className={'pv-field pv-p' + c.f}><span>{c.l}</span><Synced {...('date' in c ? { type: 'date' } : {})} list={'list' in c ? c.list : undefined} value={c.f === 'brief' ? r.brief || r.next || '' : (r as any)[c.f] || ''} commit={(v: string) => act.set(r.id, { [c.f]: v })} /></label>)}
                <label className="pv-field"><span>Move to</span><select value={r.h} onChange={(e) => act.move(r.id, e.target.value)}>{HORIZONS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
                <RemoveRow label={r.what || 'this line'} onRemove={() => act.remove(r.id)} className="pv-premove" />
              </div>
            ))}
            <button className="pv-padd" onClick={() => act.add(h.id)}>Add a line under {h.label}</button>
          </section>
        );
      })}
      <PlanLists />
    </>
  );
}

// Everywhere else: who's in the room on a phone.
function Joined({ s }: { s: SessionState }) {
  const list = people(s).filter((p) => !p.paper);
  const pre = Object.keys(s.survey || {}).length;
  return (
    <>
      <h2>In the room</h2>
      <p className="pv-sub">{list.length} {list.length === 1 ? 'phone' : 'phones'} joined · {pre} pre-brief {pre === 1 ? 'answer' : 'answers'}. Hand votes and paper cards go in here on the vote and tasting slides.</p>
      {list.length > 0 ? <ul className="pv-people">{list.map((p) => <li key={p.pid}>{p.name}</li>)}</ul> : <p className="pv-empty">Nobody has joined yet. The code is on the arrival screen.</p>}
    </>
  );
}
