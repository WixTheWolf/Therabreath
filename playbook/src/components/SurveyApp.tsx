'use client';
// Pre-work survey, sent before the day. Answers land in the same session and open the workshop.
import { useEffect, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { SURVEY, EVENT } from '@/lib/content';
import { uid } from '@/lib/state';

export default function SurveyApp({ code, k }: { code: string; k: string }) {
  const { send } = useSession(code, { k, interval: 4000 });
  const [a, setA] = useState({ name: '', consumer: '', moment: '', veto: '' });
  const [done, setDone] = useState(false);
  useEffect(() => { document.documentElement.dataset.theme = 'a'; }, []);
  const ok = a.name.trim() && a.consumer && a.moment;
  const submit = () => {
    let pid = '';
    try { pid = JSON.parse(localStorage.getItem(`pb-me-${code}`) || 'null')?.pid; } catch {}
    if (!pid) { pid = uid(); try { localStorage.setItem(`pb-me-${code}`, JSON.stringify({ pid, name: a.name.trim() })); } catch {} }
    send('survey', { ...a, name: a.name.trim().split(/\s+/)[0] }, pid);
    setDone(true);
  };
  if (done) return <main className="room survey" data-theme="a"><div className="rm-center"><div className="rm-drop" /><h1 className="h2">Thank you.</h1><p className="rm-p">Your answers open the workshop on {EVENT.date}.</p></div></main>;
  return (
    <main className="room survey" data-theme="a">
      <div className="rm-pad">
        <div className="k">{EVENT.lockup}</div>
        <h1 className="h2" style={{ margin: '14px 0 8px' }}>Before we meet</h1>
        <p className="rm-p">Three questions, two minutes. Your answers are revealed, grouped and without names, when the workshop opens.</p>
        <label className="rm-field"><span>Your first name</span><input value={a.name} onChange={(e) => setA({ ...a, name: e.target.value.slice(0, 20) })} /></label>
        <div className="rm-field"><span>{SURVEY.consumer.q}</span><div className="rm-tags">{SURVEY.consumer.options.map((o) => <button key={o} className={a.consumer === o ? 'on' : ''} onClick={() => setA({ ...a, consumer: o })}>{o}</button>)}</div></div>
        <div className="rm-field"><span>{SURVEY.moment.q}</span><div className="rm-tags">{SURVEY.moment.options.map((o) => <button key={o} className={a.moment === o ? 'on' : ''} onClick={() => setA({ ...a, moment: o })}>{o}</button>)}</div></div>
        <label className="rm-field"><span>{SURVEY.veto.q}</span><textarea rows={3} value={a.veto} onChange={(e) => setA({ ...a, veto: e.target.value.slice(0, 140) })} /></label>
        <button className="rm-btn" disabled={!ok} onClick={submit}>Send my answers</button>
      </div>
    </main>
  );
}
