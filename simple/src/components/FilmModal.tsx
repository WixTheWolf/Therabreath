'use client';
// The opening film, full screen with sound, on the front door and the pre-brief. Escape, the Close button or a click
// outside closes it, and focus goes back to whatever opened it; while it's open, Tab stays inside. `q` carries the
// pre-brief's signed link (c and k) so the film plays there without the password. `file` picks the cut (see FILM in
// content.ts), which plays with its captions and offers its transcript, read from the same caption file so it's always
// the words she says. When it finishes, `onEnd` runs if given (the pre-brief goes straight to its questions); otherwise
// `next` shows an end card with the next step, a replay and Close; with neither, it closes.
import { useEffect, useRef, useState } from 'react';

// The caption file as paragraphs: the cues joined into sentences, with the timings and cue numbers dropped.
function transcriptOf(vtt: string) {
  const cues = vtt.replace(/\r/g, '').split(/\n\n+/).map((b) => b.split('\n').filter((l) => l && !/^WEBVTT/.test(l) && !/-->/.test(l) && !/^\d+$/.test(l)).join(' ')).filter(Boolean);
  const out: string[] = []; let cur = '';
  for (const c of cues) { cur = cur ? `${cur} ${c}` : c; if (/[.!?”"]$/.test(c)) { out.push(cur); cur = ''; } }
  if (cur) out.push(cur);
  return out;
}

type Next = { label: string; href: string; line: string };
export default function FilmModal({ onClose, onEnd, next, q = '', file = 'opening' }: { onClose: () => void; onEnd?: () => void; next?: Next; q?: string; file?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);
  useEffect(() => { if (ended) box.current?.querySelector<HTMLElement>('.st-end-go')?.focus(); }, [ended]);
  const finished = () => { if (onEnd) onEnd(); else if (next) setEnded(true); else onClose(); };
  const replay = () => { const v = vid.current; if (!v) return; setEnded(false); v.currentTime = 0; v.play().catch(() => {}); };
  const close = useRef(onClose); close.current = onClose;
  const [lines, setLines] = useState<string[] | null>(null);
  const [showText, setShowText] = useState(false);
  // Once, on open: focus the Close button, keep Tab inside, stop the page scrolling behind; undo it all on close.
  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    box.current?.querySelector<HTMLElement>('.st-shut')?.focus();
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close.current(); return; }
      if (e.key !== 'Tab' || !box.current) return;
      const els = [...box.current.querySelectorAll<HTMLElement>('video, button, [href], [tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
      if (!els.length) return;
      const i = els.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); els[els.length - 1].focus(); }
      else if (!e.shiftKey && (i === -1 || i === els.length - 1)) { e.preventDefault(); els[0].focus(); }
    };
    addEventListener('keydown', k);
    const scroll = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', k); document.documentElement.style.overflow = scroll; back?.focus?.({ preventScroll: true }); };
  }, []);
  const toggleText = async () => {
    setShowText((x) => !x);
    if (lines) return;
    try { const r = await fetch(`/media/${file}.vtt${q}`); setLines(r.ok ? transcriptOf(await r.text()) : []); } catch { setLines([]); }
  };
  const title = 'The opening film';
  return (
    <div className={'st-modal' + (showText ? ' with-text' : '')} ref={box} onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="st-modal-in" onClick={(e) => e.stopPropagation()}>
        <div className="st-film">
          <video ref={vid} autoPlay controls playsInline poster={`/media/film-poster.jpg${q}`} onEnded={finished} onPlay={() => setEnded(false)} aria-label={title}>
            <source src={`/media/${file}.mp4${q}`} type="video/mp4" /><source src={`/media/${file}.webm${q}`} type="video/webm" /><track kind="captions" srcLang="en" label="English" src={`/media/${file}.vtt${q}`} />
          </video>
          {ended && next && (
            <div className="st-end" role="region" aria-label="What to do next">
              <p>{next.line}</p>
              <a className="st-play st-end-go" href={next.href}>{next.label}</a>
              <div><button className="st-x" onClick={replay}>Watch again</button><button className="st-x" onClick={onClose}>Back to the page</button></div>
            </div>
          )}
        </div>
        {showText && (
          <section className="st-transcript" id="film-transcript" aria-label="Transcript of the opening film" tabIndex={0}>
            <h2>Transcript</h2>
            {lines === null ? <p className="st-tx-wait">Loading the transcript…</p> : lines.length ? lines.map((l, i) => <p key={i}>{l}</p>) : <p className="st-tx-wait">The transcript didn’t load. Turn on the captions in the player for the same words.</p>}
          </section>
        )}
      </div>
      <div className="st-modal-bar" onClick={(e) => e.stopPropagation()}>
        <button className="st-x" onClick={toggleText} aria-expanded={showText} aria-controls="film-transcript">{showText ? 'Hide transcript' : 'Transcript'}</button>
        <button className="st-x st-shut" onClick={onClose}>Close<span aria-hidden="true"> · Esc</span></button>
      </div>
    </div>
  );
}
