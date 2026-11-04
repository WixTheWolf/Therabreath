'use client';
// Concepts on November 9, with nothing to type. When the concept slide opens on a session with no concepts yet, the
// presentation starts up to three cards from the top three of the chips vote: where it starts is the pick, the rest
// comes from its starter card in conceptLibrary.ts, and When takes the first moment marked for it on Where TheraBreath
// fits in a day. In the presenter view any card can be swapped for another library card, and any field changed by
// tapping an option. The TV only shows the cards.
import React, { useState } from 'react';
import { STARTS, CONCEPT_FIELDS, LIBRARY, Card, cardFor, MOMENT_WHEN } from '@/lib/conceptLibrary';
import { tallyPick, ranked, SessionState } from '@/lib/state';
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

// A concept's fields from a library card, with When from the day map's marks when there is one.
export function fromCard(c: Card, s: SessionState, start = c.start) {
  const mark = (s.marks || []).map((m) => m.split('|')).find(([id]) => id === start);
  return {
    name: c.title || startName(start, s), why: startLabel(start, s), start, card: c.id,
    segment: c.segment, occasion: (mark && MOMENT_WHEN[mark[1]]) || c.occasion, role: c.role, format: c.format, incremental: c.incremental,
  };
}
// The cards the concept slide starts with: one for each of the top three from the chips vote.
export function starters(s: SessionState) {
  const top = ranked(tallyPick(s, 'directions')).filter(([, n]) => n > 0).slice(0, 3).map(([id]) => id);
  return top.map((id) => { const c = cardFor(id); return c ? fromCard(c, s, id) : null; }).filter(Boolean) as ReturnType<typeof fromCard>[];
}
export const conceptAt = (s: SessionState, slot: number) => { const c: any = s.concepts[`t${slot}-1`]; return c && c.name ? c : null; };

// The TV: up to three cards, read-only.
export function ConceptCards({ s }: { s: SessionState }) {
  const cs = SLOTS.map((n) => conceptAt(s, n));
  return (
    <div className="ccv-grid">
      {cs.map((c, i) => (
        <div key={i} className={'cv-card ccv-card ccv-show' + (c ? ' named' : ' empty')} style={{ ['--i' as any]: 2 + i }}>
          <span className="k">Concept {i + 1}</span>
          {c ? (
            <>
              <b className="ccv-name">{c.name}</b>
              <dl>{CONCEPT_FIELDS.map((f) => <div key={f.key} className={c[f.key] ? 'on' : ''}><dt>{f.l}</dt><dd>{c[f.key] || 'To agree'}</dd></div>)}</dl>
            </>
          ) : <p className="ccv-none">{i === 0 && !cs.some(Boolean) ? 'The top three from the chips vote start the cards. More come from our library.' : 'Open'}</p>}
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
  const c = conceptAt(s, slot);
  const set = (fields: Record<string, string>) => send('concept', { team: slot, slot: 1, fields });
  const use = (card: Card) => { set(fromCard(card, s)); setSwap(false); };
  const setStart = (id: string) => {
    // The name follows the start while it's still the start's own name.
    const auto = !c || c.name === startName(c.start || '', s) || c.name === c.why;
    set({ start: id, why: startLabel(id, s), ...(auto ? { name: startName(id, s) } : {}) });
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
      <p className="pv-sub">Up to three. Tap to change anything; nothing to type. {teamConcepts(s).length ? '' : 'The cards start from the top three chips when the slide opens.'}</p>
      <div className="pv-tabs" role="tablist">
        {SLOTS.map((n) => { const x = conceptAt(s, n); return <button key={n} role="tab" aria-selected={slot === n} aria-pressed={slot === n} onClick={() => { setSlot(n); setSwap(false); setClearing(false); }}>{n}. {x ? x.name : 'Open'}</button>; })}
      </div>
      {!c ? (
        <section className="pv-concept">
          <h3>Concept {slot} is open. Start it from a library card:</h3>
          {library}
        </section>
      ) : (
        <section className="pv-concept">
          <div className="pv-chead">
            <h3>{c.name}</h3>
            <button onClick={() => setSwap((v) => !v)} aria-pressed={swap}>Swap for a library card</button>
            {clearing
              ? <span className="pv-confirm">Clear this card? <button onClick={() => { set({ name: '' }); setClearing(false); }}>Clear</button><button onClick={() => setClearing(false)}>Keep</button></span>
              : <button onClick={() => setClearing(true)}>Clear this card</button>}
          </div>
          {swap ? library : (
            <>
              <div className="pt-group" role="group" aria-label="Where it starts">
                <span>Where it starts</span>
                <div>{STARTS.map((x) => <button key={x.id} type="button" aria-pressed={c.start === x.id} onClick={() => setStart(x.id)}>{startLabel(x.id, s)}</button>)}</div>
              </div>
              {CONCEPT_FIELDS.filter((f) => f.opts).map((f) => (
                <div key={f.key} className="pt-group" role="group" aria-label={f.l}>
                  <span>{f.l}</span>
                  <div>{f.opts!.map((o) => <button key={o} type="button" aria-pressed={c[f.key] === o} onClick={() => set({ [f.key]: c[f.key] === o ? '' : o })}>{o}</button>)}</div>
                </div>
              ))}
            </>
          )}
        </section>
      )}
    </>
  );
}
