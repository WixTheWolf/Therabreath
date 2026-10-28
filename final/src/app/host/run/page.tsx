import { EVENT, RUN, SAMPLES, NEXT_STEPS } from '@/lib/content';
import PrintButton from '@/app/scorecard/PrintButton';

// The hosts’ run sheet: one printout for The Flavor Factory team, behind the team link. Not for handing out.
// The run of show comes from RUN, the same source as the agenda and the presentation's chapter times.
const fresh = SAMPLES.filter((x) => x.base.startsWith('Fresh')).map((x) => x.code).join(' and ');
const kids = SAMPLES.filter((x) => x.base.startsWith('Kids')).map((x) => x.code).join(' and ');

const SETUP = [
  'Connect the laptop to the TV. Open the team link, then Present on the day (/host), and press F for full screen. Only this laptop should open it on the day, because it moves everyone’s phones. (Church & Dwight’s password can’t open it.) Keep the talking points (N) off while the laptop is mirrored to the TV, and use this sheet instead.',
  'Phones: people join by scanning the code on the first screen. Phones use their own data, so the room Wi-Fi only matters for the laptop. Ross offered to help us get on the network. If it fails, present from the backup PDF and the film file on the laptop, without the voting.',
  'Sound check: press End, then the left arrow once, to get to THE FLAVOR RACE. Play ten seconds through the speakers and set the volume, then press Home to go back to the start.',
  'Rehearse on /host?code=REHEARSE (the team page links to it), never on /host itself, so rehearsal votes stay out of the live session. The night before, wipe the live session FOF1109 from the Console so nothing from the previews is left behind.',
  `Samples: ${fresh} in the Fresh Breath base and ${kids} in the Kids base, poured blind into coded cups. Set out water to rinse, cups to spit into and napkins.`,
  'If we’re running late, press S to skip the optional slides (How cooling works, Flavor and OXYD-8, how a flavor is built, and the two directions that aren’t in the tasting), or ] to jump to the next part. The talking points (N) show how far over the current part is.',
  'Bring a few paper scorecards and pens for anyone who’d rather not use a phone (print them from /scorecard). You can add their votes on screen by clicking a bar, an orb or a row.',
];
const AFTER = [
  'Before you close the laptop, open /host?results=1 and print it to PDF. It has the votes, the tasting scores, the concepts, the white-space marks and Now, Next, Later.',
  'Collect any paper scorecards.',
  ...NEXT_STEPS.map((n) => `${n.t}: ${n.d}`),
];
const CONFIRM = [
  'The Flavor School wording, with Ryan.',
  'The bases: Blossom Mint and Grove Mint in the Fresh Breath base, Berry Blast and the Mystery Flavor in the Kids base.',
  'The dates on What happens next, including the January 2027 review.',
  'A video call with Ross before the day. He asked to connect once or twice ahead of time.',
  'The pre-brief goes out November 3.',
];

export default function RunSheet() {
  return (
    <main className="sc rs" data-theme="a">
      <header className="sc-head">
        <div><b>Run sheet</b><span>The Future of Freshness · {EVENT.date} · {EVENT.room} room · for The Flavor Factory team · not for handing out</span></div>
        <PrintButton label="Print the run sheet" />
      </header>

      <section className="rs-sec">
        <h2>From 9:30: set up the room</h2>
        <ol className="rs-check">{SETUP.map((x) => <li key={x}>{x}</li>)}</ol>
      </section>

      <section className="rs-sec">
        <h2>The run of show</h2>
        <table className="rs-run">
          <thead><tr><th>Time</th><th>Block and scenes</th><th>What happens</th></tr></thead>
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
      <p className="sc-foot">Confidential. Keys in the presentation: right arrow, space or click to go on; left arrow to go back; ] for the next part and [ for the previous one; S to skip the optional slides; Home for the start; F for full screen; N for the talking points; B to blank the screen. If the page reloads, it picks up where the session left off.</p>
    </main>
  );
}
