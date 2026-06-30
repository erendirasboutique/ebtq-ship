import { NextResponse } from 'next/server';
import { clearShippingCookie } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearShippingCookie(res);
  return res;
}
