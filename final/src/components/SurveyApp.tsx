'use client';
// The pre-brief: a personal invitation. The film, a letter, then the four quick questions. Everything after them is
// optional reading in plain lists: why we're here, the morning in Ross's words, the seven trends and three things to
// think about. Answers land in the live session and open the morning on the "Your pre-brief answers" scene. Prints to a
// link-free PDF. Distilled on November 2: no orb, no flip cards or envelopes, no labels over headings.
import { useEffect, useRef, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { SURVEY, EVENT, FILM, OBJECTIVES, RUN, THINK, SIGNALS, GAP, ROSS_GOAL, CITE, TEAM } from '@/lib/content';
import { uid } from '@/lib/state';
import { PROFILE, DEFAULT_PROFILE, describe } from './Orb';
import FilmModal from './FilmModal';

// Each objective's words sit under the first block of the morning that answers it.
const firstOf = new Set(RUN.filter((b, i) => b.obj && RUN.findIndex((x) => x.obj === b.obj) === i).map((b) => b.id));
const askFor = (n?: string) => OBJECTIVES.find((o) => o.n === n)?.ask;
const STEPS = ['You', 'Consumer', 'Moment', 'Veto', 'Profile'];
// What a step says when Next is pressed before it's answered (the veto and the sliders can always go on).
const NEEDS = ['Add your first name so we know whose answers these are.', 'Pick the one that comes closest. You can change it later.', 'Pick the one that comes closest. You can change it later.', '', ''];

export default function SurveyApp({ code, k }: { code: string; k: string }) {
  const { send, status } = useSession(code, { k, interval: 4000 });
  const [a, setA] = useState({ name: '', consumer: '', moment: '', veto: '' });
  const [profile, setProfile] = useState<Record<string, number>>(DEFAULT_PROFILE);
  const [step, setStep] = useState(0);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const [sentAt, setSentAt] = useState(0);
  const moved = useRef(false); // focus follows the step only once someone has moved through the questions
  const [film, setFilm] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = 'a';
    const n = new URLSearchParams(location.search).get('n');
    if (n) setA((x) => ({ ...x, name: n.slice(0, 20) }));
    try { const saved = JSON.parse(localStorage.getItem(`pb-brief-${code}`) || 'null'); if (saved?.done) { setA(saved.a); setProfile(saved.profile); setDone(true); } } catch {}
  }, [code]);

  const first = a.name.trim().split(/\s+/)[0];
  const canNext = [!!first, !!a.consumer, !!a.moment, true, true][step];
  const go = (n: number) => { setErr(''); moved.current = true; setStep(n); };
  const next = () => { if (!canNext) { setErr(NEEDS[step]); (document.querySelector('.bw-wiz-body input, .bw-wiz-body button') as HTMLElement | null)?.focus(); return; } go(step + 1); };
  useEffect(() => {
    if (!moved.current) return;
    (document.querySelector('.bw-wiz-body input, .bw-wiz-body textarea, .bw-wiz-body button') as HTMLElement | null)?.focus({ preventScroll: true });
  }, [step]);
  useEffect(() => { if (done && sentAt) (document.getElementById('bw-thanks') as HTMLElement | null)?.focus({ preventScroll: true }); }, [done, sentAt]);
  // Sent once the server has answered since the answers went in; until then they wait on this device and resend.
  const sent = !!sentAt && status.online && status.lastOk > sentAt;
  const [, wake] = useState(0); // re-render when the browser goes on or off line, so the message keeps up
  useEffect(() => { const f = () => wake((n) => n + 1); addEventListener('online', f); addEventListener('offline', f); return () => { removeEventListener('online', f); removeEventListener('offline', f); }; }, []);
  const submit = () => {
    let pid = '';
    try { pid = JSON.parse(localStorage.getItem(`pb-me-${code}`) || 'null')?.pid; } catch {}
    if (!pid) { pid = uid(); try { localStorage.setItem(`pb-me-${code}`, JSON.stringify({ pid, name: first })); } catch {} }
    send('survey', { ...a, name: first, profile }, pid);
    try { localStorage.setItem(`pb-brief-${code}`, JSON.stringify({ done: true, a, profile })); } catch {}
    setSentAt(Date.now()); setDone(true);
  };
  // When the film ends, the page goes straight to the four questions it asks for, with the first one ready to answer.
  const toQuestions = () => {
    const el = document.getElementById('homework'); if (!el) return;
    el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => (el.querySelector('.bw-wiz-body input, .bw-wiz-body textarea, .bw-wiz-body button, .bw-done button') as HTMLElement | null)?.focus({ preventScroll: true }), 700);
  };

  return (
    <main className="brief-web" data-theme="a">
      <header className="bw-hero">
        <video autoPlay muted loop playsInline poster="/media/opening-poster.jpg"><source media="(min-width: 701px), (orientation: landscape)" src="/media/loop.mp4" type="video/mp4" /><source src="/media/loop-portrait.mp4" type="video/mp4" /></video>
        <img className="bw-poster" src="/media/opening-poster.jpg" alt="" />
        <div className="bw-shade" />
        <div className="bw-hero-in">
          <p className="bw-hi">{first ? `${first}, you’re invited.` : 'You’re invited.'}</p>
          <h1>The Future<br /><em>of Freshness</em></h1>
          <p>{EVENT.dateLine} · {EVENT.room} room, {EVENT.city}</p>
          <div className="bw-hero-go">
            <button className="bw-play" onClick={() => setFilm(true)}><span />Watch the film · {FILM.brief.length}</button>
            <a className="bw-skip" href="#homework" onClick={(e) => { e.preventDefault(); toQuestions(); }}>Skip to the four questions</a>
          </div>
        </div>
      </header>

      <section className="bw-sec bw-letter-sec" aria-label="A letter from The Flavor Factory">
        <p className="bw-letter">{first ? `Dear ${first},` : 'Hello,'}</p>
        <p className="bw-letter">In July your team came out to Norco and saw how we make flavor. On November 9 it’s our turn to come to Princeton. We’ll bring what we know about flavor, what we’re seeing in the market, the trends we’re watching and the innovation work we’ve been doing, all of it aimed at the goal in {first.toLowerCase() === 'ross' ? 'your' : 'Ross’s'} invitation: <em>“{ROSS_GOAL.lead.slice(ROSS_GOAL.lead.indexOf('new flavor'))} {ROSS_GOAL.loyal} {ROSS_GOAL.joiner} {ROSS_GOAL.fresh}”</em></p>
        <p className="bw-letter">We’ve built the morning around your four objectives. We’re also bringing four samples from our development bench, made in the TheraBreath bases you sent us. You’ll taste them blind and score them on your phone, and we’ll all vote from our phones a few more times along the way. By noon, we’d like to agree on what to develop first, who owns it and when the next samples are due. Afterwards we’ll write it all up as <em>The Flavor Playbook</em> and send it to everyone who was there.</p>
        <p className="bw-letter">You’ll meet four of us from The Flavor Factory: {TEAM.map((t, i) => `${i === TEAM.length - 1 ? 'and ' : ''}${t.name}, ${t.title}`).join('; ')}.</p>
        <p className="bw-letter">Just below are four quick questions, and we’ll open the morning with everyone’s answers. They take about five minutes. The rest of the page is there if you’d like more to read on the way in.</p>
        <p className="bw-sign"><img src="/img/tff-logo.webp" alt="The Flavor Factory" width={1200} height={264} />The Flavor Factory team</p>
      </section>

      <section className="bw-sec bw-home" id="homework" aria-labelledby="bw-q">
        <h2 id="bw-q">Four quick questions</h2>
        <p className="bw-expect">They take about five minutes. Everything below them is optional.</p>
        {done ? (
          <div className="bw-done">
            <h3 id="bw-thanks" tabIndex={-1}>Thank you, {first}.</h3>
            <p>{describe(profile)}</p>
            <p className={'bw-sent' + (sent || !sentAt ? ' ok' : '')} role="status" aria-live="polite">
              {!sentAt || sent ? 'Your answers are in. We’ll share everyone’s when the morning starts.' : status.online && navigator.onLine ? 'Sending your answers…' : 'Saved on this device. They’ll send as soon as you’re back online, so there’s no need to answer again.'}
            </p>
            <div className="bw-done-row">
              <button className="bw-link" onClick={() => { setDone(false); setSentAt(0); moved.current = false; setStep(0); }}>Change my answers</button>
            </div>
          </div>
        ) : (
          <div className="bw-wiz">
            <div className="bw-wiz-top">
              <ol className="bw-dots" aria-label={`Question ${Math.min(step, 4) || 1} of 4`}>{STEPS.map((l, i) => <li key={l}><button className={i === step ? 'on' : i < step ? 'past' : ''} aria-current={i === step ? 'step' : undefined} disabled={i > step} onClick={() => i < step && go(i)}><i />{l}</button></li>)}</ol>
            </div>
            <div className="bw-wiz-body" key={step}>
              {step === 0 && <label className="rm-field"><span>First, what should we call you?</span><input value={a.name} placeholder="Your first name" autoComplete="given-name" aria-invalid={!!err} aria-describedby={err ? 'bw-err' : undefined} onChange={(e) => { setErr(''); setA({ ...a, name: e.target.value.slice(0, 20) }); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); next(); } }} /></label>}
              {step === 1 && <div className="rm-field" role="group" aria-labelledby="bw-q1" aria-describedby={err ? 'bw-err' : undefined}><span id="bw-q1">{SURVEY.consumer.q}</span><div className="bw-tiles">{SURVEY.consumer.options.map((o) => <button key={o} className={a.consumer === o ? 'on' : ''} aria-pressed={a.consumer === o} onClick={() => { setA({ ...a, consumer: o }); setErr(''); setTimeout(() => go(2), 280); }}>{o}</button>)}</div></div>}
              {step === 2 && <div className="rm-field" role="group" aria-labelledby="bw-q2" aria-describedby={err ? 'bw-err' : undefined}><span id="bw-q2">{SURVEY.moment.q}</span><div className="bw-tiles">{SURVEY.moment.options.map((o) => <button key={o} className={a.moment === o ? 'on' : ''} aria-pressed={a.moment === o} onClick={() => { setA({ ...a, moment: o }); setErr(''); setTimeout(() => go(3), 280); }}>{o}</button>)}</div></div>}
              {step === 3 && <label className="rm-field"><span>{SURVEY.veto.q}</span><textarea rows={3} value={a.veto} placeholder="Optional. If you answer, it goes on screen without your name." onChange={(e) => setA({ ...a, veto: e.target.value.slice(0, 140) })} /></label>}
              {step === 4 && <div className="bw-sliders" role="group" aria-labelledby="bw-q4"><span className="bw-field-l" id="bw-q4">Slide each one toward how you like your freshness.</span>{PROFILE.map((x) => (
                <label key={x.id} className="rm-dial"><small><i>{x.l}</i><i>{x.r}</i></small><input type="range" min={1} max={5} step={1} value={profile[x.id]} aria-label={`From ${x.l} to ${x.r}`} aria-valuetext={`${profile[x.id]} of 5, ${profile[x.id] < 3 ? 'toward ' + x.l : profile[x.id] > 3 ? 'toward ' + x.r : 'in between'}`} onChange={(e) => setProfile({ ...profile, [x.id]: Number(e.target.value) })} /></label>
              ))}<p className="bw-desc">{describe(profile)}</p></div>}
              {err && <p className="bw-err" id="bw-err" role="alert">{err}</p>}
            </div>
            <div className="bw-wiz-nav">
              {step > 0 && <button className="bw-link" onClick={() => go(step - 1)}>Back</button>}
              {step < 4 ? <button className="rm-btn" aria-disabled={!canNext} onClick={next}>{step === 3 && !a.veto ? 'Skip' : 'Next'}</button>
                : <button className="rm-btn" onClick={submit}>Send my answers</button>}
            </div>
          </div>
        )}
        <p className="bw-print-only">You’ll find the questions on the web version of this page, through your personal invitation link. We’ll share the answers at the start of the morning.</p>
      </section>

      <section className="bw-sec bw-more" aria-labelledby="bw-more">
        <h2 id="bw-more">If you’d like more to read</h2>
        <p className="bw-expect">For the way in, or for later. None of it needs an answer.</p>

        <div className="bw-part"><h3>Why we’re here</h3>
        <p className="bw-p">TheraBreath took the burn out of mouthwash. The next job is giving more people a reason to want it. Today {GAP.tb}% of US households buy TheraBreath, against {GAP.category}% for mouthwash, which leaves 86 of every 100 who don’t buy it yet.</p>
        <p className="bw-src">Source: {CITE.q2call.src}</p></div>

        <div className="bw-part"><h3>The morning</h3>
        <ol className="bw-agenda">{RUN.map((b) => (
          <li key={b.id}><time>{b.t}</time><div><b>{b.title}</b>{firstOf.has(b.id) && <q>{askFor(b.obj)}</q>}</div></li>
        ))}</ol></div>

        <div className="bw-part"><h3>Seven trends</h3>
        <p className="bw-p">On the day, everyone picks the three that matter most.</p>
        <ol className="bw-signals">{SIGNALS.map((x) => <li key={x.id}><b>{x.title}</b><p>{x.so}</p></li>)}</ol></div>

        <div className="bw-part"><h3>Three things to think about on the way in</h3>
        <ol className="bw-think">{THINK.map((x, i) => <li key={i}>{x}</li>)}</ol></div>
      </section>

      <footer className="bw-foot">
        <p className="bw-p">By noon, we’d like a short list of what to develop, with owners and dates.</p>
        <p className="bw-p">{EVENT.dateLine}. {EVENT.room} room, {EVENT.place}. Bring your phone: you’ll use it to score the samples and vote.</p>
        <button className="bw-link bw-pdf" onClick={() => print()}>Save this pre-brief as a PDF</button>
        <p className="bw-conf">Confidential. The samples are development work made just for this session. They aren’t finished products, and nothing on this page is a claim or a commercial formula. Please keep this page and the write-up within the group.</p>
      </footer>
      {film && <FilmModal file={FILM.brief.file} q={`?c=${encodeURIComponent(code)}&k=${encodeURIComponent(k)}`} onClose={() => setFilm(false)} onEnd={() => { setFilm(false); toQuestions(); }} />}
    </main>
  );
}
