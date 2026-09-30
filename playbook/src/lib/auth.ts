// Password gate and signed join tokens. Web Crypto only, so it runs in proxy and in route handlers.
// The plain password is never stored: only its SHA-256. Set PLAYBOOK_PASSWORD to change it.
const DEFAULT_HASH = '2be802e03fb1c9dc869b387b15be0c25779f75c7e1690b969b8057bd7f72c7dc';
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
export const authToken = () => hmac('stage-console-playbook');
export const joinToken = async (code: string) => (await hmac('join:' + code.toUpperCase())).slice(0, 16);
export async function isAuthed(cookieValue?: string | null) { return !!cookieValue && cookieValue === (await authToken()); }
export const COOKIE = 'pb_auth';
