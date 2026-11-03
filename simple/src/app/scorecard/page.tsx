import { EVENT, SAMPLES, WHO_CHIPS, CRITERIA, DEVELOP, PRIMARY_TERRITORIES as TERRITORIES } from '@/lib/content';
import PrintButton from './PrintButton';

export const metadata = { title: 'Tasting scorecard' };

// The tasting scorecard, on paper: the same questions the phones ask, one card per person. Prints to one page. Only the
// three scores are needed; the rest is optional, as on the phones. The team types each card into the presenter view
// (/host/presenter) on the tasting slide, or after the morning, and keeps the cards for the keep-or-change notes.
const SCALES = CRITERIA.map((c) => c.l);

export default function Scorecard() {
  return (
    <main className="sc" data-theme="a">
      <header className="sc-head">
        <div><h1>Blind tasting</h1><span>The Future of Freshness · {EVENT.date}</span></div>
        <label>Name <i /></label>
        <PrintButton />
      </header>
      <p className="sc-how">Taste each sample, rinse, then give it the three scores from 1 (low) to 5 (high). Everything under the dotted line is optional. Please score all four before the names go up, and hand your card in at the end, even if it isn’t finished.</p>
      {SAMPLES.map((x) => (
        <section key={x.code} className="sc-card">
          <div className="sc-id"><b>{x.code}</b><small>{x.base}</small></div>
          <div className="sc-body">
            {SCALES.map((l) => <div key={l} className="sc-row sc-need"><span>{l}</span><div className="sc-dots">{[1, 2, 3, 4, 5].map((n) => <i key={n}>{n}</i>)}</div></div>)}
            <div className="sc-opt">Optional</div>
            <div className="sc-row"><span>Who would buy it?</span><div className="sc-boxes">{WHO_CHIPS.map((w) => <i key={w}>{w}</i>)}</div></div>
            <div className="sc-row"><span>Which direction do you think it comes from?</span><div className="sc-boxes">{TERRITORIES.map((t) => <i key={t.id}>{t.name}</i>)}</div></div>
            <div className="sc-row sc-pair">
              <span>{DEVELOP.q}</span><div className="sc-boxes">{DEVELOP.opts.map((w) => <i key={w}>{w}</i>)}</div>
              <span>One word for it</span><u />
            </div>
            {x.mystery && <div className="sc-row"><span>Which fruits can you taste?</span><u /></div>}
            <div className="sc-row"><span>What would you keep, or change?</span><u /></div>
          </div>
        </section>
      ))}
      <p className="sc-foot">Confidential. These are development samples made for this session. They aren’t finished products.</p>
    </main>
  );
}
