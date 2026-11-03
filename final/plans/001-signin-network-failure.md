# 001 Sign-in survives a dropped connection

**Blocking status:** none. Not `REQUIRES-APPROVAL`, not `TOUCHES-DS`. The one new line of copy is proposed below; the owner can reword it without changing the plan.

**When:** before November 9. Every attendee signs in here first, on venue Wi-Fi.

Provenance: detector rule B-6a (orange, "data-driven component with no loading / error / empty state"), confirmed by hand; canon US-003 (judgement, hard). Canon public-2026.10.11-1, bundled local copy in the unslop plugin (index checksum `9d6713e5b595a8aedf6dce9c51a020e3bd77d471d9723a8b3b8ca6ca7589cf68`), not fetched or verified through the canon helper. Detector unslop 1.0.3. Audited at commit `921d71c`.

## 1. Problem

`src/app/login/page.tsx`, lines 12 to 18, current code verbatim:

```tsx
  const go = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(false);
    const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw, host }) });
    setBusy(false);
    // A host with nowhere else to go lands on the team page; everyone else on the front door.
    if (r.ok) location.href = new URLSearchParams(location.search).get('next') || ((await r.json()).host ? '/team' : '/'); else setErr(true);
  };
```

Two defects:

1. If `fetch` rejects (Wi-Fi drops, captive portal, DNS failure) the promise throws, `setBusy(false)` never runs, and the button stays on "Checking" forever with no message. There is no timeout, so a hung request does the same.
2. Any non-OK response (a 500 from the store, for example) shows "That password didn't work", which is false. The API returns 401 only for a wrong password (`src/app/api/login/route.ts:15`).

A third, smaller one: the error message (`<div className="gate-err">`, line 27) is not announced to screen readers, because it has no `role="alert"`.

## 2. Target

- The request gets a 10 second timeout through `AbortController`.
- A thrown request or a non-401 failure shows a connection message; a 401 keeps today's wrong-password messages, word for word.
- The button returns to "Enter" after any failure, and stays on "Checking" while the browser navigates after success.
- The message element carries `role="alert"`.

Proposed connection message (new copy, in the site's voice, curly apostrophe like the rest of the page):

> We couldn’t sign you in just now. Check your connection and try again.

## 3. Repo conventions

Timeouts on fetch in this repo use `AbortController` plus `setTimeout`, cleared in `finally`. Example, `src/lib/useSession.ts:29` and `:45`:

```ts
const ctl = new AbortController(); const cut = setTimeout(() => ctl.abort(), 8000);
...
} finally { clearTimeout(cut); busy.current = false; }
```

Copy uses curly apostrophes (`’`) and never an em dash or en dash (the build runs `scripts/check-dashes.mjs` over the repo and fails on either).

## 4. Steps

1. In `src/app/login/page.tsx`, line 8, change the error state from a boolean to a reason:
   - from `const [err, setErr] = useState(false);`
   - to `const [err, setErr] = useState<'' | 'pw' | 'net'>('');`
2. Replace the whole `go` function (lines 12 to 18, from `const go = async` through its closing `};`) with:

```tsx
  const go = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    // Venue Wi-Fi can drop or hang: give up after 10 seconds and say so, instead of spinning forever.
    const ctl = new AbortController(); const cut = setTimeout(() => ctl.abort(), 10000);
    let leaving = false;
    try {
      const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw, host }), signal: ctl.signal });
      // A host with nowhere else to go lands on the team page; everyone else on the front door.
      if (r.ok) { leaving = true; location.href = new URLSearchParams(location.search).get('next') || ((await r.json()).host ? '/team' : '/'); return; }
      setErr(r.status === 401 ? 'pw' : 'net');
    } catch {
      setErr('net');
    } finally {
      clearTimeout(cut);
      if (!leaving) setBusy(false);
    }
  };
```

3. Replace the error line (the one line starting `{err && <div className="gate-err">`; it was line 27 before step 2 lengthened the function) with:

```tsx
        {err && <div className="gate-err" role="alert">{err === 'net' ? 'We couldn’t sign you in just now. Check your connection and try again.' : mode === 'team' ? 'That password doesn’t open the team pages. Church & Dwight’s password opens the front door only. Use the team password, or the team link from the email.' : 'That password didn’t work. Check it and try again.'}</div>}
```

   The two existing messages must stay character for character as they are today.
4. Run `npm test` and `npm run build` in `final/`.

## 5. Scope bounds

- Touch only `src/app/login/page.tsx`.
- Do not change `src/app/api/login/route.ts`, the CSS (`.gate-err` in `src/app/room.css:105` already styles the message), the page heading, the paragraph copy, the placeholder or the input attributes.
- Do not add a retry loop or a spinner.

## 6. Verification

| Requirement | Evidence |
|---|---|
| Wrong password still says so | Local server (`npm run build && STORE=memory PLAYBOOK_PASSWORD=room-test PLAYBOOK_HOST_PASSWORD=host-test npm start`), open `/login`, enter `nope`: "That password didn’t work. Check it and try again." appears, button back to "Enter". |
| Team wording unchanged | `/login?team=1`, wrong password: the team message appears, identical to before. |
| Dropped connection | In Chrome DevTools, Network set to Offline, submit any password: within a second the connection message appears and the button reads "Enter" again. |
| Hung request | DevTools, add a request blocking pattern or throttle to a custom profile with 20 s latency for `/api/login`: after 10 s the connection message appears. |
| Success still navigates | Network back online, enter `room-test`: lands on `/`; `host-test` lands on `/team`. The button reads "Checking" until the page changes. |
| Announced | With VoiceOver or ChromeVox on, a failed attempt reads the message aloud (or inspect the element: `role="alert"` present). |
| No regressions | `npm test` passes (auth tests); `npm run build` passes (includes the dash check). |

Uncovered: real venue Wi-Fi. Deploy to a Vercel preview and try the preview on a phone with Wi-Fi switched off mid-submit. Do not promote to production without the owner's approval.
