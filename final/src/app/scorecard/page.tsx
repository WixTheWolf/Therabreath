import { EVENT, SAMPLES, CRITERIA, JAR, JAR_OPTS, judgeAs } from '@/lib/content';
import PrintButton from './PrintButton';

export const metadata = { title: 'Tasting scorecard' };

// The tasting scorecard, on paper: the same questions the phones ask, one card per person. Prints to one page. On the day
// the presenter view only counts the cards; the team types them in after the morning on /host/cards.

const KIDS = SAMPLES.filter((x) => judgeAs(x.base) === 'a kids rinse').map((x) => x.code).join(' and ');
const ADULT = SAMPLES.filter((x) => judgeAs(x.base) !== 'a kids rinse').map((x) => x.code).join(' and ');

export default function Scorecard() {
  return (
    <main className="sc" data-theme="a">
      <header className="sc-head">
        <div><h1>Blind tasting</h1><span>The Future of Freshness · {EVENT.date}</span></div>
        <label>Name <i /></label>
        <PrintButton />
      </header>
      <p className="sc-how">Taste each sample, rinse, then circle a score from 1 to 5 and tick how the sweetness and cooling are. Judge {KIDS} as kids rinses and {ADULT} as Fresh Breath rinses. We’ll reveal the names once everyone has scored.</p>
      {SAMPLES.map((x) => (
        <section key={x.code} className="sc-card">
          <div className="sc-id"><b>{x.code}</b><small>{x.base}</small></div>
          <div className="sc-body">
            {CRITERIA.map((c) => <div key={c.key} className="sc-row"><span>{c.q}<small className="sc-anch">1 = {c.lo} · 5 = {c.hi}</small></span><div className="sc-dots">{[1, 2, 3, 4, 5].map((n) => <i key={n}>{n}</i>)}</div></div>)}
            {JAR.map((j) => <div key={j.key} className="sc-row"><span>{j.l}</span><div className="sc-boxes">{JAR_OPTS.map((o) => <i key={o}>{o}</i>)}</div></div>)}
            <div className="sc-row"><span>One word for it (optional)</span><u /></div>
            {x.mystery && <div className="sc-row"><span>Which fruits can you taste?</span><u /></div>}
          </div>
        </section>
      ))}
      <p className="sc-foot">Confidential. These are development samples made for this session. They aren’t finished products.</p>
    </main>
  );
}
