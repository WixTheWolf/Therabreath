// The room's clock. The workshop is in Princeton, so the presentation, the presenter view and the run sheet's windows
// all read Eastern time, whatever time zone the laptop is set to.
import { RUN } from './content';

const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', hourCycle: 'h23' });

// Minutes since midnight, Eastern.
export function etMinutes(d = new Date()) {
  const p = Object.fromEntries(parts.formatToParts(d).map((x) => [x.type, x.value]));
  return (Number(p.hour) % 24) * 60 + Number(p.minute);
}
// "10:32", as the run sheet writes its times.
export function etClock(d = new Date()) {
  const m = etMinutes(d), h = Math.floor(m / 60) % 12 || 12;
  return `${h}:${String(m % 60).padStart(2, '0')}`;
}
const mins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

// The planned window for a part of the morning, and how far past its end the clock is (0 when on time).
export function runTiming(block: string, d = new Date()) {
  const b = RUN.find((x) => x.id === block); if (!b) return null;
  const over = etMinutes(d) - mins(b.end);
  return { from: b.t, to: b.end, now: etClock(d), over: over > 0 && over < 180 ? over : 0 };
}
