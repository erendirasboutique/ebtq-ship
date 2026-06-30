import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { selectCustomers, upsertCustomers } from '@/lib/supabaseRest';

export async function GET() {
  const c = await cookies();
  if (!isShippingAuthenticated(c)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ customers: await selectCustomers() });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const c = await cookies();
  if (!isShippingAuthenticated(c)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const customer = await req.json();
    const saved = await upsertCustomers([customer])
    return NextResponse.json({ customer: saved, customers: await selectCustomers() });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
