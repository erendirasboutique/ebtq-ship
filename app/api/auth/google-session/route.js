import { NextResponse } from 'next/server';
import { setShippingCookie } from '@/lib/auth';
import { findStaffByEmail, selectStaffUsers } from '@/lib/supabaseRest';

function allowedByEnv(email = '') {
  const list = (process.env.AUTHORIZED_EMAILS || '')
    .split(',')
    .map(x => x.trim().toLowerCase())
    .filter(Boolean);
  if (!list.length) return null;
  return list.includes(email.toLowerCase());
}

export async function POST(req) {
  try {
    const body = await req.json();
    const email = String(body.email || '').toLowerCase();
    const name = body.name || email.split('@')[0] || 'Team';
    const avatar = body.avatar || '';
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const envAllowed = allowedByEnv(email);
    if (envAllowed === false) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    let role = 'staff';
    try {
      const staffRows = await selectStaffUsers();
      if (staffRows.length) {
        const staff = await findStaffByEmail(email);
        if (!staff) return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        role = staff.role || 'staff';
      }
    } catch {
      if (envAllowed !== true) {
        // If staff table is not installed yet, do not block the first setup.
        role = 'admin';
      }
    }

    const res = NextResponse.json({ ok: true, user: { email, name, role, avatar } });
    setShippingCookie(res, { email, name, role, avatar });
    return res;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
