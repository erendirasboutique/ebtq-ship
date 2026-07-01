import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { mergeCustomers } from '@/lib/supabaseRest';

export async function POST(req) {
  const c = await cookies();

  if (!isShippingAuthenticated(c)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const customers = await mergeCustomers(body);

    return NextResponse.json({ ok: true, customers });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
