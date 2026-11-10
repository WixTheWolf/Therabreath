// Password gate and signed join tokens. Web Crypto only, so it runs in proxy and in route handlers.
// Two passwords, neither stored in plain text: the room password (site, Stage, Playbook, films) and the host password
// (Host tools, Console, session list, export, wipe). Set PLAYBOOK_PASSWORD and PLAYBOOK_HOST_PASSWORD to change them.
const DEFAULT_HASH = '2280a41151c51fc97ded31fde78388396343c39da87b54b9810353d86758c7c8';
const DEFAULT_HOST_HASH = 'a47a1d697b3cf96db5d947f68a534e57ef7bd7fd48ebd3fda7070c7e9ec9e2a7';
const enc = new TextEncoder();
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');

export async function sha256(s: string) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(s))); }
// Passwords ignore case and surrounding spaces, so phone keyboards that auto-capitalize still work.
const norm = (p: string) => p.trim().toLowerCase();
export async function passwordHash() { return process.env.PLAYBOOK_PASSWORD ? sha256(norm(process.env.PLAYBOOK_PASSWORD)) : DEFAULT_HASH; }
// The key that signs cookies and links. The hashes above are in a public repository, so on Vercel the key comes from
// PLAYBOOK_SECRET or, failing that, from the database connection string, which only the server has. Changing either
// signs everyone out and changes every pre-brief link. Locally, with neither set, the password hash stands in.
const dbUrl = () => process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING;
async function secret() { const u = dbUrl(); return process.env.PLAYBOOK_SECRET || (u ? sha256('fof-signing-key:' + u) : await passwordHash()); }
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

// The Church & Dwight link (/c/TOKEN), sent after the morning. It opens only /cd (the presentation to look through, the
// slides PDF and the follow-up tasting) and the two files those pages use; nothing else on the site, and none of the
// team's pages. Signed like the join links, so a new PLAYBOOK_SECRET turns the old link off.
export const CLIENT_COOKIE = 'pb_client';
export const clientToken = async () => (await hmac('client:after-the-morning')).slice(0, 24);
export async function isClient(v?: string | null) { return !!v && v === (await clientToken()); }
export const CLIENT_FILES = new Set(['/media/flavor-race.mp4', '/files/The-Future-of-Freshness-Slides.pdf']);
export async function isAuthed(cookieValue?: string | null) { return !!cookieValue && cookieValue === (await authToken()); }
export const COOKIE = 'pb_auth';
export const cookieOpts = () => ({ httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 });

// The team link (/t/KEY) signs a teammate in with host access in one click, for previews before the day. Only the
// key's hash is stored here; setting PLAYBOOK_TEAM_KEY replaces the key and turns the old link off.
const DEFAULT_TEAM_HASH = '6365923b5ee706dfbbbca21ea0e48c6046d86e23342c44cfc6391f5fe9e07d95';
export async function teamHash() { return process.env.PLAYBOOK_TEAM_KEY ? sha256(norm(process.env.PLAYBOOK_TEAM_KEY)) : DEFAULT_TEAM_HASH; }
export async function checkTeamKey(k: string) { return !!norm(k) && (await sha256(norm(k))) === (await teamHash()); }

// The owner link (/o/KEY) is for one person: it opens the pre-brief answers with names (/answers). It exists only when
// PLAYBOOK_OWNER_KEY is set on the server (at least 20 characters); nothing about the key is stored here. The cookie is
// signed with the key, so changing the key signs the old browser out.
export const OWNER_COOKIE = 'pb_owner';
const ownerKey = () => (process.env.PLAYBOOK_OWNER_KEY || '').trim();
export const ownerEnabled = () => ownerKey().length >= 20;
export async function checkOwnerKey(k: string) { return ownerEnabled() && !!k && (await sha256(k.trim())) === (await sha256(ownerKey())); }
export const ownerToken = async () => hmac('owner:' + (await sha256(ownerKey())));
export async function isOwner(cookieValue?: string | null) { return ownerEnabled() && !!cookieValue && cookieValue === (await ownerToken()); }

// The team's own pages need the team link (or the host password): the presentation, which moves everyone's phones, the
// run sheet, the write-up, the team page, the paper scorecard, the old Stage, the PDFs (the decks show the sealed names)
// and THE FLAVOR RACE, which premieres in the room. Church & Dwight's password opens the front door and the Playbook only.
export const teamOnly = (p: string) => p === '/host' || p.startsWith('/host/') || p === '/team' || p === '/scorecard' || p.startsWith('/stage/') || p.startsWith('/files/') || p.startsWith('/media/flavor-race');
