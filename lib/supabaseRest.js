const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

function headers(extra = {}) {
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
    ...extra
  };
}

async function sfetch(path, options = {}) {
  const res = await fetch(`${url}/rest/v1${path}`, {
    ...options,
    headers: { ...headers(), ...(options.headers || {}) },
    cache: 'no-store'
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : []; } catch { data = text; }
  if (!res.ok) throw new Error(typeof data === 'string' ? data : JSON.stringify(data));
  return data;
}

export const selectOrders = () => sfetch('/shipping_orders?select=*&order=created_at.desc');
export const selectCustomers = () => sfetch('/shipping_customers?select=*&order=customer_name.asc');
export const selectStaffUsers = () => sfetch('/staff_users?select=*&order=created_at.asc');

export async function findStaffByEmail(email = '') {
  const safeEmail = encodeURIComponent(String(email).toLowerCase());
  const rows = await sfetch(`/staff_users?email=eq.${safeEmail}&select=*`);
  return rows[0] || null;
}

export async function upsertOrder(order) {
  const clean = { ...order, updated_at: new Date().toISOString() };
  delete clean.rates_display;
  const rows = await sfetch('/shipping_orders?on_conflict=id', {
    method: 'POST',
    headers: headers({ Prefer: 'resolution=merge-duplicates,return=representation' }),
    body: JSON.stringify([clean])
  });
  return rows[0];
}

export async function updateOrder(id, patch) {
  const rows = await sfetch(`/shipping_orders?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() })
  });
  return rows[0];
}

export async function upsertCustomers(rows = []) {
  const cleaned = rows
    .filter(r => r.customer_name || r.email || r.phone)
    .map(r => ({
      ...r,
      import_key: r.import_key || String(r.email || r.phone || `${r.customer_name}-${r.zip}`).toLowerCase(),
      customer_email: r.customer_email || r.email || '',
      customer_phone: r.customer_phone || r.phone || '',
      updated_at: new Date().toISOString()
    }));
  if (!cleaned.length) return [];
  const unique = Array.from(new Map(cleaned.map(r => [r.import_key, r])).values());
  return sfetch('/shipping_customers?on_conflict=import_key', {
    method: 'POST',
    headers: headers({ Prefer: 'resolution=merge-duplicates,return=representation' }),
    body: JSON.stringify(unique)
  });
}

export async function updateCustomer(id, patch) {
  const rows = await sfetch(`/shipping_customers?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() })
  });
  return rows[0];
}
