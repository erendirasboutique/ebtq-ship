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

function enc(v) {
  return encodeURIComponent(v ?? '');
}

export async function selectOrders() {
  const res = await fetch(`${url}/rest/v1/shipping_orders?select=*&order=created_at.desc`, {
    headers: headers(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function selectCustomers() {
  const res = await fetch(`${url}/rest/v1/shipping_customers?select=*&order=customer_name.asc`, {
    headers: headers(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function upsertOrder(order) {
  const payload = { ...order, updated_at: new Date().toISOString() };
  const body = payload.id ? [payload] : [{ ...payload }];
  const endpoint = payload.id
    ? `${url}/rest/v1/shipping_orders?on_conflict=id`
    : `${url}/rest/v1/shipping_orders`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: headers({ Prefer: 'resolution=merge-duplicates,return=representation' }),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  const rows = await res.json();
  return rows[0];
}

export async function updateOrder(id, patch) {
  const res = await fetch(`${url}/rest/v1/shipping_orders?id=eq.${enc(id)}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() })
  });
  if (!res.ok) throw new Error(await res.text());
  const rows = await res.json();
  return rows[0];
}

export async function upsertCustomer(customer) {
  const importKey = customer.import_key || makeCustomerImportKey(customer);
  const payload = {
    ...customer,
    import_key: importKey,
    customer_name: customer.customer_name || [customer.first_name, customer.last_name].filter(Boolean).join(' ').trim(),
    updated_at: new Date().toISOString()
  };
  const res = await fetch(`${url}/rest/v1/shipping_customers?on_conflict=import_key`, {
    method: 'POST',
    headers: headers({ Prefer: 'resolution=merge-duplicates,return=representation' }),
    body: JSON.stringify([payload])
  });
  if (!res.ok) throw new Error(await res.text());
  const rows = await res.json();
  return rows[0];
}

export async function upsertCustomers(customers = []) {
  const rows = customers
    .map(c => ({
      ...c,
      customer_name: c.customer_name || [c.first_name, c.last_name].filter(Boolean).join(' ').trim(),
      import_key: c.import_key || makeCustomerImportKey(c),
      updated_at: new Date().toISOString()
    }))
    .filter(c => c.import_key && c.customer_name);

  if (!rows.length) return [];

  const res = await fetch(`${url}/rest/v1/shipping_customers?on_conflict=import_key`, {
    method: 'POST',
    headers: headers({ Prefer: 'resolution=merge-duplicates,return=representation' }),
    body: JSON.stringify(rows)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateCustomer(id, patch) {
  const payload = { ...patch, updated_at: new Date().toISOString() };
  if (payload.first_name || payload.last_name) {
    payload.customer_name = payload.customer_name || [payload.first_name, payload.last_name].filter(Boolean).join(' ').trim();
  }
  if (payload.address_line1 || payload.city || payload.state || payload.zip) {
    payload.customer_address = formatCustomerAddress(payload);
  }
  const res = await fetch(`${url}/rest/v1/shipping_customers?id=eq.${enc(id)}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
  const rows = await res.json();
  return rows[0];
}

export async function ordersForCustomer(customer) {
  let filter = '';
  if (customer.id) filter = `customer_id=eq.${enc(customer.id)}`;
  else if (customer.email) filter = `customer_email=eq.${enc(customer.email)}`;
  else filter = `customer_name=eq.${enc(customer.customer_name)}`;
  const res = await fetch(`${url}/rest/v1/shipping_orders?select=*&${filter}&order=created_at.desc`, {
    headers: headers(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function makeCustomerImportKey(c = {}) {
  const email = String(c.email || c.customer_email || '').trim().toLowerCase();
  if (email) return `email:${email}`;
  const phone = String(c.phone || c.customer_phone || '').replace(/\D/g, '');
  if (phone) return `phone:${phone}`;
  const name = String(c.customer_name || [c.first_name, c.last_name].filter(Boolean).join(' ')).trim().toLowerCase();
  const zip = String(c.zip || '').trim();
  const street = String(c.address_line1 || '').trim().toLowerCase();
  return `manual:${name}:${street}:${zip}`;
}

function formatCustomerAddress(c = {}) {
  return [
    c.address_line1,
    c.address_line2,
    [c.city, c.state, c.zip].filter(Boolean).join(', ')
  ].filter(Boolean).join('\n');
}
