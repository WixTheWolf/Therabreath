'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from '@/lib/useSession';
import ConsolePanel from './ConsolePanel';
import type { Ctx } from './StageApp';

// Full-page Console for a phone, tablet or laptop, separate from the Stage.
export default function ConsoleApp({ code, k }: { code: string; k: string }) {
  const sess = useSession(code, { admin: true, interval: 450 });
  const [origin, setOrigin] = useState('');
  useEffect(() => { setOrigin(location.origin); document.documentElement.dataset.theme = 'b'; }, []);
  const ctx: Ctx = useMemo(() => ({ code, k, origin, joinUrl: `${origin}/j/${code}?k=${k}` }), [code, k, origin]);
  return <main className="console-page"><ConsolePanel sess={sess} ctx={ctx} /><p className="cx-survey">Pre-work survey link: <code>{origin}/survey/{code}?k={k}</code></p></main>;
}
