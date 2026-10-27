import { EVENT, SAMPLES, WHO_CHIPS } from '@/lib/content';
import PrintButton from './PrintButton';

// The tasting scorecard, on paper: the same questions the phones used to ask, one card per person. Prints to one page.
const SCALES = ['Appeal', 'Feels like TheraBreath', 'Newness'];

export default function Scorecard() {
  return (
    <main className="sc" data-theme="a">
      <header className="sc-head">
        <div><b>Blind tasting</b><span>The Future of Freshness · {EVENT.date}</span></div>
        <label>Name <i /></label>
        <PrintButton />
      </header>
      <p className="sc-how">Taste each sample, rinse, then score it. 1 is low, 5 is high. Names are revealed after everyone has scored.</p>
      {SAMPLES.map((x) => (
        <section key={x.code} className="sc-card">
          <div className="sc-id"><b>{x.code}</b><small>{x.base}</small></div>
          <div className="sc-body">
            {SCALES.map((l) => <div key={l} className="sc-row"><span>{l}</span><div className="sc-dots">{[1, 2, 3, 4, 5].map((n) => <i key={n}>{n}</i>)}</div></div>)}
            <div className="sc-row"><span>Who is it for</span><div className="sc-boxes">{WHO_CHIPS.map((w) => <i key={w}>{w}</i>)}</div></div>
            <div className="sc-row"><span>Advance this direction?</span><div className="sc-boxes">{['Yes', 'Maybe', 'No'].map((w) => <i key={w}>{w}</i>)}</div></div>
            <div className="sc-row"><span>One word for it</span><u /></div>
            {x.code === 'C' && <div className="sc-row"><span>The fruits you taste</span><u /></div>}
          </div>
        </section>
      ))}
      <p className="sc-foot">Development concepts made for this conversation: not products, claims or commercial formulations. Confidential.</p>
    </main>
  );
}
