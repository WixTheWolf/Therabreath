import { EVENT, RUN, SAMPLES, NEXT_STEPS, TASTING_KIT } from '@/lib/content';
import { RUN_NOTES } from '@/lib/runNotes';
import { SEALED } from '@/lib/sealed';
import PrintButton from '@/app/scorecard/PrintButton';

export const metadata = { title: 'Run sheet' };

// The hosts’ run sheet: one printout for The Flavor Factory team, behind the team link. Not for handing out.
// The run of show comes from RUN, the same source as the agenda and the presentation's chapter times.
const fresh = SAMPLES.filter((x) => x.base.startsWith('Fresh')).map((x) => x.code).join(' and ');
const kids = SAMPLES.filter((x) => x.base.startsWith('Kids')).map((x) => x.code).join(' and ');

const SETUP = [
  'Connect the laptop to the TV as an extended display, not a mirror. Open the team link, then Present on the day (/host), drag that window to the TV and press F for full screen. Then press P: the presenter view opens in its own window. Keep it on the laptop’s screen. It has the talking points, the time in Princeton against this sheet, and buttons that move the presentation. Only this laptop should open the presentation on the day, because it moves everyone’s phones. (Church & Dwight’s password can’t open it.) If the TV will only mirror, skip the presenter view and use this sheet.',
  'Phones: people join by scanning the code on the first screen. Phones use their own data, so the room Wi-Fi only matters for the laptop. Ross offered to help us get on the network. If it fails, present from the backup PDF and the film file on the laptop, without the voting.',
  'Film backup: the day before, download THE FLAVOR RACE from the team page (flavor-race.mp4: 2:24, 2560 × 1440, with sound) and keep it on the laptop’s desktop. Open it once to check it plays. If the site won’t play it on the day, play the file from there, full screen, with the sound up. The opening film isn’t shown in the room: we open with our own welcome.',
  'Sound and picture check, before anyone arrives and on the rehearsal session so nobody’s phone moves: open /host?code=REHEARSE on the TV, press F for full screen, then End and the left arrow once to get to THE FLAVOR RACE. Check it fills the screen, play ten seconds through the speakers and set the volume, and press R to check it starts again. Then close that window and open Present on the day. Keep the film off the TV once people start arriving.',
  'Rehearse on /host?code=REHEARSE (the team page links to it), never on /host itself, so rehearsal votes stay out of the live session. Leave the live session FOF1109 alone the night before: it holds everyone’s pre-brief answers, and the team page shows how many are in.',
  `Samples: ${fresh} in the Fresh Breath base and ${kids} in the Kids base, poured blind into coded cups. Set out water to rinse, cups to spit into and napkins.`,
  'If we’re running late, press S to skip the optional slides (How cooling works, Flavor and OXYD-8, how a flavor is built, and the two directions that aren’t in the tasting), or ] to jump to the next part. The presenter view shows how far over the current part is and whether the short version is on.',
  'Bring a few paper scorecards and pens for anyone who’d rather not use a phone (print them from /scorecard). On the vote slides, the presenter view has a button to add a hand vote for each option, and one to take it back. On the tasting, type each paper card in with Add a paper card. A card typed in by mistake can be removed.',
];
const AFTER = [
  'Before you close the laptop, open /host?results=1 and print it to PDF: the votes, the scores, the concepts, the white-space marks and Now, Next, Later as we left them. The Playbook write-up (/host/writeup) fills in from the same session.',
  'Collect the paper scorecards, and check each one is typed in.',
  ...NEXT_STEPS.map((n) => `${n.t}: ${n.d}`),
];
const CONFIRM = [
  'The Flavor School wording, with Ryan.',
  `The bases: ${SEALED.samples.A.name} and ${SEALED.samples.B.name} in the Fresh Breath base, ${SEALED.samples.C.name} and the ${SEALED.samples.D.name} in the Kids base.`,
  'The dates on What happens next, including the January 2027 review.',
  'A video call with Ross before the day. He asked to connect once or twice ahead of time.',
  'The pre-brief goes out November 3.',
];

export default function RunSheet() {
  return (
    <main className="sc rs" data-theme="a">
      <header className="sc-head">
        <div><h1>Run sheet</h1><span>The Future of Freshness · {EVENT.date} · {EVENT.room} room · for The Flavor Factory team · not for handing out</span></div>
        <PrintButton label="Print the run sheet" />
      </header>

      <section className="rs-sec">
        <h2>From 9:30: set up the room</h2>
        <ol className="rs-check">{SETUP.map((x) => <li key={x}>{x}</li>)}</ol>
      </section>

      <section className="rs-sec">
        <h2>At a glance: owners, kit and what each block should leave us with</h2>
        <table className="rs-run rs-glance">
          <thead><tr><th>Time</th><th>Block</th><th>Owner</th><th>Technology and materials</th><th>Output</th></tr></thead>
          <tbody>{RUN.map((b) => [
            <tr key={b.id}>
              <td className="rs-t">{b.t}<small>to {b.end}</small></td>
              <td><b>{b.title}</b></td>
              <td className="rs-owner">To assign</td>
              <td>{RUN_NOTES[b.id].kit}</td>
              <td>{RUN_NOTES[b.id].output}</td>
            </tr>,
            RUN_NOTES[b.id].after ? <tr key={b.id + '-after'} className="rs-after"><td className="rs-t">{b.end}</td><td colSpan={4}>{RUN_NOTES[b.id].after}</td></tr> : null,
          ])}</tbody>
        </table>
        <p className="rs-note">Owners are still to assign: nobody is named as presenting any part, so fill these in by hand once the team has agreed who runs what.</p>
      </section>

      <section className="rs-sec">
        <h2>The tasting table (check before 10:40)</h2>
        <ol className="rs-check">{TASTING_KIT.map((x) => <li key={x}>{x}</li>)}</ol>
      </section>

      <section className="rs-sec">
        <h2>The run of show</h2>
        <table className="rs-run">
          <thead><tr><th>Time</th><th>Block and scenes</th><th>What happens</th></tr></thead>
          <tbody>{RUN.map((b) => (
            <tr key={b.id}>
              <td className="rs-t">{b.t}<small>to {b.end}</small></td>
              <td><b>{b.title}</b>{b.obj && <em>Objective {b.obj}</em>}<small>{RUN_NOTES[b.id].slides}</small></td>
              <td>{RUN_NOTES[b.id].does}</td>
            </tr>
          ))}</tbody>
        </table>
      </section>

      <div className="rs-two">
        <section className="rs-sec">
          <h2>After the morning</h2>
          <ol className="rs-check">{AFTER.map((x) => <li key={x}>{x}</li>)}</ol>
        </section>
        <section className="rs-sec">
          <h2>Before November 9: still to confirm</h2>
          <ol className="rs-check">{CONFIRM.map((x) => <li key={x}>{x}</li>)}</ol>
        </section>
      </div>
      <p className="sc-foot">Confidential. Keys in the presentation: right arrow, space or click to go on (clicks don’t move on while there are boxes to type in); left arrow to go back; ] for the next part and [ for the previous one; S to skip the optional slides; Home for the start; End for Lunch, which skips the film; F for full screen; P for the presenter view; N for the talking points on the TV itself; B to blank the screen. On THE FLAVOR RACE, space or K pauses and plays and R starts it again. The same keys work in the presenter view. If the page reloads, it picks up where the session left off.</p>
    </main>
  );
}
