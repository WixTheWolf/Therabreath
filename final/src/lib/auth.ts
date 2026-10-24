// Password gate and signed join tokens. Web Crypto only, so it runs in proxy and in route handlers.
// Two passwords, neither stored in plain text: the room password (site, Stage, Playbook, films) and the host password
// (Host tools, Console, session list, export, wipe). Set PLAYBOOK_PASSWORD and PLAYBOOK_HOST_PASSWORD to change them.
const DEFAULT_HASH = 'a47a1d697b3cf96db5d947f68a534e57ef7bd7fd48ebd3fda7070c7e9ec9e2a7';
const DEFAULT_HOST_HASH = 'f7d5eebdbf27bbc99efccce18636b4ce0deb8e16d2b395707aa144ce9d318593';
const enc = new TextEncoder();
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');

export async function sha256(s: string) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(s))); }
// Passwords ignore case and surrounding spaces, so phone keyboards that auto-capitalize still work.
const norm = (p: string) => p.trim().toLowerCase();
export async function passwordHash() { return process.env.PLAYBOOK_PASSWORD ? sha256(norm(process.env.PLAYBOOK_PASSWORD)) : DEFAULT_HASH; }
async function secret() { return process.env.PLAYBOOK_SECRET || (await passwordHash()); }
export async function hmac(msg: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(await secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}
export async function checkPassword(p: string) { return (await sha256(norm(p))) === (await passwordHash()); }
export async function hostHash() { return process.env.PLAYBOOK_HOST_PASSWORD ? sha256(norm(process.env.PLAYBOOK_HOST_PASSWORD)) : DEFAULT_HOST_HASH; }
export async function checkHostPassword(p: string) { return (await sha256(norm(p))) === (await hostHash()); }
export const authToken = () => hmac('stage-console-playbook');
export const hostToken = () => hmac('host-console-wipe');
export async function isHost(cookieValue?: string | null) { return !!cookieValue && cookieValue === (await hostToken()); }
export const HOST_COOKIE = 'pb_host';
export const joinToken = async (code: string) => (await hmac('join:' + code.toUpperCase())).slice(0, 16);
export async function isAuthed(cookieValue?: string | null) { return !!cookieValue && cookieValue === (await authToken()); }
export const COOKIE = 'pb_auth';
