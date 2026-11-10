'use client';
// FOLLOW-UP: the two votes the room missed on November 9, on one link after the morning. The tasting's scoring was
// already closed when the morning began (a walk-through on the live link the evening before had passed the scores
// build), so no phone could score and the chips were open for about a second. This page asks for the same two things
// the phones would have: the four sample scores, then five chips. They go into the same session as the day, flagged
// `followup` (see the reducer in state.ts), so the Playbook write-up, the results and the chart read them like any
// other score or chip. Nothing here moves the presentation or opens a vote for anyone else.
import { useEffect, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { SCENES } from '@/lib/scenes';
import { SAMPLES } from '@/lib/content';
import { uid } from '@/lib/state';
import { Taste, Chips, JoinForm, type Me } from './RoomApp';

// The same saved name and phone id as the room, so someone on the phone they used on the day keeps their place.
const KEY = (c: string) => `pb-me-${c}`;
const CHIPS = SCENES.find((x) => x.id === 'nextround')?.room as { key: string; total: number; prompt: string };
type Stage = 'taste' | 'chips' | 'done';

export default function FollowupApp({ code, k }: { code: string; k: string }) {
  const { state: s, send, status } = useSession(code, { k });
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  const [chosen, setChosen] = useState<Stage | null>(null);
  useEffect(() => { document.documentElement.dataset.theme = 'b'; }, []);
  useEffect(() => { try { const m = JSON.parse(localStorage.getItem(KEY(code)) || 'null'); if (m?.pid) setMe(m); } catch {} setReady(true); }, [code]);
  useEffect(() => { if (me && status.lastOk && !s.participants[me.pid]) send('join', { name: me.name }, me.pid); }, [me, status.lastOk, s.participants, send]);
  useEffect(() => { window.scrollTo(0, 0); }, [chosen]);

  if (!ready) return <main className="room" data-theme="b" />;
  if (!me) return <JoinForm follow onJoin={(name) => { const m = { pid: uid(), name }; try { localStorage.setItem(KEY(code), JSON.stringify(m)); } catch {} setMe(m); send('join', { name }, m.pid); }} />;

  const p = (kind: string, data: any) => send(kind, data, me.pid);
  const scored = SAMPLES.filter((x) => !!s.ratings[x.code]?.[me.pid]).length;
  const chipsIn = !!s.votes[CHIPS.key]?.picks?.[me.pid];
  // The page moves on by itself as each part is saved; the two steps at the top go back to either one.
  const stage: Stage = chosen || (scored < SAMPLES.length ? 'taste' : chipsIn ? 'done' : 'chips');
  const go = (x: Stage) => setChosen(x);
  const props = { s, me, p, step: 2, fu: true };

  return (
    <main className="room" data-theme="b">
      <header className="rm-head"><span className="rm-brand"><i />The Future of Freshness</span><span className={'rm-dot' + (status.online ? '' : ' off')} />{me.name}</header>
      {!status.online && Date.now() - status.lastOk > 4000 && <p className="rm-offline" role="status">Reconnecting. Anything you’ve sent is saved on this phone and goes through as soon as you’re back online.</p>}
      {stage !== 'done' && (
        <nav className="rm-fu-steps" aria-label="Two steps">
          <button className={stage === 'taste' ? 'on' : ''} aria-current={stage === 'taste' ? 'step' : undefined} onClick={() => go('taste')}><span className="num">1</span>The tasting<small>{scored} of {SAMPLES.length}</small></button>
          <button className={stage === 'chips' ? 'on' : ''} aria-current={stage === 'chips' ? 'step' : undefined} onClick={() => go('chips')}><span className="num">2</span>Your five chips<small>{chipsIn ? 'Sent' : 'Not yet'}</small></button>
        </nav>
      )}
      <div className="rm-body" key={stage}>
        {stage === 'taste' && (
          <>
            <p className="rm-fu-lede">Score each of the four samples you tasted on Monday.{s.revealed ? ' The names are the ones we revealed in the room.' : ''}</p>
            {scored === SAMPLES.length && chosen === 'taste' && <div className="rm-fu-next"><span>All four are saved.</span><button onClick={() => go(chipsIn ? 'done' : 'chips')}>{chipsIn ? 'Done' : 'Next: your five chips'}</button></div>}
            <Taste {...props} />
          </>
        )}
        {stage === 'chips' && (
          <>
            {chipsIn && chosen === 'chips' && <div className="rm-fu-next"><span>Your chips are sent.</span><button onClick={() => go('done')}>Done</button></div>}
            <Chips {...props} room={CHIPS} />
          </>
        )}
        {stage === 'done' && (
          <div className="rm-center">
            <div className="rm-drop" />
            <h1 className="h2">Thank you, {me.name}.</h1>
            <p className="rm-p">Your scores and chips are in. They go straight into the Flavor Playbook, with everyone else’s.</p>
            <p className="rm-p">You can come back to this link and change them until we send it.</p>
            <div className="rm-fu-again">
              <button onClick={() => go('taste')}>Change my scores</button>
              <button onClick={() => go('chips')}>Change my chips</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
