import { EVENT, RUN, SAMPLES, NEXT_STEPS } from '@/lib/content';
import PrintButton from '@/app/scorecard/PrintButton';

// The hosts' run sheet: one printout for The Flavor Factory team, behind the password. Not for the room.
// The run of show comes from RUN, the same source as the agenda and the deck's presenter tags.
const fresh = SAMPLES.filter((x) => x.base.startsWith('Fresh')).map((x) => x.code).join(' and ');
const kids = SAMPLES.filter((x) => x.base.startsWith('Kids')).map((x) => x.code).join(' and ');

const SETUP = [
  'Laptop to the TV. Open /host and press F for full screen. The speaker notes (N) show on the same screen, so keep them off while the laptop is mirrored to the TV and use this sheet instead.',
  'Sound: play ten seconds of THE FLAVOR RACE (the last slide) through the room speakers and set the volume. Then press Home to go back to the title.',
  'Wifi: Ross offered to help us get on the network. If it fails, present from the backup on the laptop: the deck PDF and the film file.',
  'Rehearsed on this laptop? Open /host?reset=1 once to clear the concept cards, the white-space marks and the board.',
  `Samples: ${fresh} in the Fresh Breath base, ${kids} in the Kids base, poured blind into coded cups. Water to rinse, cups to spit, napkins.`,
  'Scorecards: one per person plus spares, and pens. Print from /scorecard.',
];
const AFTER = [
  'Before you close the laptop: open /host?all=1 and print to PDF. It keeps the concept cards, the white-space marks and Now, Next, Later exactly as the room left them.',
  'Collect the scorecards.',
  ...NEXT_STEPS.map((n) => `${n.t}: ${n.d}`),
];
const CONFIRM = [
  'The Flavor School wording, with Ryan.',
  'The bases: Blossom Mint and Grove Mint in the Fresh Breath base, Berry Blast and the Mystery Flavor in the Kids base.',
  'The dates on What happens next, including the January 2027 review.',
  'A video call with Ross before the day. He asked to connect once or twice beforehand.',
  'The pre-brief goes out November 3.',
];

export default function RunSheet() {
  return (
    <main className="sc rs" data-theme="a">
      <header className="sc-head">
        <div><b>Run sheet</b><span>The Future of Freshness · {EVENT.date} · {EVENT.room} room · for The Flavor Factory team · not for the room</span></div>
        <PrintButton label="Print the run sheet" />
      </header>

      <section className="rs-sec">
        <h2>From 9:30: set up the room</h2>
        <ol className="rs-check">{SETUP.map((x) => <li key={x}>{x}</li>)}</ol>
      </section>

      <section className="rs-sec">
        <h2>The run of show</h2>
        <table className="rs-run">
          <thead><tr><th>Time</th><th>Block and slides</th><th>What happens</th></tr></thead>
          <tbody>{RUN.map((b) => (
            <tr key={b.id}>
              <td className="rs-t">{b.t}<small>to {b.end}</small></td>
              <td><b>{b.title}</b>{b.obj && <em>Objective {b.obj}</em>}<small>{b.slides}</small></td>
              <td>{b.does}</td>
            </tr>
          ))}</tbody>
        </table>
      </section>

      <div className="rs-two">
        <section className="rs-sec">
          <h2>After the film</h2>
          <ol className="rs-check">{AFTER.map((x) => <li key={x}>{x}</li>)}</ol>
        </section>
        <section className="rs-sec">
          <h2>Before November 9: still to confirm</h2>
          <ol className="rs-check">{CONFIRM.map((x) => <li key={x}>{x}</li>)}</ol>
        </section>
      </div>
      <p className="sc-foot">Confidential. Keys on the deck: right arrow, space or click to go on; left arrow back; Home to the start; F full screen; N notes.</p>
    </main>
  );
}
