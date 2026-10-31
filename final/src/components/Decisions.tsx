// From sample to next step: the six moves of the morning, and what every direction leaves with. On the front door (dark)
// and the pre-brief (light); the colors come from the page's theme. The steps and fields live in content.ts (DECIDE,
// RECORD), and the presentation's Now, Next, Later rows ask for the same six fields.
import { DECIDE, RECORD } from '@/lib/content';

export default function Decisions({ className = '', id }: { className?: string; id?: string }) {
  return (
    <section className={'dp ' + className} id={id} aria-labelledby="dp-h">
      <h2 id="dp-h" className="dp-h">From sample <em>to next step.</em></h2>
      <p className="dp-lead">Here’s how four blind samples become up to three directions by noon, each one with owners on both sides and a date.</p>
      <ol className="dp-path">
        {DECIDE.map((x, i) => (
          <li key={x.v} className={i === DECIDE.length - 1 ? 'end' : ''}>
            <span className="dp-node" aria-hidden="true"><i /></span>
            <b>{x.v}</b>
            <span className="dp-when">{x.when}</span>
            <p>{x.d}</p>
          </li>
        ))}
      </ol>
      <div className="dp-record">
        <div className="dp-record-head">
          <h3>Every direction leaves with</h3>
          <span>Agreed in the room, then written into The Flavor Playbook</span>
        </div>
        <dl>{RECORD.map((r) => <div key={r.l}><dt>{r.l}</dt><dd>{r.d}</dd></div>)}</dl>
      </div>
      <p className="dp-note">The scores are this group’s first reactions, not consumer research. Consumer appeal and technical readiness will still need proper testing.</p>
    </section>
  );
}
