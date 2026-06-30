import { NextResponse } from 'next/server';
import { setShippingCookie } from '@/lib/auth';

export async function POST(req) {
  try {
    const body = await req.json();
    const email = String(body.email || '').toLowerCase();
    const name = body.name || email.split('@')[0] || 'Team';
    const avatar = body.avatar || '';
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const res = NextResponse.json({ ok: true, user: { email, name, role: 'Staff', avatar } });
    setShippingCookie(res, { email, name, role: 'Staff', avatar });
    return res;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
