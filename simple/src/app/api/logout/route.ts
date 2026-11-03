import { NextResponse } from 'next/server';
import { COOKIE, HOST_COOKIE } from '@/lib/auth';
export async function POST() { const r = NextResponse.json({ ok: true }); r.cookies.delete(COOKIE); r.cookies.delete(HOST_COOKIE); return r; }
