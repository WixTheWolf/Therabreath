// Durable event store. Postgres when a connection string exists (the Supabase Marketplace
// integration provides POSTGRES_URL); otherwise the flavor-playbook Supabase project through its
// key-checked database functions; with STORE=memory, an in-memory demo store on this server instance.
import postgres from 'postgres';
import type { Ev } from '../state';
import { SUPABASE_URL, SUPABASE_KEY } from '../supabase';
import { DB_KEY } from './dbkey';

const url = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING;
type Row = Ev & { seq: number; code: string };
const g = globalThis as any;
const sql: any = url ? (g.__pbsql ||= postgres(url, { prepare: false, max: 3, idle_timeout: 20, ssl: url.includes('localhost') ? false : 'require' })) : null;
const mem: Row[] = (g.__pbmem ||= []);
let ready: Promise<void> | null = g.__pbready || null;

const rest = !sql && process.env.STORE !== 'memory';
export const storeKind = () => (sql ? 'postgres' : rest ? 'supabase' : 'memory');

async function rpc(fn: string, body: Record<string, unknown>) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST', cache: 'no-store',
    headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ k: DB_KEY, ...body }),
  });
  if (!r.ok) throw new Error(`supabase ${fn} ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const text = await r.text();
  return text ? JSON.parse(text) : null;
}

async function init() {
  if (!sql) return;
  if (!ready) {
    ready = g.__pbready = sql`create table if not exists pb_events (
      seq bigserial primary key, code text not null, id text not null, t bigint not null,
      kind text not null, pid text, data jsonb, unique (code, id))`.then(() => sql`create index if not exists pb_events_code_seq on pb_events (code, seq)`).then(() => undefined);
  }
  await ready;
}

export async function list(code: string, after = 0): Promise<Row[]> {
  if (rest) return ((await rpc('fof_list', { p_code: code, p_after: after })) as any[]).map((r) => ({ ...r, seq: Number(r.seq), t: Number(r.t), pid: r.pid || undefined, code }));
  if (!sql) return mem.filter((r) => r.code === code && r.seq > after);
  await init();
  const rows = await sql`select seq, id, t, kind, pid, data from pb_events where code = ${code} and seq > ${after} order by seq limit 5000`;
  return rows.map((r: any) => ({ ...r, seq: Number(r.seq), t: Number(r.t), code }));
}

export async function append(code: string, evs: Ev[]): Promise<number> {
  if (!evs.length) return 0;
  if (rest) return Number(await rpc('fof_append', { p_code: code, p_events: evs.map((e) => ({ id: e.id, t: e.t, kind: e.kind, pid: e.pid || null, data: e.data || {} })) })) || 0;
  if (!sql) {
    let seq = mem.length ? mem[mem.length - 1].seq : 0;
    for (const e of evs) if (!mem.some((r) => r.code === code && r.id === e.id)) mem.push({ ...e, code, seq: ++seq });
    return seq;
  }
  await init();
  let last = 0;
  for (const e of evs) {
    const r = await sql`insert into pb_events (code, id, t, kind, pid, data) values (${code}, ${e.id}, ${e.t}, ${e.kind}, ${e.pid || null}, ${sql.json(e.data || {})}) on conflict do nothing returning seq`;
    if (r[0]) last = Number(r[0].seq);
  }
  return last;
}

export async function wipe(code: string) {
  // Supabase keeps history: a wipe is an event every screen folds back to the start, and loads begin after it.
  if (rest) { await append(code, [{ id: 'wipe-' + Date.now(), t: Date.now(), kind: 'wipe', data: {} } as Ev]); return; }
  if (!sql) { for (let i = mem.length - 1; i >= 0; i--) if (mem[i].code === code) mem.splice(i, 1); return; }
  await init();
  await sql`delete from pb_events where code = ${code}`;
}
