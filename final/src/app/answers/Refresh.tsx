'use client';
// Re-reads the answers on the server every few seconds while the page is open, so new ones appear without a reload.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Refresh({ secs }: { secs: number }) {
  const router = useRouter();
  useEffect(() => { const id = setInterval(() => router.refresh(), secs * 1000); return () => clearInterval(id); }, [router, secs]);
  return null;
}
