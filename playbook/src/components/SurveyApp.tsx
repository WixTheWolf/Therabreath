'use client';
// The pre-brief: a personal invitation. The film, a letter, four questions, seven sealed envelopes to
// break open, the morning on one line per act, and two minutes of homework that builds a freshness orb.
// Answers land in the live session and open the workshop. Prints to a link-free PDF.
import { useEffect, useRef, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { SURVEY, EVENT, OBJECTIVES, TERRITORIES, AGENDA, THINK } from '@/lib/content';
import { uid } from '@/lib/state';
import Orb, { PROFILE, DEFAULT_PROFILE, describe } from './Orb';
import FilmModal from './FilmModal';

const QUESTIONS = ['What’s changing?', 'What could freshness become?', 'Where can flavor create growth?', 'What do we do with all of this?'];
const STEPS = ['You', 'Consumer', 'Moment', 'Veto', 'Profile'];

export default function SurveyApp({ code, k }: { code: string; k: string }) {
  const { send } = useSession(code, { k, interval: 4000 });
  const [a, setA] = useState({ name: '', consumer: '', moment: '', veto: '' });
  const [profile, setProfile] = useState<Record<string, number>>(DEFAULT_PROFILE);
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
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
  const submit = () => {
    let pid = '';
    try { pid = JSON.parse(localStorage.getItem(`pb-me-${code}`) || 'null')?.pid; } catch {}
    if (!pid) { pid = uid(); try { localStorage.setItem(`pb-me-${code}`, JSON.stringify({ pid, name: first })); } catch {} }
    send('survey', { ...a, name: first, profile }, pid);
    try { localStorage.setItem(`pb-brief-${code}`, JSON.stringify({ done: true, a, profile })); } catch {}
    setDone(true);
  };
  const saveOrb = () => { const c = orb.current; if (!c) return; const l = document.createElement('a'); l.download = `freshness-${first || 'me'}.png`; l.href = c.toDataURL('image/png'); l.click(); };

  return (
    <main className="brief-web" data-theme="a">
      <div className="bw-prog"><i style={{ width: `${prog * 100}%` }} /></div>

      <header className="bw-hero">
        <video autoPlay muted loop playsInline poster="/media/opening-poster.jpg"><source src="/media/loop.mp4" type="video/mp4" /></video>
        <img className="bw-poster" src="/media/opening-poster.jpg" alt="" />
        <div className="bw-shade" />
        <div className="bw-hero-in">
          <div className="k">{EVENT.lockup}</div>
          <p className="bw-hi">{first ? `${first}, you’re invited.` : 'You’re invited.'}</p>
          <h1>The Future<br /><em>of Freshness</em></h1>
          <p>{EVENT.date} · {EVENT.time} ET · {EVENT.room} room</p>
          <button className="bw-play" onClick={() => setFilm(true)}><span />Watch the 30-second film</button>
        </div>
      </header>

      <section className="bw-sec bw-rise">
        <div className="k">A letter from The Flavor Factory</div>
        <p className="bw-letter">{first ? `Dear ${first},` : 'Hello,'}</p>
        <p className="bw-letter">In July you came to Norco and saw how we work. On November 9 we come to you, with a question worth two hours: <em>what should TheraBreath taste like next?</em></p>
        <p className="bw-letter">You asked us for four things. We built the morning around them, and around you. You will taste, vote, argue, invent and engineer. By noon, the room will have written a Playbook, and your name will be on it.</p>
        <p className="bw-sign"><img src="/img/tff-logo.webp" alt="The Flavor Factory" />The Flavor Factory team</p>
      </section>

      <section className="bw-sec bw-rise">
        <div className="k">Four questions we will answer together<span className="bw-tap"> · tap each one</span></div>
        <div className="bw-qcards">{OBJECTIVES.map((o, i) => (
          <button key={o.n} className={'bw-qcard' + (flipped[i] ? ' flip' : '')} onClick={() => setFlipped({ ...flipped, [i]: !flipped[i] })}>
            <div className="bw-qf"><span className="num">{o.n}</span><b>{QUESTIONS[i]}</b><small>Tap for your brief</small></div>
            <div className="bw-qb"><small>{o.act}</small><p>{o.ask}</p><b>{o.chapter}</b></div>
          </button>
        ))}</div>
      </section>

      <section className="bw-sec bw-rise">
        <div className="k">Seven sealed worlds<span className="bw-tap"> · break a seal to peek</span></div>
        <p className="bw-count">{nOpen === 7 ? 'You have peeked at every world. The hero flavors are waiting in the room.' : `${nOpen} of 7 opened`}</p>
        <div className="bw-env-grid">{TERRITORIES.map((t, i) => {
          const o = !!opened[t.id]; const light = t.dark || t.id === 'fruit';
          return (
            <button key={t.id} className={'bw-env' + (o ? ' open' : '')} onClick={() => setOpened({ ...opened, [t.id]: !o })} style={{ ['--c1' as any]: t.palette[0], ['--c2' as any]: t.palette[1], ['--c3' as any]: t.palette[2] || t.palette[1], ['--i' as any]: i }} aria-label={`${t.name}, ${o ? 'opened' : 'sealed'}`}>
              <div className="bw-env-card" style={{ color: light ? '#fff' : '#0B1B2B' }}>
                <span className="num">0{t.n}</span><b>{t.name}</b><p>{t.promise}</p>
                <em>Hero flavor revealed November 9</em>
              </div>
              <div className="bw-env-body"><span className="num">0{t.n}</span><b>{t.name}</b></div>
              <div className="bw-seal">TB</div>
            </button>
          );
        })}</div>
      </section>

      <section className="bw-sec bw-rise">
        <div className="k">The morning</div>
        <ol className="bw-timeline" ref={agenda} style={{ ['--f' as any]: fill }}>{AGENDA.map(([t, l], i) => <li key={t} className={fill * AGENDA.length > i ? 'on' : ''}><span className="num">{t}</span>{l}</li>)}</ol>
      </section>

      <section className="bw-sec bw-home bw-rise" id="homework">
        <div className="k">Your two minutes of homework</div>
        {done ? (
          <div className="bw-done">
            <Orb ref={orb} profile={profile} size={280} />
            <h2>Thank you, {first}.</h2>
            <p>{describe(profile)} Your answers open the workshop, and your orb joins the room&rsquo;s on the screen.</p>
            <div className="bw-done-row">
              <button className="rm-btn" onClick={saveOrb}>Save my freshness orb</button>
              <button className="bw-link" onClick={() => { setDone(false); setStep(0); }}>Change my answers</button>
            </div>
          </div>
        ) : (
          <div className="bw-wiz">
            <div className="bw-wiz-top">
              <div className="bw-dots">{STEPS.map((l, i) => <button key={l} className={i === step ? 'on' : i < step ? 'past' : ''} onClick={() => i < step && setStep(i)}><i />{l}</button>)}</div>
              <Orb ref={orb} profile={profile} size={step === 4 ? 200 : 110} className="bw-wiz-orb" />
            </div>
            <div className="bw-wiz-body" key={step}>
              {step === 0 && <label className="rm-field"><span>First, what should we call you?</span><input value={a.name} placeholder="Your first name" onChange={(e) => setA({ ...a, name: e.target.value.slice(0, 20) })} /></label>}
              {step === 1 && <div className="rm-field"><span>{SURVEY.consumer.q}</span><div className="bw-tiles">{SURVEY.consumer.options.map((o) => <button key={o} className={a.consumer === o ? 'on' : ''} onClick={() => { setA({ ...a, consumer: o }); setTimeout(() => setStep(2), 280); }}>{o}</button>)}</div></div>}
              {step === 2 && <div className="rm-field"><span>{SURVEY.moment.q}</span><div className="bw-tiles">{SURVEY.moment.options.map((o) => <button key={o} className={a.moment === o ? 'on' : ''} onClick={() => { setA({ ...a, moment: o }); setTimeout(() => setStep(3), 280); }}>{o}</button>)}</div></div>}
              {step === 3 && <label className="rm-field"><span>{SURVEY.veto.q}</span><textarea rows={3} value={a.veto} placeholder="Optional. Shown on the screen without your name." onChange={(e) => setA({ ...a, veto: e.target.value.slice(0, 140) })} /></label>}
              {step === 4 && <div className="bw-sliders"><span className="bw-field-l">Set your freshness. Watch your orb take shape.</span>{PROFILE.map((x) => (
                <label key={x.id} className="rm-dial"><small><i>{x.l}</i><i>{x.r}</i></small><input type="range" min={1} max={5} step={1} value={profile[x.id]} onChange={(e) => setProfile({ ...profile, [x.id]: Number(e.target.value) })} /></label>
              ))}<p className="bw-desc">{describe(profile)}</p></div>}
            </div>
            <div className="bw-wiz-nav">
              {step > 0 && <button className="bw-link" onClick={() => setStep(step - 1)}>Back</button>}
              {step < 4 ? <button className="rm-btn" disabled={!canNext} onClick={() => setStep(step + 1)}>{step === 3 && !a.veto ? 'Skip' : 'Next'}</button>
                : <button className="rm-btn" onClick={submit}>Send my answers</button>}
            </div>
          </div>
        )}
        <p className="bw-print-only">Complete your two-minute homework from your personal invitation. Your answers open the workshop.</p>
      </section>

      <section className="bw-sec bw-rise">
        <div className="k">Three things to think about on the way in</div>
        <div className="bw-think">{THINK.map((x, i) => <div key={i}><span className="num">{i + 1}</span><p>{x}</p></div>)}</div>
      </section>

      <footer className="bw-foot">
        <p className="bw-promise">You will leave with a Playbook that has <em>your name</em> on it.</p>
        <div className="bw-logi"><div><small>When</small>{EVENT.date}<br />{EVENT.time} ET</div><div><small>Where</small>{EVENT.room} room<br />Church &amp; Dwight</div><div><small>Bring</small>Curiosity, and an appetite for something other than mint</div></div>
        <button className="bw-link bw-pdf" onClick={() => print()}>Save this pre-brief as a PDF</button>
        <div className="k">Confidential</div>
      </footer>
      {film && <FilmModal onClose={() => setFilm(false)} />}
    </main>
  );
}
