'use client';
// The pre-brief: a personal invitation, the film, the four questions, seven sealed territories,
// and two minutes of homework whose answers open the workshop.
import { useEffect, useRef, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { SURVEY, EVENT, OBJECTIVES, TERRITORIES } from '@/lib/content';
import { uid } from '@/lib/state';
import Orb, { PROFILE, DEFAULT_PROFILE, describe } from './Orb';

const QUESTIONS = ['What’s changing?', 'What could freshness become?', 'Where can flavor create growth?', 'What do we do with all of this?'];
const AGENDA = [
  ['10:00', 'The film, and why freshness is bigger than mint'],
  ['10:10', 'The Signals: what is changing'],
  ['10:30', 'Flavor School, and a molecule flight'],
  ['10:44', 'The Territories: seven worlds and a blind tasting'],
  ['11:07', 'The Moments: teams build concepts, then engineer them on The Bench'],
  ['11:41', 'The Playbook: what we do first, next and later'],
  ['11:54', 'The Playbook you built, with your name on it'],
];

export default function SurveyApp({ code, k }: { code: string; k: string }) {
  const { send } = useSession(code, { k, interval: 4000 });
  const [a, setA] = useState({ name: '', consumer: '', moment: '', veto: '' });
  const [profile, setProfile] = useState<Record<string, number>>(DEFAULT_PROFILE);
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);
  const orb = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    document.documentElement.dataset.theme = 'a';
    const n = new URLSearchParams(location.search).get('n');
    if (n) setA((x) => ({ ...x, name: n.slice(0, 20) }));
  }, []);
  const first = a.name.trim().split(/\s+/)[0];
  const ok = first && a.consumer && a.moment;
  const submit = () => {
    let pid = '';
    try { pid = JSON.parse(localStorage.getItem(`pb-me-${code}`) || 'null')?.pid; } catch {}
    if (!pid) { pid = uid(); try { localStorage.setItem(`pb-me-${code}`, JSON.stringify({ pid, name: first })); } catch {} }
    send('survey', { ...a, name: first, profile }, pid);
    setDone(true);
  };
  const saveOrb = () => { const c = orb.current; if (!c) return; const l = document.createElement('a'); l.download = `freshness-${first || 'me'}.png`; l.href = c.toDataURL('image/png'); l.click(); };

  return (
    <main className="brief-web" data-theme="a">
      <header className="bw-hero">
        <video autoPlay muted loop playsInline poster="/media/opening-poster.jpg"><source src="/media/loop.mp4" type="video/mp4" /></video>
        <div className="bw-shade" />
        <div className="bw-hero-in">
          <div className="k">{EVENT.lockup}</div>
          <h1>The Future<br /><em>of Freshness</em></h1>
          <p>{first ? `${first}, you’re invited.` : 'You’re invited.'} {EVENT.date} · {EVENT.time} · {EVENT.room} room</p>
        </div>
      </header>

      <section className="bw-sec">
        <div className="k">A letter from The Flavor Factory</div>
        <p className="bw-letter">{first ? `Dear ${first},` : 'Hello,'}</p>
        <p className="bw-letter">In July you came to Norco and saw how we work. On November 9 we come to you, with a question worth two hours: what should TheraBreath taste like next? You asked us for four things. We built the morning around them, and around you. You will taste, vote, argue, invent and engineer. By noon, the room will have written a Playbook, and your name will be on it.</p>
        <p className="bw-sign">The Flavor Factory team</p>
      </section>

      <section className="bw-sec">
        <div className="k">Four questions we will answer together</div>
        <ol className="bw-q">{OBJECTIVES.map((o, i) => <li key={o.n}><span className="num">{o.n}</span><div><b>{QUESTIONS[i]}</b><p>{o.ask}</p></div></li>)}</ol>
      </section>

      <section className="bw-sec">
        <div className="k">Seven sealed territories · tap to peek</div>
        <div className="bw-cards">{TERRITORIES.map((t) => (
          <button key={t.id} className={'bw-card' + (opened[t.id] ? ' open' : '')} onClick={() => setOpened({ ...opened, [t.id]: !opened[t.id] })} style={{ ['--c1' as any]: t.palette[0], ['--c2' as any]: t.palette[1], color: t.dark || t.id === 'fruit' ? '#fff' : '#0B1B2B' }}>
            <span className="num">0{t.n}</span><b>{t.name}</b>
            <em>{opened[t.id] ? t.promise : 'Sealed until November 9'}</em>
          </button>
        ))}</div>
        <p className="bw-note">The hero flavor of each world is revealed, and tasted, in the room.</p>
      </section>

      <section className="bw-sec">
        <div className="k">The morning</div>
        <ul className="bw-agenda">{AGENDA.map(([t, l]) => <li key={t}><span className="num">{t}</span>{l}</li>)}</ul>
      </section>

      <section className="bw-sec bw-home" id="homework">
        <div className="k">Your two minutes of homework</div>
        {done ? (
          <div className="bw-done">
            <Orb ref={orb} profile={profile} size={260} />
            <h2>Thank you, {first}.</h2>
            <p>{describe(profile)} Your answers open the workshop.</p>
            <button className="rm-btn" onClick={saveOrb}>Save my freshness orb</button>
          </div>
        ) : (
          <>
            <label className="rm-field"><span>Your first name</span><input value={a.name} onChange={(e) => setA({ ...a, name: e.target.value.slice(0, 20) })} /></label>
            <div className="rm-field"><span>{SURVEY.consumer.q}</span><div className="rm-tags">{SURVEY.consumer.options.map((o) => <button key={o} className={a.consumer === o ? 'on' : ''} onClick={() => setA({ ...a, consumer: o })}>{o}</button>)}</div></div>
            <div className="rm-field"><span>{SURVEY.moment.q}</span><div className="rm-tags">{SURVEY.moment.options.map((o) => <button key={o} className={a.moment === o ? 'on' : ''} onClick={() => setA({ ...a, moment: o })}>{o}</button>)}</div></div>
            <label className="rm-field"><span>{SURVEY.veto.q}</span><textarea rows={3} value={a.veto} onChange={(e) => setA({ ...a, veto: e.target.value.slice(0, 140) })} /></label>
            <div className="rm-field"><span>Set your freshness. Watch it take shape.</span></div>
            <div className="bw-profile">
              <Orb ref={orb} profile={profile} size={220} />
              <div className="bw-sliders">{PROFILE.map((x) => (
                <label key={x.id} className="rm-dial"><small><i>{x.l}</i><i>{x.r}</i></small><input type="range" min={1} max={5} step={1} value={profile[x.id]} onChange={(e) => setProfile({ ...profile, [x.id]: Number(e.target.value) })} /></label>
              ))}<p className="bw-desc">{describe(profile)}</p></div>
            </div>
            <button className="rm-btn" disabled={!ok} onClick={submit}>Send my answers</button>
          </>
        )}
      </section>

      <footer className="bw-foot">
        <p className="bw-promise">You will leave with a Playbook that has your name on it.</p>
        <div className="k">Come curious, and hungry for something other than mint. · Confidential</div>
      </footer>
    </main>
  );
}
