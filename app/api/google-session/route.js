import { NextResponse } from 'next/server';
import { setShippingCookie } from '@/lib/auth';

export async function POST(req) {
  const body = await req.json();
  const email = body.email || '';

  const res = NextResponse.json({ ok: true });
  setShippingCookie(res, email);

  return res;
}
