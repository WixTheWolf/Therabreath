'use client';
// The Flavor Playbook write-up: the document we promise everyone in the room within 8 business days. It fills in from
// the session as the morning goes (the pre-brief answers, the trend vote, the tasting, the chips, the concepts, the
// white-space marks and Now, Next, Later), and the team adds its own words in the boxes: a summary, a note on each
// objective and what we need from Church & Dwight. The boxes save to the session (`note` events, team only), so anyone
// on the team opens the same draft. Empty boxes don't print. The sample names show only once the presentation has
// revealed them, so a copy printed before the tasting keeps them sealed. ?code=REHEARSE is a practice copy, marked as
// one on every page; it never touches the live session.
import { useEffect, useMemo, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { EVENT, OBJECTIVES, ROSS_GOAL, SIGNALS, SAMPLES, DIRECTIONS, PRIMARY_TERRITORIES, CRITERIA, SURVEY, HORIZONS, NEXT_STEPS, TEAM, SOURCES, MYSTERY } from '@/lib/content';
import { tallyPick, ranked, tasteSummary, voteCounts, tasters, type SessionState } from '@/lib/state';
import { teamConcepts } from './scenes/CoCreate';
import { candidates } from './scenes/Build';
import { FIELDS, OBJ_IMG, directionName, markLabel } from './show/ShowScenes';
import { PLAN_COLS, planCell, planRows, Synced } from './show/Plan';

// 8 business days after the morning: weekdays only, counted from the day after.
function sendBy(day: string, n = 8) {
  const d = new Date(day + 'T12:00:00');
  while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) n--; }
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
const DUE = sendBy(EVENT.day);
const plural = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`;
const avg = (n: number) => n.toFixed(1);

// The boxes the team writes in, what each one asks for, and where it sits.
const NOTES = {
  summary: 'Our summary: two or three sentences on what the morning decided and why, in our own words.',
  told: 'Anything from the pre-brief answers worth calling out.',
  o1: 'What the room said about the trends, and anything they told us we’d missed.',
  o2: 'What the room said about each sample, and what it would take to make the best ones work.',
  o3: 'Anything the room added to the concepts, or asked us to look into.',
  o4: 'What has to be true for the Now directions to work, and what Church & Dwight wants to see in the next round.',
  asks: 'What we need from Church & Dwight: base samples, reviewers’ names, dates.',
} as const;
type NoteKey = keyof typeof NOTES;

export default function WriteupDoc({ code }: { code: string }) {
  const { state: s, send, status } = useSession(code, { admin: true, interval: 3000 });
  const [size, setSize] = useState<'Letter' | 'A4'>('Letter');
  const [today, setToday] = useState('');
  useEffect(() => {
    document.documentElement.dataset.theme = 'a';
    setToday(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
  }, []);
  const practice = code !== EVENT.code;
  const d = useMemo(() => digest(s), [s]);

  const note = (k: NoteKey, label: string, title?: string) => <NoteBox k={k} label={label} title={title} value={s.notes?.[k] || ''} send={send} />;

  return (
    <div className="wu">
      {/* The paper size, and a footer on every page after the cover (Chromium prints page margin boxes). */}
      <style>{`@page { size: ${size === 'A4' ? 'A4' : 'letter'}; @bottom-left { content: "${practice ? `Practice copy (${code}), not for sending` : 'The Flavor Playbook \\00B7  Confidential'}"; font: 400 7.5pt Geist, system-ui, sans-serif; color: #59636E; } @bottom-right { content: counter(page); font: 500 7.5pt Geist, system-ui, sans-serif; color: #59636E; } } @page :first { @bottom-left { content: none; } @bottom-right { content: none; } }`}</style>
      <Toolbar code={code} s={s} d={d} size={size} setSize={setSize} online={status.online} />

      <div className={'wu-doc ' + size}>
        {/* Cover */}
        <section className="wu-sheet wu-cover">
          <img className="wu-cover-img" src="/img/cover-drop.jpg" alt="" />
          <div className="wu-cover-lock"><img src="/img/tff-logo-white.webp" alt="The Flavor Factory" width={110} height={24} /><span>×</span><b>TheraBreath</b></div>
          <div className="wu-cover-copy">
            <h1>The Flavor<br /><em>Playbook</em></h1>
            <p className="wu-cover-sub">What we decided together on {EVENT.date.replace('Monday, ', '')}, and what happens next.</p>
            <dl className="wu-cover-meta">
              <div><dt>Session</dt><dd>{EVENT.sub}</dd></div>
              <div><dt>Where</dt><dd>{EVENT.room} room, Church &amp; Dwight, {EVENT.city}</dd></div>
              <div><dt>Prepared by</dt><dd>The Flavor Factory{today ? `, ${today}` : ''}</dd></div>
            </dl>
            {practice && <div className="wu-practice on-dark">Practice copy from the rehearsal session {code}. Not for sending.</div>}
            <p className="wu-cover-conf">Confidential. For the people in the room and their teams.</p>
          </div>
        </section>

        {/* In brief */}
        <section className="wu-sheet">
          <PracticeMark code={code} />
          <h2 className="wu-h2">The morning in brief</h2>
          <figure className="wu-goal">
            <blockquote>“{ROSS_GOAL.lead} {ROSS_GOAL.loyal} {ROSS_GOAL.joiner} {ROSS_GOAL.fresh}”</blockquote>
            <figcaption>Ross Conroy, Church &amp; Dwight Oral Care R&amp;D, in his invitation to the session</figcaption>
          </figure>
          <p className="wu-lede">{d.headline}</p>
          {note('summary', 'Our summary')}
          <h3 className="wu-h3">What goes forward</h3>
          {d.plan.length ? (
            <ol className="wu-forward">{d.plan.map((r) => (
              <li key={r.id}><span className="wu-tag">{r.label}</span><b>{r.what || 'Untitled direction'}</b>
                <span className="wu-forward-meta">{[r.owner && `TFF: ${r.owner}`, r.reviewer && `C&D: ${r.reviewer}`, planCell(r, 'due') && `Next sample ${planCell(r, 'due')}`].filter(Boolean).join(' · ') || <em className="wu-ghost">Owners and dates to agree</em>}</span>
              </li>
            ))}</ol>
          ) : <p className="wu-ghost">Nothing is on Now, Next, Later yet. This fills in from the board in the presentation.</p>}
          <h3 className="wu-h3">What the room chose</h3>
          <dl className="wu-chose">
            <div><dt>The three trends that matter most</dt><dd>{d.topSignals.length ? d.topSignals.map((x) => x.title).join(' · ') : <span className="wu-ghost">No votes yet</span>}</dd></div>
            <div><dt>What gets a next round</dt><dd>{d.chips.filter((x) => x.n > 0).slice(0, 3).map((x) => x.name).join(' · ') || <span className="wu-ghost">No chips yet</span>}</dd></div>
            <div><dt>Concepts we wrote</dt><dd>{d.concepts.map((c) => c.name).join(' · ') || <span className="wu-ghost">None written yet</span>}</dd></div>
          </dl>
        </section>

        {/* The pre-brief */}
        <section className="wu-sheet">
          <PracticeMark code={code} />
          <h2 className="wu-h2">Before the morning: what you told us</h2>
          <p className="wu-lede">{d.answers ? `${plural(d.answers, 'person', 'people')} answered the pre-brief before the day. Their answers opened the morning.` : 'No pre-brief answers yet. They fill in as people send them.'}</p>
          <div className="wu-two">
            <Bars title={SURVEY.consumer.q} rows={d.consumer} />
            <Bars title={SURVEY.moment.q} rows={d.moment} />
          </div>
          <h3 className="wu-h3">{SURVEY.veto.q}</h3>
          {d.vetoes.length ? <ul className="wu-quotes">{d.vetoes.map(([v, n]) => <li key={v}>“{v}”{n > 1 && <span className="wu-count"> {n} people</span>}</li>)}</ul> : <p className="wu-ghost">No answers yet.</p>}
          {note('told', 'Notes on the pre-brief')}
        </section>

        {/* Objective 1 */}
        <section className="wu-sheet">
          <PracticeMark code={code} />
          <ObjHead i={0} />
          <h3 className="wu-h3">The trend vote</h3>
          <p className="wu-small">{d.signalVotes.phones + d.signalVotes.hand ? `${plural(d.signalVotes.phones, 'phone')}${d.signalVotes.hand ? ` and ${plural(d.signalVotes.hand, 'hand vote')}` : ''}, three trends each.` : 'Everyone picks the three trends that matter most for TheraBreath. The results fill in here.'}</p>
          <table className="wu-table wu-trends">
            <thead><tr><th>Trend</th><th>What it could mean for TheraBreath</th><th className="r">Votes</th></tr></thead>
            <tbody>{d.signals.map((x, i) => (
              <tr key={x.id} className={i < 3 && x.votes > 0 ? 'top' : ''}><td><b>{x.title}</b></td><td>{x.so}</td><td className="r num">{x.votes}</td></tr>
            ))}</tbody>
          </table>
          {note('o1', 'Notes on the trends')}
        </section>

        {/* Objective 2 */}
        <section className="wu-sheet">
          <PracticeMark code={code} />
          <ObjHead i={1} />
          <h3 className="wu-h3">The four directions</h3>
          <ul className="wu-dirs">{PRIMARY_TERRITORIES.map((t) => {
            const tasted = SAMPLES.filter((x) => x.territory === t.id).map((x) => x.code);
            return <li key={t.id}><i style={{ background: `radial-gradient(circle at 35% 30%, #fff, ${t.palette[0]} 45%, ${t.palette[1]})` }} /><div><b>{t.name}</b><p>{t.promise}</p><small>{tasted.length ? `In the tasting as samples ${tasted.join(' and ')}` : 'Not in the tasting'}</small></div></li>;
          })}</ul>
          <h3 className="wu-h3">The blind tasting</h3>
          <p className="wu-small">Four samples, made in the Fresh Breath and Kids bases Church &amp; Dwight sent, tasted blind. {d.tasters.phones + d.tasters.cards ? `${d.tasters.phones} scored on phones${d.tasters.cards ? ` and ${d.tasters.cards} on paper` : ''}.` : ''} Scores run from 1 (low) to 5 (high), averaged across everyone who tasted.</p>
          <table className="wu-table wu-taste">
            <thead><tr><th>Sample</th>{CRITERIA.map((c) => <th key={c.key} className="r">{c.l}</th>)}<th className="r">Tasters</th><th>Develop it further?</th></tr></thead>
            <tbody>{d.tasting.map((x) => (
              <tr key={x.code}>
                <td><b>{x.code}{x.name ? `. ${x.name}` : ''}</b><small>{x.base}{x.note ? ` · ${x.note}` : ''}</small></td>
                {CRITERIA.map((c) => <td key={c.key} className="r num">{x.sum.n ? avg(x.sum[c.key]) : ''}</td>)}
                <td className="r num">{x.sum.n || ''}</td>
                <td className="wu-dev">{x.sum.n ? `${x.dev.Yes} yes, ${x.dev.Maybe} maybe, ${x.dev.No} no` : ''}</td>
              </tr>
            ))}</tbody>
          </table>
          {!d.tasted && <p className="wu-ghost">No scores yet. The table fills in as people score on their phones or the paper cards are typed in.</p>}
          {d.tasting.some((x) => x.sum.words.length) && <dl className="wu-words">{d.tasting.filter((x) => x.sum.words.length).map((x) => <div key={x.code}><dt>{x.code} in one word</dt><dd>{x.sum.words.join(', ')}</dd></div>)}</dl>}
          {d.guesses.length > 0 && <p className="wu-small">The room’s guesses at the fruits in {MYSTERY}: {d.guesses.join(', ')}.</p>}
          <h3 className="wu-h3">What gets a next round</h3>
          <p className="wu-small">Five chips each, across the four samples and the two directions that weren’t in the tasting.</p>
          <BarList rows={d.chips.map((x) => ({ k: x.id, l: x.name, sub: x.sub, n: x.n }))} empty="No chips yet." />
          {note('o2', 'Notes on the directions and the tasting')}
        </section>

        {/* Objective 3 */}
        <section className="wu-sheet">
          <PracticeMark code={code} />
          <ObjHead i={2} />
          <h3 className="wu-h3">The concepts we wrote</h3>
          {d.concepts.length ? <div className="wu-concepts">{d.concepts.map((c) => (
            <article key={c.id} className="wu-concept">
              <h4>{c.name}</h4>
              <dl>{FIELDS.map((f) => { const v = (c as any)[f.key]; return <div key={f.f}><dt>{f.l}</dt><dd>{v || <span className="wu-ghost">To agree</span>}</dd></div>; })}</dl>
            </article>
          ))}</div> : <p className="wu-ghost">No concepts written yet. Up to three, from the concept slide in the presentation.</p>}
          <h3 className="wu-h3">The dot vote</h3>
          <p className="wu-small">Three dots each on the ideas to develop.</p>
          <BarList rows={d.dots.map((x) => ({ k: x.id, l: x.name, sub: x.sub, n: x.dots }))} empty="No dots yet." />
          {note('o3', 'Notes on the concepts')}
        </section>

        {/* Objective 4 */}
        <section className="wu-sheet">
          <PracticeMark code={code} />
          <ObjHead i={3} />
          <h3 className="wu-h3">Where the ideas could fit in a day</h3>
          {d.marks.length ? <ul className="wu-marks">{d.marks.map((m) => <li key={m}>{m}</li>)}</ul> : <p className="wu-ghost">No moments marked yet.</p>}
          <h3 className="wu-h3">Now, Next, Later</h3>
          {HORIZONS.map((h) => {
            const rows = d.plan.filter((r) => r.h === h.id);
            return (
              <div key={h.id} className="wu-hz">
                <h4>{h.label}<span>{h.when}</span></h4>
                {rows.length ? rows.map((r) => (
                  <article key={r.id} className="wu-row">
                    <b>{r.what || 'Untitled direction'}</b>
                    <dl>{PLAN_COLS.map((c) => { const v = planCell(r, c.f); return <div key={c.f}><dt>{c.l}</dt><dd>{v || <span className="wu-ghost">To agree</span>}</dd></div>; })}</dl>
                  </article>
                )) : <p className="wu-ghost">Nothing here.</p>}
              </div>
            );
          })}
          {note('o4', 'Notes on the plan')}
        </section>

        {/* What happens next */}
        <section className="wu-sheet">
          <PracticeMark code={code} />
          <h2 className="wu-h2">What happens next</h2>
          <ol className="wu-next">{NEXT_STEPS.map((n) => <li key={n.t}><b>{n.t}</b><p>{n.d}</p></li>)}</ol>
          {d.dues.length > 0 && <>
            <h3 className="wu-h3">Next samples, by date</h3>
            <ul className="wu-dues">{d.dues.map((r) => <li key={r.id}><span className="num">{planCell(r, 'due')}</span><b>{r.what || 'Untitled direction'}</b>{r.owner && <small>{r.owner}</small>}</li>)}</ul>
          </>}
          {note('asks', 'What we need from Church & Dwight', 'What we need from you')}
          <h3 className="wu-h3">Your contacts at The Flavor Factory</h3>
          <ul className="wu-team">{TEAM.map((t) => <li key={t.name}><b>{t.name}</b><span>{t.title}</span></li>)}</ul>
          <h3 className="wu-h3">Sources</h3>
          <ul className="wu-sources">{d.sources.map((x) => <li key={x}>{x}</li>)}</ul>
          <p className="wu-conf">Confidential. These are development samples and concepts made for this session. They aren’t finished products or claims, and this document holds no formula details.</p>
        </section>
      </div>
    </div>
  );
}

// A box the team writes in. On screen it's a text box that saves to the session as you type; in print it's the text, and
// an empty box doesn't print at all. Defined out here so the box keeps its focus when the session updates.
function NoteBox({ k, label, value, send, title }: { k: NoteKey; label: string; value: string; send: (kind: string, data?: any) => any; title?: string }) {
  const text = value.trim();
  return (
    <div className={'wu-note' + (text ? ' has' : '')}>
      {title && <h3 className="wu-h3">{title}</h3>}
      <Synced area className="wu-note-in" value={value} commit={(v: string) => send('note', { key: k, text: v })} placeholder={NOTES[k]} aria-label={label} rows={3} />
      {text && <div className="wu-note-out">{text.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}</div>}
    </div>
  );
}
const PracticeMark = ({ code }: { code: string }) => (code !== EVENT.code ? <div className="wu-practice">Practice copy from the rehearsal session {code}. Not for sending.</div> : null);
// Each objective opens with its picture from the presentation, its number and Ross's words.
function ObjHead({ i }: { i: number }) {
  return (
    <header className="wu-obj">
      <img className="wu-band" src={OBJ_IMG[i]} alt="" />
      <div className="wu-obj-row">
        <span className="wu-num" aria-hidden>{OBJECTIVES[i].n}</span>
        <div>
          <h2><span className="wu-sr">Objective {OBJECTIVES[i].n}: </span>{OBJECTIVES[i].chapter}</h2>
          <blockquote>“{OBJECTIVES[i].ask}”</blockquote>
        </div>
      </div>
    </header>
  );
}

// Everything the document reads from the session, worked out once.
function digest(s: SessionState) {
  const sigT = tallyPick(s, 'signals');
  const signals = SIGNALS.map((x) => ({ ...x, votes: sigT[x.id] || 0 })).sort((a, b) => b.votes - a.votes || a.n - b.n);
  const topSignals = signals.filter((x) => x.votes > 0).slice(0, 3);
  const answers = Object.values(s.survey || {});
  const count = (key: 'consumer' | 'moment') => { const t: Record<string, number> = {}; answers.forEach((a) => a[key] && (t[a[key]!] = (t[a[key]!] || 0) + 1)); return ranked(t); };
  const vetoCount: Record<string, [string, number]> = {};
  for (const v of answers.map((a) => a.veto).filter(Boolean) as string[]) { const key = v.trim().toLowerCase().replace(/[.!]+$/, ''); if (!key) continue; vetoCount[key] = [vetoCount[key]?.[0] || v.trim().replace(/[.!]+$/, ''), (vetoCount[key]?.[1] || 0) + 1]; }
  const tasting = SAMPLES.map((x) => {
    const rs = Object.values(s.ratings[x.code] || {});
    const dev = { Yes: 0, Maybe: 0, No: 0 } as Record<string, number>;
    rs.forEach((r) => { if (r.advance && r.advance in dev) dev[r.advance]++; });
    return { ...x, name: s.revealed?.samples[x.code]?.name || '', note: s.revealed?.samples[x.code]?.note || '', sum: tasteSummary(s, x.code), dev };
  });
  const chipT = tallyPick(s, 'directions');
  const chips = DIRECTIONS.map((x) => ({ id: x.id, name: directionName(x.id, s), sub: x.sub, n: chipT[x.id] || 0 })).sort((a, b) => b.n - a.n);
  const plan = planRows(s);
  const people = Object.values(s.participants).filter((p) => !p.sim && !p.paper).length;
  const who = tasters(s);
  const concepts = teamConcepts(s);
  const parts = [
    people ? `${plural(people, 'person', 'people')} joined on their phones` : '',
    who.phones + who.cards ? `${who.phones + who.cards} scored the tasting${who.cards ? ` (${who.cards} on paper)` : ''}` : '',
    answers.length ? `${answers.length} answered the pre-brief before the day` : '',
  ].filter(Boolean);
  const headline = parts.length
    ? `On ${EVENT.date}, ${parts.length > 1 ? parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1] : parts[0]}. Here’s what we decided together, and what happens next.`
    : `On ${EVENT.date}, Church & Dwight Oral Care R&D and The Flavor Factory spent the morning on Ross’s four objectives. The numbers below fill in from the session.`;
  // Every source the trends lean on, plus Ross's invitation, in the order they first appear.
  const srcKeys = [...new Set(['ross', ...SIGNALS.flatMap((x) => x.proofs.map((p) => p.src))])];
  return {
    signals, topSignals, signalVotes: voteCounts(s, 'signals'),
    answers: answers.length, consumer: count('consumer'), moment: count('moment'), vetoes: Object.values(vetoCount).sort((a, b) => b[1] - a[1]),
    tasting, tasted: tasting.some((x) => x.sum.n > 0), tasters: who,
    guesses: Object.values(s.ratings[MYSTERY] || {}).map((r) => r.fruitGuess).filter(Boolean) as string[],
    chips, concepts, dots: candidates(s).filter((x) => x.dots > 0),
    marks: (s.marks || []).map((c) => markLabel(s, c)),
    plan, dues: plan.filter((r) => r.due).sort((a, b) => String(a.due).localeCompare(String(b.due))),
    headline, sources: srcKeys.map((k) => SOURCES[k]).filter(Boolean),
  };
}
type Digest = ReturnType<typeof digest>;

// A ranked list with a bar for each count (the pre-brief answers).
function Bars({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div className="wu-bars">
      <h3 className="wu-h3">{title}</h3>
      <BarList rows={rows.map(([l, n]) => ({ k: l, l, n }))} empty="No answers yet." />
    </div>
  );
}
function BarList({ rows, empty }: { rows: { k: string; l: string; sub?: string; n: number }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  if (!rows.some((r) => r.n > 0)) return <p className="wu-ghost">{empty}</p>;
  return (
    <ul className="wu-barlist">{rows.filter((r) => r.n > 0).map((r, i) => (
      <li key={r.k} className={i < 3 ? 'top' : ''}><span>{r.l}{r.sub && <small>{r.sub}</small>}</span><i><s style={{ width: `${(r.n / max) * 100}%` }} /></i><b className="num">{r.n}</b></li>
    ))}</ul>
  );
}

// Save as PDF: let a box that's still being typed in save its last words first, so they make it onto the page.
function savePdf() {
  (document.activeElement as HTMLElement | null)?.blur?.();
  setTimeout(() => print(), 200);
}

// The team's bar: which session, the paper size, the date it's due, what's still missing, and Save as PDF. Not printed.
function Toolbar({ code, s, d, size, setSize, online }: { code: string; s: SessionState; d: Digest; size: string; setSize: (v: 'Letter' | 'A4') => void; online: boolean }) {
  const live = code === EVENT.code;
  const missing = (f: 'owner' | 'reviewer' | 'base' | 'due', l: string) => { const n = d.plan.filter((r) => !planCell(r, f)).length; return n ? `${plural(n, 'direction')} without ${l}` : ''; };
  const gaps = [missing('owner', 'a TFF owner'), missing('reviewer', 'a C&D reviewer'), missing('base', 'a base'), missing('due', 'a next sample date')].filter(Boolean);
  const checks: { ok: boolean; t: string }[] = [
    { ok: !!s.revealed, t: s.revealed ? 'The sample names are in' : 'The sample names show once the tasting reveals them in the presentation' },
    { ok: d.tasting.every((x) => x.sum.n > 0), t: d.tasted ? (d.tasting.every((x) => x.sum.n > 0) ? 'Every sample has scores' : 'Some samples have no scores yet') : 'No tasting scores yet. Type in any paper cards from the presenter view' },
    { ok: d.plan.length > 0 && !gaps.length, t: !d.plan.length ? 'Nothing on Now, Next, Later yet' : gaps.length ? gaps.join(', ') : 'Every direction has its owners, base and next sample date' },
    { ok: !!s.notes?.summary?.trim(), t: s.notes?.summary?.trim() ? 'Our summary is written' : 'Write our summary on the second page' },
  ];
  return (
    <div className="wu-bar">
      <div className="wu-bar-top">
        <b>Playbook write-up</b>
        <nav className="wu-seg" aria-label="Session">
          <a href="/host/writeup" aria-current={live ? 'page' : undefined}>Live session {EVENT.code}</a>
          <a href="/host/writeup?code=REHEARSE" aria-current={!live && code === 'REHEARSE' ? 'page' : undefined}>Practice copy</a>
        </nav>
        <span className={'wu-status' + (online ? '' : ' off')}>{online ? 'Saved to the session as you type' : 'Offline. Your words are kept and sent when you’re back'}</span>
        <div className="wu-seg" role="group" aria-label="Paper size">{(['Letter', 'A4'] as const).map((x) => <button key={x} type="button" aria-pressed={size === x} onClick={() => setSize(x)}>{x}</button>)}</div>
        <button type="button" className="wu-save" onClick={savePdf}>Save as PDF</button>
      </div>
      <div className="wu-bar-check">
        <span className="wu-due">Send to everyone by <b>{DUE}</b>, 8 business days after the morning.</span>
        <ul>{checks.map((c) => <li key={c.t} className={c.ok ? 'ok' : ''}>{c.ok
          ? <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          : <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>}
          <span>{c.t}</span></li>)}</ul>
      </div>
    </div>
  );
}
