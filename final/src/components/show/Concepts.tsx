'use client';
// Concepts on November 9, with nothing to type. When the concept slide opens on a session with no concepts yet, the
// presentation starts up to three cards from the top three of the chips vote: where it starts is the pick, the rest
// comes from its starter card in conceptLibrary.ts, and When takes the first moment marked for it on Where TheraBreath
// fits in a day. Only the places the vote settled start a card: a tie at the cutoff (two tied for third) leaves the
// card open, the TV names the tied ideas, and the presenter starts it from the room's pick. In the presenter view any
// card can be swapped for another library card, and any field changed by tapping an option. The TV only shows the
// cards. Every card is a starting point for discussion until the presenter marks it agreed; changing a field on an
// agreed card takes the agreement off until the room says yes again. The read-back and the write-up say which cards
// the room agreed.
import React, { useState } from 'react';
import { STARTS, CONCEPT_FIELDS, LIBRARY, Card, cardFor, MOMENT_WHEN, toggleIn, hasOpt } from '@/lib/conceptLibrary';
import { tallyPick, shortlist, SessionState, tasteSummary, jarAll } from '@/lib/state';
import { JAR, JAR_OPTS } from '@/lib/content';
import { teamConcepts } from '../scenes/CoCreate';

type Send = (kind: string, data?: any, pid?: string) => any;
export const SLOTS = [1, 2, 3];
// A start's name on screen: a sample by its revealed name (its letter until then), a direction by its own.
export const startName = (id: string, s?: SessionState | null) => s?.revealed?.samples[id]?.name || STARTS.find((x) => x.id === id)?.label || id;
export const startLabel = (id: string, s?: SessionState | null) => {
  const st = STARTS.find((x) => x.id === id); if (!st) return id;
  const n = startName(id, s);
  return st.kind === 'sample' && n !== st.label ? `${n} (Sample ${st.id})` : n;
};
export const cardTitle = (c: Card, s?: SessionState | null) => c.title || startName(c.start, s);

// A concept's fields from a library card, with When from the day map's marks when there is one. A new or swapped card
// starts unagreed, with the next version still to agree.
export function fromCard(c: Card, s: SessionState, start = c.start) {
  const mark = (s.marks || []).map((m) => m.split('|')).find(([id]) => id === start);
  return {
    name: c.title || startName(start, s), why: startLabel(start, s), start, card: c.id,
    segment: c.segment, occasion: (mark && MOMENT_WHEN[mark[1]]) || c.occasion, role: c.role, format: c.format, incremental: c.incremental,
    change: '', agreed: '',
  };
}
// What the tasting said about a sample's sweetness and cooling, for the presenter deciding the next version.
export function tastingRead(start: string, s: SessionState) {
  const st = STARTS.find((x) => x.id === start); if (st?.kind !== 'sample') return '';
  const sum = tasteSummary(s, st.id);
  return JAR.map((j) => { const v = jarAll(sum[j.key], JAR_OPTS); return v ? `${j.l}: ${v}` : ''; }).filter(Boolean).join('. ');
}
// The cards the concept slide starts with: one for each place the chips vote settled in the top three. A tie at the
// cutoff isn't broken by the order of a list: those cards wait for the room.
export function starters(s: SessionState) {
  return shortlist(tallyPick(s, 'directions')).sure.map((id) => { const c = cardFor(id); return c ? fromCard(c, s, id) : null; }).filter(Boolean) as ReturnType<typeof fromCard>[];
}
// A tie at the cutoff the room still has to settle: the tied ideas no card has started from yet, and how many seats are
// left for them.
export function openTie(s: SessionState) {
  const sl = shortlist(tallyPick(s, 'directions'));
  const used = SLOTS.map((n) => conceptAt(s, n)?.start).filter(Boolean);
  const left = sl.tied.filter((id) => !used.includes(id));
  const free = SLOTS.filter((n) => !conceptAt(s, n)).length;
  return left.length && free ? { ids: left, t: tallyPick(s, 'directions') } : null;
}
const orList = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} or ${xs[xs.length - 1]}`);
export const conceptAt = (s: SessionState, slot: number) => { const c: any = s.concepts[`t${slot}-1`]; return c && c.name ? c : null; };

// The TV: up to three cards, read-only. Each says whether the room has agreed it yet.
export function ConceptCards({ s }: { s: SessionState }) {
  const cs = SLOTS.map((n) => conceptAt(s, n));
  const tie = openTie(s), firstOpen = cs.findIndex((c) => !c);
  return (
    <div className="ccv-grid">
      {cs.map((c, i) => (
        <div key={i} className={'cv-card ccv-card ccv-show' + (c ? ' named' : ' empty') + (c?.agreed ? ' agreed' : '')} style={{ ['--i' as any]: 2 + i }}>
          <div className="ccv-head">
            <span className="k">Concept {i + 1}</span>
            {c && <span className="ccv-state">{c.agreed ? 'Agreed' : 'Starting point for discussion'}</span>}
          </div>
          {c ? (
            <>
              <b className="ccv-name">{c.name}</b>
              {c.why && <span className="ccv-from">Starts from {c.why}</span>}
              <dl>{CONCEPT_FIELDS.filter((f) => f.key !== 'why').map((f) => <div key={f.key} className={(c[f.key] ? 'on' : '') + (f.key === 'change' ? ' ccv-next' : '')}><dt>{f.l}</dt><dd>{c[f.key] || 'To agree'}</dd></div>)}</dl>
            </>
          ) : <p className="ccv-none">{tie && i === firstOpen ? `Tied in the chips: ${orList(tie.ids.map((id) => startName(id, s)))}. The room picks which goes on.` : i === 0 && !cs.some(Boolean) ? 'The top three from the chips vote start the cards. More come from our library.' : 'Open'}</p>}
        </div>
      ))}
    </div>
  );
}

// The presenter view: one card at a time. Swap it for a library card, or tap any field's option to change it.
export function ConceptEditor({ s, send }: { s: SessionState; send: Send }) {
  const [slot, setSlot] = useState(1);
  const [swap, setSwap] = useState(false);
  const [clearing, setClearing] = useState(false); // clearing a card asks once
  const [reagree, setReagree] = useState(false); // an agreed card was changed, so it needs the room's yes again
  const c = conceptAt(s, slot);
  const tie = openTie(s);
  const set = (fields: Record<string, string>) => send('concept', { team: slot, slot: 1, fields });
  // A change to an agreed card takes the agreement off: the room agreed the card as it was, not as it is now.
  const edit = (fields: Record<string, string>) => { if (c?.agreed) { setReagree(true); set({ ...fields, agreed: '' }); } else set(fields); };
  const use = (card: Card) => { set(fromCard(card, s)); setSwap(false); };
  const setStart = (id: string) => {
    // The name follows the start while it's still the start's own name.
    const auto = !c || c.name === startName(c.start || '', s) || c.name === c.why;
    edit({ start: id, why: startLabel(id, s), ...(auto ? { name: startName(id, s) } : {}) });
  };
  const library = (
    <ul className="pv-lib">
      {LIBRARY.map((card) => (
        <li key={card.id}><button type="button" aria-pressed={c?.card === card.id} onClick={() => use(card)}>
          <span>{cardTitle(card, s)}<small>{startLabel(card.start, s)} · {card.segment}</small></span>
          {card.status === 'DRAFT' && <em className="pv-draft">Draft</em>}
        </button></li>
      ))}
    </ul>
  );
  return (
    <>
      <h2>Concepts</h2>
      <p className="pv-sub">Starter cards: every field is a proposal until the room agrees it. One or two well-defined cards beat three thin ones. Tap to change anything; nothing to type. {teamConcepts(s).length ? '' : 'The cards start from the top three chips when the slide opens; a tie at the cutoff waits for the room’s pick.'}</p>
      <div className="pv-tabs" role="tablist">
        {SLOTS.map((n) => { const x = conceptAt(s, n); return <button key={n} role="tab" aria-selected={slot === n} aria-pressed={slot === n} onClick={() => { setSlot(n); setSwap(false); setClearing(false); setReagree(false); }}>{n}. {x ? x.name : 'Open'}</button>; })}
      </div>
      {!c ? (
        <section className="pv-concept">
          {tie && (
            <div className="pv-tie">
              <h3>Tied in the chips: ask the room which goes on, then start this card from its pick.</h3>
              <div className="pt-group" role="group" aria-label="Tied in the chips"><span>Tied</span>
                <div>{tie.ids.map((id) => { const card = cardFor(id); return card ? <button key={id} type="button" onClick={() => use(card)}>{startLabel(id, s)} · {tie.t[id]} {tie.t[id] === 1 ? 'chip' : 'chips'}</button> : null; })}</div>
              </div>
              <p className="pv-sub">The chip totals stay as voted. The one the room leaves out can still go in Later on the board.</p>
            </div>
          )}
          <h3>Concept {slot} is open. Start it from a library card:</h3>
          {library}
        </section>
      ) : (
        <section className="pv-concept">
          <div className="pv-chead">
            <h3>{c.name}</h3>
            <button className={'pv-agree' + (c.agreed ? ' on' : '')} aria-pressed={!!c.agreed} onClick={() => { setReagree(false); set({ agreed: c.agreed ? '' : '1' }); }}>{c.agreed ? 'Agreed by the room' : 'Mark as agreed'}</button>
            <button onClick={() => setSwap((v) => !v)} aria-pressed={swap}>Swap for a library card</button>
            {clearing
              ? <span className="pv-confirm">Clear this card? <button onClick={() => { set({ name: '' }); setClearing(false); }}>Clear</button><button onClick={() => setClearing(false)}>Keep</button></span>
              : <button onClick={() => setClearing(true)}>Clear this card</button>}
          </div>
          {reagree && !c.agreed && <p className="pv-sub pv-reagree" role="status">Changed after the room agreed it, so it’s a proposal again. Read the card back, then mark it agreed.</p>}
          {swap ? library : (
            <>
              <div className="pt-group" role="group" aria-label="Where it starts">
                <span>Where it starts</span>
                <div>{STARTS.map((x) => <button key={x.id} type="button" aria-pressed={c.start === x.id} onClick={() => setStart(x.id)}>{startLabel(x.id, s)}</button>)}</div>
              </div>
              {CONCEPT_FIELDS.filter((f) => f.opts).map((f) => (
                <div key={f.key} className="pt-group" role="group" aria-label={f.l}>
                  <span>{f.l}{f.multi ? <small> (one or more)</small> : null}</span>
                  <div>
                    {f.opts!.map((o) => f.multi
                      ? <button key={o} type="button" aria-pressed={hasOpt(c[f.key], o)} onClick={() => edit({ [f.key]: toggleIn(c[f.key], o) })}>{o}</button>
                      : <button key={o} type="button" aria-pressed={c[f.key] === o} onClick={() => edit({ [f.key]: c[f.key] === o ? '' : o })}>{o}</button>)}
                    {f.key === 'change' && tastingRead(c.start, s) && <p className="pv-taste">From the tasting. {tastingRead(c.start, s)}.</p>}
                  </div>
                </div>
              ))}
              <p className="pv-sub">An answer that isn’t here: tap Other, in the notes, write it on the notes sheet and read it back before moving on.</p>
            </>
          )}
        </section>
      )}
    </>
  );
}
