// Nudges subscribed clients the instant new events land (Supabase Realtime broadcast over REST).
// Clients also poll, so this is an accelerator, never a dependency.
import { SUPABASE_URL, SUPABASE_KEY } from '../supabase';

export async function nudge(topic: string, seq: number) {
  const url = SUPABASE_URL, key = SUPABASE_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ topic, event: 'ev', payload: { seq } }] }),
    });
  } catch {}
}
