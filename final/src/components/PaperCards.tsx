'use client';
// Paper scorecards, typed in after the morning (/host/cards): the same questions as /scorecard and the phones. A card is
// one pid (paper-...) across the samples it scored, so removing it takes back exactly that card. On the day the
// presenter view only counts the cards as they're handed in; their scores join the heat map, the results page and the
// write-up as soon as each one is saved here.
import { useMemo, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { EVENT, SAMPLES, MYSTERY, CRITERIA, JAR, JAR_OPTS } from '@/lib/content';
import { tasters, onPaper, uid, Ev, SessionState } from '@/lib/state';

function Icon({ d }: { d: string }) {
  return <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

// The page: which session, how many cards were counted on the day and how many are in, then the form.
export default function PaperCardsPage({ code }: { code: string }) {
  const { state: s, events, sendMany, status } = useSession(code, { admin: true, interval: 1500 });
  const counted = s.paperCards || 0, typed = tasters(s).cards;
  return (
    <main className="pv pv-cards" data-theme="b">
      <header className="pv-bar">
        <div className="pv-link ok"><i />Paper scorecards, after the morning</div>
        <div className="pv-flags">{code !== EVENT.code && <span className="pv-flag rehearse">Rehearsal {code}</span>}<span className={'pv-net' + (status.online ? '' : ' bad')}>{status.online ? 'Saved to the session' : 'Reconnecting'}</span></div>
      </header>
      <section className="pv-now">
        <h1>Type in the paper cards</h1>
        <p className="pv-sub">{counted ? `${counted} ${counted === 1 ? 'card was' : 'cards were'} counted on the day. ${typed} typed in so far.` : `${typed} typed in so far.`} Each one joins the scores, the results page and the write-up as soon as it’s saved.</p>
        <PaperCards s={s} events={events} sendMany={sendMany} />
      </section>
    </main>
  );
}

// Paper scorecards, typed in from the card (the same questions as /scorecard and the phones). A card is one pid
// (paper-...) across the samples it scored, so removing it takes back exactly that card.
type Row = { appeal: number; feels: number; newness: number; sweet: string; cool: string; word: string; fruitGuess: string };
const blankRow = (): Row => ({ appeal: 0, feels: 0, newness: 0, sweet: '', cool: '', word: '', fruitGuess: '' });
const blankCard = () => Object.fromEntries(SAMPLES.map((x) => [x.code, blankRow()])) as Record<string, Row>;
export function PaperCards({ s, events, sendMany }: { s: SessionState; events: Ev[]; sendMany: (evs: { kind: string; data?: any; pid?: string }[]) => void }) {
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
    sendMany(full.map(({ code, r }) => ({ kind: 'rate', pid, data: { sample: code, appeal: r.appeal, feels: r.feels, newness: r.newness, sweet: r.sweet || undefined, cool: r.cool || undefined, word: r.word.trim().split(/\s+/)[0] || undefined, fruitGuess: r.fruitGuess.trim() || undefined, card: name.trim().slice(0, 40) || undefined } })));
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
                {JAR.map((j) => (
                  <div key={j.key} className="pv-chips" role="group" aria-label={`${x.code}: ${j.l}`}>
                    <span>{j.l}</span>
                    <div>{JAR_OPTS.map((o) => <button type="button" key={o} aria-pressed={r[j.key] === o} onClick={() => set(x.code, { [j.key]: r[j.key] === o ? '' : o })}>{o}</button>)}</div>
                  </div>
                ))}
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

