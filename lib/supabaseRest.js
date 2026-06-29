const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

function headers(extra = {}) {
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
    ...extra
  };
}

export async function selectOrders() {
  const res = await fetch(`${url}/rest/v1/shipping_orders?select=*&order=created_at.desc`, {
    headers: headers(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function selectOrder(id) {
  const res = await fetch(`${url}/rest/v1/shipping_orders?id=eq.${encodeURIComponent(id)}&select=*`, {
    headers: headers(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(await res.text());
  const rows = await res.json();
  return rows[0] || null;
}

export async function selectCustomers() {
  const rows = await selectOrders();
  const map = new Map();
  for (const row of rows) {
    const key = row.customer_email || row.customer_phone || `${row.customer_name || 'Customer'}-${row.zip || ''}`;
    if (!map.has(key)) {
      map.set(key, { ...row, orders: [], order_count: 0 });
    }
    const c = map.get(key);
    c.orders.push(row);
    c.order_count += 1;
  }
  return Array.from(map.values()).sort((a, b) => String(a.customer_name || '').localeCompare(String(b.customer_name || '')));
}

export async function saveOrder(row) {
  const payload = { ...row, updated_at: new Date().toISOString() };
  const res = await fetch(`${url}/rest/v1/shipping_orders?on_conflict=id`, {
    method: 'POST',
    headers: headers({ Prefer: 'resolution=merge-duplicates,return=representation' }),
    body: JSON.stringify([payload])
  });
  if (!res.ok) throw new Error(await res.text());
  const rows = await res.json();
  return rows[0];
}

export async function updateOrder(id, patch) {
  const res = await fetch(`${url}/rest/v1/shipping_orders?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() })
  });
  if (!res.ok) throw new Error(await res.text());
  const rows = await res.json();
  return rows[0];
}

export async function updateCustomerOrders(match, patch) {
  const filters = [];
  if (match.customer_email) filters.push(`customer_email=eq.${encodeURIComponent(match.customer_email)}`);
  else if (match.customer_phone) filters.push(`customer_phone=eq.${encodeURIComponent(match.customer_phone)}`);
  else if (match.customer_name) filters.push(`customer_name=eq.${encodeURIComponent(match.customer_name)}`);
  if (!filters.length) throw new Error('No customer match field provided');
  const res = await fetch(`${url}/rest/v1/shipping_orders?${filters[0]}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
