import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { upsertCustomers, selectCustomers, makeCustomerImportKey } from '@/lib/supabaseRest';

function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', quote = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (ch === '"' && quote && next === '"') { cell += '"'; i++; continue; }
    if (ch === '"') { quote = !quote; continue; }
    if (ch === ',' && !quote) { row.push(cell); cell = ''; continue; }
    if ((ch === '\n' || ch === '\r') && !quote) {
      if (ch === '\r' && next === '\n') i++;
      row.push(cell); cell = '';
      if (row.some(v => String(v).trim())) rows.push(row);
      row = [];
      continue;
    }
    cell += ch;
  }
  row.push(cell);
  if (row.some(v => String(v).trim())) rows.push(row);
  if (!rows.length) return [];
  const headers = rows.shift().map(h => h.trim());
  return rows.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ''])));
}

function cleanPhone(v='') { return String(v).trim(); }
function money(v='') { return String(v).replace(/[^0-9.]/g, ''); }

function mapShipCustomer(row) {
  const first = row.First || row.first || row.first_name || '';
  const last = row.Last || row.last || row.last_name || '';
  const name = [first, last].filter(Boolean).join(' ').trim() || row.Name || row.customer_name || 'Customer';
  const address_line1 = row.Address1 || row.address1 || row.address_line1 || '';
  const address_line2 = row.Address2 || row.address2 || row.address_line2 || '';
  const city = row.City || row.city || '';
  const state = row.State || row.state || '';
  const zip = row.Zip || row.ZIP || row.zip || '';
  const customer = {
    first_name: first,
    last_name: last,
    customer_name: name,
    email: row.Email || row.email || '',
    phone: cleanPhone(row.Phone || row.phone || ''),
    address_line1,
    address_line2,
    city,
    state,
    zip,
    country: 'US',
    customer_address: [address_line1, address_line2, [city, state, zip].filter(Boolean).join(', ')].filter(Boolean).join('\n'),
    imported_order_count: Number(row.OrderCount || row.order_count || 0) || 0,
    imported_spend: money(row.Spend || row.spend || ''),
    reward_points: Number(row.RewardPoints || row.reward_points || 0) || 0,
    source: 'csv'
  };
  customer.import_key = makeCustomerImportKey(customer);
  return customer;
}

export async function POST(req) {
  const c = await cookies();
  if (!isShippingAuthenticated(c)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file) throw new Error('Choose a CSV file first.');
    const text = await file.text();
    const rows = parseCSV(text);
    const customers = rows.map(mapShipCustomer).filter(c => c.customer_name && (c.address_line1 || c.email || c.phone));
    const saved = await upsertCustomers(customers);
    return NextResponse.json({ ok: true, imported: saved.length, customers: await selectCustomers() });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
