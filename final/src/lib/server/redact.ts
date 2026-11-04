// Pre-brief answers carry the person's first name. Only the owner (see isOwner in auth.ts) reads them whole. The team
// (the presentation, the results page, the write-up, the export) gets each answer without the name, under a stand-in
// for the person that stays the same across their answers but can't be matched to anything else in the session.
// Everyone else (the pre-brief pages and the phones, which only need to know their own answer arrived) gets the event
// with nothing in it.
import { hmac, isOwner, isHost, OWNER_COOKIE, HOST_COOKIE } from '../auth';

export type Viewer = 'owner' | 'team' | 'guest';
type Cookies = { get(name: string): { value: string } | undefined };
export async function viewerOf(cookies: Cookies): Promise<Viewer> {
  if (await isOwner(cookies.get(OWNER_COOKIE)?.value)) return 'owner';
  if (await isHost(cookies.get(HOST_COOKIE)?.value)) return 'team';
  return 'guest';
}

export async function redact<T extends { kind: string; pid?: string | null; data?: any }>(rows: T[], viewer: Viewer): Promise<T[]> {
  if (viewer === 'owner') return rows;
  const stand: Record<string, string> = {};
  const standIn = async (pid: string) => (stand[pid] ||= 'a' + (await hmac('anon:' + pid)).slice(0, 12));
  const out: T[] = [];
  for (const r of rows) {
    if (r.kind !== 'survey') { out.push(r); continue; }
    const pid = r.pid ? await standIn(r.pid) : r.pid;
    if (viewer === 'guest') { out.push({ ...r, pid, data: {} }); continue; }
    const { name: _name, ...rest } = (r.data || {}) as Record<string, unknown>;
    out.push({ ...r, pid, data: rest });
  }
  return out;
}
