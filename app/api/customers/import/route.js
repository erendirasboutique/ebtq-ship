import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { normalizeCustomer } from '@/lib/format';
import { upsertCustomers, selectCustomers } from '@/lib/supabaseRest';

export async function POST(req) {
  const c = await cookies();

  if (!isShippingAuthenticated(c)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const rowsRaw = (body.rows || [])
      .map(normalizeCustomer)
      .filter(row => row.customer_name);

    const rows = Array.from(
      new Map(
        rowsRaw.map(row => [
          row.import_key ||
          row.email ||
          row.phone ||
          `${row.customer_name}-${row.address_line1}-${row.zip}`,
          row
        ])
      ).values()
    );

    const saved = rows.length ? await upsertCustomers(rows) : [];
    const customers = await selectCustomers();

    return NextResponse.json({
      ok: true,
      imported: saved.length,
      skipped_duplicates: rowsRaw.length - rows.length,
      customers
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
