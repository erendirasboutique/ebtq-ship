import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { updateCustomer, selectCustomers } from '@/lib/supabaseRest';

export async function POST(req) {
  const c = await cookies();
  if (!isShippingAuthenticated(c)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id, patch } = await req.json();
    if (!id) throw new Error('Missing customer id.');
    const customer = await updateCustomer(id, patch || {});
    return NextResponse.json({ customer, customers: await selectCustomers() });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
