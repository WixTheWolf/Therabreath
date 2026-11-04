import { EVENT, RUN, SAMPLES, NEXT_STEPS, TASTING_KIT } from '@/lib/content';
import { RUN_NOTES, EXAMPLES, BEHIND, SLIDES } from '@/lib/runNotes';
import { SLIDE_MIN, SLIDE_TIMES } from '@/lib/slideTimes';
import { SCENES } from '@/lib/scenes';
import { titleOf } from '@/lib/sceneNotes';
import { SEALED } from '@/lib/sealed';
import PrintButton from '@/app/scorecard/PrintButton';

export const metadata = { title: 'Run sheet' };

// The hosts’ run sheet: one printout for The Flavor Factory team, behind the team link. Not for handing out.
// The run of show comes from RUN, the same source as the agenda and the presentation's chapter times.
const FILM_AT = SCENES.findIndex((x) => x.id === 'film') + 1;
const fresh = SAMPLES.filter((x) => x.base.startsWith('Fresh')).map((x) => x.code).join(' and ');
const kids = SAMPLES.filter((x) => x.base.startsWith('Kids')).map((x) => x.code).join(' and ');

const SETUP = [
  'Connect the laptop to the TV as an extended display, not a mirror. Open the team link, then Present on the day (/host), drag that window to the TV and press F for full screen. Then press P: the presenter view opens in its own window. Keep it on the laptop’s screen. It has the talking points, the time in Princeton against this sheet, and buttons that move the presentation. Only this laptop should open the presentation on the day, because it moves everyone’s phones. (Church & Dwight’s password can’t open it.) If the TV will only mirror, skip the presenter view and use this sheet.',
  'Phones: people join by scanning the code on the first screen. Phones use their own data, so the room Wi-Fi only matters for the laptop. Ross offered to help us get on the network. If it fails, present from the backup PDF and the film file on the laptop, without the voting.',
  'Film backup: the day before, download THE FLAVOR RACE from the team page (flavor-race.mp4: 2:24, 2560 × 1440, with sound) and keep it on the laptop’s desktop. Open it once to check it plays. If the site won’t play it on the day, play the file from there, full screen, with the sound up. The opening film isn’t shown in the room: we open with our own welcome.',
  `Sound and picture check, before anyone arrives and on the rehearsal session so nobody’s phone moves: open /host?code=REHEARSE on the TV, press F for full screen, then Go to THE FLAVOR RACE (slide ${FILM_AT}) in the presenter view, or open /host?code=REHEARSE#${FILM_AT}. Check it fills the screen, play ten seconds through the speakers and set the volume, and press R to check it starts again. Then close that window and open Present on the day. Keep the film off the TV once people start arriving.`,
  'Rehearse on /host?code=REHEARSE (the team page links to it), never on /host itself, so rehearsal votes stay out of the live session. Leave the live session FOF1109 alone the night before: it holds everyone’s pre-brief answers, and the team page shows how many are in.',
  `Samples: ${kids} in the Kids base and ${fresh} in the Fresh Breath base. During setup, pre-pour them into cups coded A to D on covered trays, out of sight, and bring the trays out as THE FLAVOR RACE ends. Set out water to rinse, cups to spit into and napkins.`,
  'Join one loaner phone or tablet to the live session at setup (scan the code on the arrival screen), for anyone who arrives without a phone. Keep it charged and on the table.',
  'If we’re running late, see If we run behind below. The presenter view shows how far over the current part is and whether the short version is on.',
  'Nothing gets typed on the day. On the vote slides, the presenter view has a button to add a hand vote for each option, and one to take it back. The concept cards and Now, Next, Later are filled in by tapping options.',
  'Paper scorecards are the last resort (print a few from /scorecard, with pens). On the tasting, tap +1 paper card in the presenter view for each one handed in, and -1 for a mistake. The cards are typed in after the morning.',
];
const AFTER = [
  'Before you close the laptop, open /host?results=1 and print it to PDF: the votes, the scores, the concepts, the white-space marks and Now, Next, Later as we left them. The Playbook write-up (/host/writeup) fills in from the same session.',
  'Collect the paper scorecards and type them in on /host/cards (the team page links to it). Their scores join the results page and the write-up as each one is saved.',
  'In the write-up, press Edit what’s to confirm: finish the drafted flavor briefs and fill in anything still To confirm. Both are highlighted until they’re done.',
  ...NEXT_STEPS.map((n) => `${n.t}: ${n.d}`),
];
const CONFIRM = [
  'Ryan to review the Flavor School slide (slide 9): his wording, merged onto one slide in three builds, now naming sodium chlorite rather than OXYD-8, with formulating and protecting the flavor.',
  'Check the bottles and flavor names on Our flavors in your range (slide 3) against our portfolio record. Names only: no usage levels or flavor codes.',
  'Review the drafted concept cards and the option lists in src/lib/conceptLibrary.ts. Every starter card is marked DRAFT until we’ve checked it.',
  `The bases: ${SEALED.samples.A.name} and the ${SEALED.samples.B.name} in the Kids base, ${SEALED.samples.C.name} and ${SEALED.samples.D.name} in the Fresh Breath base.`,
  'The dates on What happens next, including the January 2027 review.',
  'A video call with Ross before the day. He asked to connect once or twice ahead of time.',
  `Whether to tell the room what’s in the ${SEALED.samples.B.name} once the names go up. The presentation, the phones and the write-up show its name but not its contents, so the room can keep guessing.`,
  'That the samples were made in the unflavored bases Church & Dwight sent, as the front door says.',
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
              <td className="rs-owner" />
              <td data-l="Technology and materials">{RUN_NOTES[b.id].kit}</td>
              <td data-l="Output">{RUN_NOTES[b.id].output}</td>
            </tr>,
            RUN_NOTES[b.id].after ? <tr key={b.id + '-after'} className="rs-after"><td className="rs-t">{b.end}</td><td colSpan={4}>{RUN_NOTES[b.id].after}</td></tr> : null,
          ])}</tbody>
        </table>
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
              <td data-l="What happens">{RUN_NOTES[b.id].does}</td>
            </tr>
          ))}</tbody>
        </table>
      </section>

      <section className="rs-sec rs-slides">
        <h2>Slide by slide</h2>
        <p className="rs-lead">Planned minutes, so each part ends on time; the presenter view shows each slide’s planned window. Numbers match the presenter view’s Go to list. Builds marked optional are the ones S skips. Your pre-brief answers (5) shows only once someone has answered; if nobody has, its four minutes are spare.</p>
        <table className="rs-run rs-slide">
          <thead><tr><th>Planned</th><th>#</th><th>Slide</th><th>On screen, click by click</th><th>Ask the room, and the phones</th></tr></thead>
          <tbody>{RUN.map((b) => [
            <tr key={b.id} className="rs-part"><td colSpan={5}>{b.t} to {b.end} · {b.title}{b.obj ? ` · Objective ${b.obj}` : ''}</td></tr>,
            ...SCENES.filter((s) => s.block === b.id).map((s) => {
              const p = SLIDES[s.id], t = SLIDE_TIMES[s.id], min = SLIDE_MIN[s.id];
              return (
                <tr key={s.id}>
                  <td className="rs-t">{min ? <>{t.from}<small>{min} min</small></> : <>Before<small>10:00</small></>}</td>
                  <td className="rs-n">{s.n + 1}</td>
                  <td><b>{titleOf(s)}</b>{s.optional && <em>Optional</em>}{s.skip?.length ? <em>Optional {s.skip.length === 1 ? 'build' : 'builds'}</em> : null}{s.id === 'prework' && <em>If answered</em>}</td>
                  <td data-l="On screen">{p.clicks && <ul className="rs-clicks">{p.clicks.map((c, i) => <li key={i}>{i > 0 && !c.startsWith('Clicks') && <span className="num">{i}</span>}{c}</li>)}</ul>}</td>
                  <td data-l="Ask the room">{p.ask && <span>{p.ask}</span>}{p.phones && <i>Phones: {p.phones}</i>}</td>
                </tr>
              );
            }),
          ])}</tbody>
        </table>
      </section>

      <section className="rs-sec">
        <h2>If we run behind</h2>
        <ol className="rs-list">{BEHIND.map((x) => <li key={x}>{x}</li>)}</ol>
      </section>

      <section className="rs-sec rs-examples">
        <h2>If the room needs a starting point: two example concepts</h2>
        <p className="rs-lead">Both are cards in the concept library: swap one in from the presenter view only if the room is stuck, and let them change it. The assumptions are ours, not facts.</p>
        <div className="rs-two">{EXAMPLES.map((x) => (
          <div key={x.name} className="rs-ex">
            <b>{x.name}</b>
            <dl>
              <div><dt>For</dt><dd>{x.consumer}</dd></div>
              <div><dt>When</dt><dd>{x.occasion}</dd></div>
              <div><dt>Flavor direction</dt><dd>{x.direction}</dd></div>
              <div><dt>How it feels</dt><dd>{x.sensory}</dd></div>
              <div><dt>What we’d test</dt><dd>{x.test}</dd></div>
            </dl>
            <ul>{x.assume.map((a) => <li key={a}>{a}</li>)}</ul>
          </div>
        ))}</div>
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
      <p className="sc-foot">Confidential. Keys in the presentation: right arrow, space or click to go on; left arrow to go back; ] for the next part and [ for the previous one; S for the short version, which skips the optional builds; Home for the start; End for the thank-you card; F for full screen; P for the presenter view; N for the talking points on the TV itself; B to blank the screen. On THE FLAVOR RACE, space or K pauses and plays and R starts it again. The same keys work in the presenter view. If the page reloads, it picks up where the session left off.</p>
    </main>
  );
}

