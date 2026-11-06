import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { EVENT, SURVEY, PROFILE } from '@/lib/content';
import { isOwner, OWNER_COOKIE } from '@/lib/auth';
import { list } from '@/lib/server/store';
import Refresh from './Refresh';

export const metadata = { title: 'Pre-brief answers' };
export const dynamic = 'force-dynamic';

// The pre-brief answers with names, for the owner only (the owner link, /o/KEY). Anyone else gets a plain 404, so the
// page gives nothing away. It reads the store directly, newest answer first, and refreshes itself every 20 seconds.
// The team and the room only ever see these without names (src/lib/server/redact.ts).
const PRACTICE = 'PREVIEW';
const when = (t: number) => new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(t)) + ' ET';

export default async function Answers({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  if (!(await isOwner((await cookies()).get(OWNER_COOKIE)?.value))) notFound();
  const practice = (await searchParams).code === PRACTICE;
  const code = practice ? PRACTICE : EVENT.code;
  const rows = await list(code, 0);
  const since = rows.slice(rows.map((r) => r.kind).lastIndexOf('wipe') + 1);
  // One answer per person: the latest they sent.
  const latest = new Map<string, (typeof rows)[number]>();
  for (const r of since) if (r.kind === 'survey' && r.pid) latest.set(r.pid, r);
  const answers = [...latest.values()].sort((a, b) => b.t - a.t);
  const label = (v?: string) => (v ? v : 'No answer');
  return (
    <main className="site tm" data-theme="b">
      <Refresh secs={20} />
      <header className="st-bar">
        <div className="st-lock"><img src="/img/tff-logo-white.webp" alt="The Flavor Factory" width={100} height={22} /><span>×</span><b>TheraBreath</b></div>
        <nav className="st-hostbar" aria-label="Sessions">
          <a href="/answers" aria-current={practice ? undefined : 'page'}>Live</a>
          <a href={`/answers?code=${PRACTICE}`} aria-current={practice ? 'page' : undefined}>Practice</a>
        </nav>
      </header>
      <div className="tm-in">
        <h1>Pre-brief answers</h1>
        <p className="tm-lead">
          {practice ? 'The practice pre-brief from the team page. ' : `The live session, ${EVENT.code}. `}
          Only you can open this page. Everyone else sees these without names. It refreshes itself every 20 seconds.
        </p>
        <p className="an-count" aria-live="polite"><b>{answers.length}</b> {answers.length === 1 ? 'person has' : 'people have'} answered{answers.length ? `, the latest ${when(answers[0].t)}` : ''}.</p>
        {answers.length === 0 ? <p className="an-none">Nothing yet. Answers show up here as soon as they’re sent.</p> : (
          <ol className="an-list">
            {answers.map((r) => {
              const d = (r.data || {}) as Record<string, any>;
              const forWho = d.consumer === SURVEY.consumer.other && d.other ? `${d.consumer}: ${d.other}` : d.consumer;
              const occasion = d.moment === SURVEY.moment.other && d.momentOther ? `${d.moment}: ${d.momentOther}` : d.moment;
              return (
                <li key={r.pid} className="an-item">
                  <div className="an-head"><b>{d.name || 'No name given'}</b><span>{when(r.t)}</span></div>
                  <dl>
                    <div><dt>{SURVEY.consumer.q}</dt><dd>{label(forWho)}</dd></div>
                    <div><dt>{SURVEY.moment.q}</dt><dd>{label(occasion)}</dd></div>
                    <div><dt>{SURVEY.veto.q}</dt><dd>{label(d.veto)}</dd></div>
                    {d.profile && <div><dt>Their freshness profile</dt><dd><ul className="an-prof">{PROFILE.map((p) => {
                      const v = Number(d.profile[p.id]);
                      return <li key={p.id}><span>{p.l}</span><i aria-hidden="true">{[1, 2, 3, 4, 5].map((n) => <em key={n} className={n === v ? 'on' : ''} />)}</i><span>{p.r}</span><small className="sr">{Number.isFinite(v) ? `${v} of 5` : 'No answer'}</small></li>;
                    })}</ul></dd></div>}
                  </dl>
                </li>
              );
            })}
          </ol>
        )}
      </div>
      <footer className="fd-foot">Confidential · for your eyes only</footer>
    </main>
  );
}
