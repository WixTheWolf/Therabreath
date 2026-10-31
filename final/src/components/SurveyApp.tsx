'use client';
// The pre-brief: a personal invitation. The film, a letter, why we're here in three numbers, then the four quick questions
// (they build a freshness orb). Everything after the questions is optional reading: how the morning decides, seven
// signals, Ross's objectives, the four directions as cards to open, the morning on one line per part. Answers land in
// the live session and open the morning on the "Your pre-brief answers" scene. Prints to a link-free PDF.
import { useEffect, useRef, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { SURVEY, EVENT, FILM, OBJECTIVES, PRIMARY_TERRITORIES as PLATFORMS, AGENDA, THINK, SIGNALS, GAP, ROSS_GOAL, CITE, TEAM } from '@/lib/content';
import { uid } from '@/lib/state';
import Orb, { PROFILE, DEFAULT_PROFILE, describe } from './Orb';
import FilmModal from './FilmModal';
import Decisions from './Decisions';

const QUESTIONS = ['What’s changing?', 'Where could flavor go?', 'What could we make?', 'What do we do first?'];
const STEPS = ['You', 'Consumer', 'Moment', 'Veto', 'Profile'];
// What a step says when Next is pressed before it's answered (the veto and the sliders can always go on).
const NEEDS = ['Add your first name so we know whose answers these are.', 'Pick the one that comes closest. You can change it later.', 'Pick the one that comes closest. You can change it later.', '', ''];

export default function SurveyApp({ code, k }: { code: string; k: string }) {
  const { send, status } = useSession(code, { k, interval: 4000 });
  const [a, setA] = useState({ name: '', consumer: '', moment: '', veto: '' });
  const [profile, setProfile] = useState<Record<string, number>>(DEFAULT_PROFILE);
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState(0);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const [sentAt, setSentAt] = useState(0);
  const moved = useRef(false); // focus follows the step only once someone has moved through the questions
  const [film, setFilm] = useState(false);
  const [prog, setProg] = useState(0);
  const orb = useRef<HTMLCanvasElement>(null);
  const agenda = useRef<HTMLOListElement>(null);
  const [fill, setFill] = useState(0);

  useEffect(() => {
    document.documentElement.dataset.theme = 'a';
    const n = new URLSearchParams(location.search).get('n');
    if (n) setA((x) => ({ ...x, name: n.slice(0, 20) }));
    try { const saved = JSON.parse(localStorage.getItem(`pb-brief-${code}`) || 'null'); if (saved?.done) { setA(saved.a); setProfile(saved.profile); setDone(true); } } catch {}
    const on = () => {
      const h = document.documentElement; setProg(h.scrollTop / Math.max(1, h.scrollHeight - innerHeight));
      const el = agenda.current; if (el) { const r = el.getBoundingClientRect(); setFill(Math.max(0, Math.min(1, (innerHeight * 0.6 - r.top) / r.height))); }
    };
    on(); addEventListener('scroll', on, { passive: true });
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('in')), { threshold: 0.15 });
    document.querySelectorAll('.bw-rise').forEach((el) => io.observe(el));
    return () => { removeEventListener('scroll', on); io.disconnect(); };
  }, [code]);

  const first = a.name.trim().split(/\s+/)[0];
  const nOpen = Object.values(opened).filter(Boolean).length;
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
  const saveOrb = () => { const c = orb.current; if (!c) return; const l = document.createElement('a'); l.download = `freshness-${first || 'me'}.png`; l.href = c.toDataURL('image/png'); l.click(); };

  return (
    <main className="brief-web" data-theme="a">
      <div className="bw-prog" aria-hidden="true"><i style={{ width: `${prog * 100}%` }} /></div>

      <header className="bw-hero">
        <video autoPlay muted loop playsInline poster="/media/opening-poster.jpg"><source media="(min-width: 701px), (orientation: landscape)" src="/media/loop.mp4" type="video/mp4" /><source src="/media/loop-portrait.mp4" type="video/mp4" /></video>
        <img className="bw-poster" src="/media/opening-poster.jpg" alt="" />
        <div className="bw-shade" />
        <div className="bw-hero-in">
          <div className="k">{EVENT.lockup}</div>
          <p className="bw-hi">{first ? `${first}, you’re invited.` : 'You’re invited.'}</p>
          <h1>The Future<br /><em>of Freshness</em></h1>
          <p>{EVENT.dateLine} · {EVENT.room} room</p>
          <div className="bw-hero-go">
            <button className="bw-play" onClick={() => setFilm(true)}><span />Watch the film · {FILM.brief.length}</button>
            <a className="bw-skip" href="#homework" onClick={(e) => { e.preventDefault(); toQuestions(); }}>Skip to the four questions</a>
          </div>
        </div>
      </header>

      <section className="bw-sec bw-rise">
        <h2 className="k">A letter from The Flavor Factory</h2>
        <p className="bw-letter">{first ? `Dear ${first},` : 'Hello,'}</p>
        <p className="bw-letter">In July your team came out to Norco and saw how we make flavor. On November 9 it’s our turn to come to Princeton. We’ll bring what we know about flavor, what we’re seeing in the market, the trends we’re watching and the innovation work we’ve been doing, all of it aimed at the goal in {first.toLowerCase() === 'ross' ? 'your' : 'Ross’s'} invitation: <em>“{ROSS_GOAL.lead.slice(ROSS_GOAL.lead.indexOf('new flavor'))} {ROSS_GOAL.loyal} {ROSS_GOAL.joiner} {ROSS_GOAL.fresh}”</em></p>
        <p className="bw-letter">We’ve built the morning around your four objectives. We’re also bringing four samples from our development bench, made in the TheraBreath bases you sent us. You’ll taste them blind and score them on your phone, and we’ll all vote from our phones a few more times along the way. By noon, we’d like to agree on what to develop first, who owns it and when the next samples are due. Afterwards we’ll write it all up as <em>The Flavor Playbook</em> and send it to everyone who was there.</p>
        <p className="bw-letter">You’ll meet four of us from The Flavor Factory: {TEAM.map((t, i) => `${i === TEAM.length - 1 ? 'and ' : ''}${t.name}, ${t.title}`).join('; ')}.</p>
        <p className="bw-letter">Just below are four quick questions, and we’ll open the morning with everyone’s answers. They take about five minutes. The rest of the page is there if you’d like more to read on the way in.</p>
        <p className="bw-sign"><img src="/img/tff-logo.webp" alt="The Flavor Factory" width={1200} height={264} />The Flavor Factory team</p>
      </section>

      <section className="bw-sec bw-rise">
        <div className="k">Why we’re here</div>
        <h2 className="bw-thesis">TheraBreath took the burn out of mouthwash.<br /><em>The next job is giving more people a reason to want it.</em></h2>
        <div className="bw-math">
          <div><b>25.3%</b><span>TheraBreath’s share of US mouthwash in Q2 2026, up 4.5 points. That makes it number 2.</span><small>{CITE.q2call.src}</small></div>
          <div><b>{GAP.tb}%</b><span>of US households buy TheraBreath, compared with {GAP.category}% for the category. That leaves 86 of every 100 who don’t buy it yet.</span><small>{CITE.q2call.src}</small></div>
          <div><b>54%</b><span>of American consumers are looking for a milder-tasting option.</span><small>Kenvue press release, June 2, 2026, citing a 2024 Kenvue / Suzy survey (n = 1,019)</small></div>
        </div>
        <details className="bw-notes"><summary>Source notes</summary>
          <p><b>25.3%, 14% and 65%.</b> {CITE.q2call.src}. {CITE.q2call.basis}</p>
          <p><b>54%.</b> <a href={CITE.kenvue.url} target="_blank" rel="noreferrer noopener">{CITE.kenvue.src}</a>. {CITE.kenvue.basis}</p>
        </details>
      </section>

      <section className="bw-sec bw-home bw-rise in" id="homework" aria-labelledby="bw-q">
        <h2 className="k" id="bw-q">Before you come: four quick questions</h2>
        <p className="bw-expect">Answer these four questions first. The rest is optional pre-reading.</p>
        {done ? (
          <div className="bw-done">
            <Orb ref={orb} profile={profile} size={280} />
            <h3 id="bw-thanks" tabIndex={-1}>Thank you, {first}.</h3>
            <p>{describe(profile)}</p>
            <p className={'bw-sent' + (sent || !sentAt ? ' ok' : '')} role="status" aria-live="polite">
              {!sentAt || sent ? 'Your answers are in. We’ll share everyone’s when the morning starts.' : status.online && navigator.onLine ? 'Sending your answers…' : 'Saved on this device. They’ll send as soon as you’re back online, so there’s no need to answer again.'}
            </p>
            <div className="bw-done-row">
              <button className="rm-btn" onClick={saveOrb}>Save my freshness orb</button>
              <button className="bw-link" onClick={() => { setDone(false); setSentAt(0); moved.current = false; setStep(0); }}>Change my answers</button>
            </div>
          </div>
        ) : (
          <div className="bw-wiz">
            <div className="bw-wiz-top">
              <ol className="bw-dots" aria-label={`Question ${Math.min(step, 4) || 1} of 4`}>{STEPS.map((l, i) => <li key={l}><button className={i === step ? 'on' : i < step ? 'past' : ''} aria-current={i === step ? 'step' : undefined} disabled={i > step} onClick={() => i < step && go(i)}><i />{l}</button></li>)}</ol>
              <Orb ref={orb} profile={profile} size={step === 4 ? 200 : 110} className="bw-wiz-orb" />
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

      <div className="bw-optional bw-sec" role="note"><b>Optional pre-reading</b><span>For the way in, or for later. None of it needs an answer.</span></div>

      <Decisions className="bw-sec bw-rise" />

      <section className="bw-sec bw-rise">
        <h2 className="k">Seven trends · on the day, everyone picks the three that matter most</h2>
        <ol className="bw-signals">{SIGNALS.map((x) => <li key={x.id}><span className="num">{String(x.n).padStart(2, '0')}</span><b>{x.title}</b><p>{x.so}</p></li>)}</ol>
      </section>

      <section className="bw-sec bw-rise">
        <h2 className="k">Ross’s four objectives, in his words</h2>
        <div className="bw-qcards">{OBJECTIVES.map((o, i) => (
          <article key={o.n} className="bw-qcard">
            <div className="bw-qf"><span className="num">{o.n}</span><b>{QUESTIONS[i]}</b></div>
            <div className="bw-qb"><p>“{o.ask}”</p><small>{o.act} · {o.chapter}</small></div>
          </article>
        ))}</div>
      </section>

      <section className="bw-sec bw-rise">
        <h2 className="k">Four directions for flavor<span className="bw-tap"> · tap a card to open it</span></h2>
        <p className="bw-count" aria-live="polite">{nOpen === PLATFORMS.length ? 'You’ve opened all four. The samples themselves stay under wraps until the tasting.' : `${nOpen} of ${PLATFORMS.length} opened`}</p>
        <div className="bw-env-grid bw-four">{PLATFORMS.map((t, i) => {
          const o = !!opened[t.id]; const light = t.dark || t.id === 'fruit';
          return (
            <button key={t.id} className={'bw-env' + (o ? ' open' : '')} onClick={() => setOpened({ ...opened, [t.id]: !o })} style={{ ['--c1' as any]: t.palette[0], ['--c2' as any]: t.palette[1], ['--c3' as any]: t.palette[2] || t.palette[1], ['--i' as any]: i }} aria-expanded={o}>
              <div className="bw-env-card" style={{ color: light ? '#fff' : '#0B1B2B' }}>
                <span className="num">0{t.n}</span><b>{t.name}</b><p>{t.promise}</p>
                <em>{t.q}</em>
              </div>
              <div className="bw-env-body" aria-hidden="true"><span className="num">0{t.n}</span><b>{t.name}</b></div>
              <div className="bw-seal" aria-hidden="true">TB</div>
            </button>
          );
        })}</div>
      </section>

      <section className="bw-sec bw-rise">
        <h2 className="k">The morning</h2>
        <ol className="bw-timeline" ref={agenda} style={{ ['--f' as any]: fill }}>{AGENDA.map(([t, l, o], i) => <li key={t} className={fill * AGENDA.length > i ? 'on' : ''}><span className="num">{t}</span><span>{l}{o && <em className="bw-o">Objective {o}</em>}</span></li>)}</ol>
      </section>

      <section className="bw-sec bw-rise">
        <h2 className="k">Three things to think about on the way in</h2>
        <div className="bw-think">{THINK.map((x, i) => <div key={i}><span className="num">{i + 1}</span><p>{x}</p></div>)}</div>
      </section>

      <footer className="bw-foot">
        <p className="bw-promise">By noon, we’d like a short list of what to develop, <em>with owners and dates.</em></p>
        <div className="bw-logi"><div><small>When</small>{EVENT.date}<br />{EVENT.time} ET</div><div><small>Where</small>{EVENT.room} room, Church &amp; Dwight<br />469 N Harrison St, Princeton, NJ 08540</div><div><small>Bring</small>Your phone. You’ll use it to score the samples and vote.</div></div>
        <button className="bw-link bw-pdf" onClick={() => print()}>Save this pre-brief as a PDF</button>
        <p className="bw-conf">Confidential. The samples are development work made just for this session. They aren’t finished products, and nothing on this page is a claim or a commercial formula. Please keep this page and the write-up within the group.</p>
      </footer>
      {film && <FilmModal file={FILM.brief.file} q={`?c=${encodeURIComponent(code)}&k=${encodeURIComponent(k)}`} onClose={() => setFilm(false)} onEnd={() => { setFilm(false); toQuestions(); }} />}
    </main>
  );
}
