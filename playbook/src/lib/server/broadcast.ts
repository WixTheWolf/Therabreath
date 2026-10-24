// Nudges subscribed clients the instant new events land (Supabase Realtime broadcast over REST).
// Clients also poll, so this is an accelerator, never a dependency.
export async function nudge(topic: string, seq: number) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ topic, event: 'ev', payload: { seq } }] }),
    });
  } catch {}
}
