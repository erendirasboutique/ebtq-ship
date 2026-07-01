const BASE = 'https://api.goshippo.com';

function token() {
  const t = process.env.SHIPPO_API_TOKEN;
  if (!t) throw new Error('Missing SHIPPO_API_TOKEN');
  return t;
}

async function shippoFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `ShippoToken ${token()}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    cache: 'no-store'
  });

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`Shippo API failed: ${res.status} ${JSON.stringify(data)}`);
  return data;
}

export function toOz(lb = 0, oz = 0) {
  return Number(lb || 0) * 16 + Number(oz || 0);
}

export function shipFromAddress() {
  return {
    name: "Erendira's Boutique",
    company: "Erendira's Boutique",
    street1: '17121 Hawthorne Ave',
    city: 'Fontana',
    state: 'CA',
    zip: '92335',
    country: 'US',
    phone: process.env.SHIP_FROM_PHONE || undefined,
    email: process.env.SHIP_FROM_EMAIL || undefined
  };
}

function cleanAddress(a = {}) {
  return Object.fromEntries(Object.entries(a).filter(([, v]) => v !== undefined && v !== null && v !== ''));
}

export function buildShipmentPayload(order = {}) {
  return {
    address_from: cleanAddress(shipFromAddress()),
    address_to: cleanAddress({
      name: order.customer_name || 'Customer',
      street1: order.address_line1,
      street2: order.address_line2 || undefined,
      city: order.city,
      state: order.state,
      zip: order.zip,
      country: order.country || 'US',
      phone: order.customer_phone || order.phone || undefined,
      email: order.customer_email || order.email || undefined
    }),
    parcels: [{
  length: String(order.parcel_length || 13),
  width: String(order.parcel_width || 10),
  height: String(order.parcel_height || 10),
  distance_unit: 'in',
  weight: String(order.parcel_weight || toOz(order.parcel_weight_lb, order.parcel_weight_oz) || 0),
  mass_unit: 'oz'
}],
extra: {
  signature_confirmation: order.signature_required ? 'STANDARD' : undefined
},
async: false
  };
}

export function buildReturnShipmentPayload(r = {}) {
  return {
    address_from: cleanAddress({
      name: r.customer_name || 'Customer',
      street1: r.address_line1,
      street2: r.address_line2 || undefined,
      city: r.city,
      state: r.state,
      zip: r.zip,
      country: r.country || 'US',
      phone: r.customer_phone || undefined,
      email: r.customer_email || undefined
    }),
    address_to: cleanAddress(shipFromAddress()),
    parcels: [{
      length: String(r.parcel_length || 13),
      width: String(r.parcel_width || 10),
      height: String(r.parcel_height || 10),
      distance_unit: 'in',
      weight: String(r.parcel_weight || toOz(r.parcel_weight_lb, r.parcel_weight_oz) || 16),
      mass_unit: 'oz'
    }],
    async: false
  };
}

export async function createShippoShipment(order) {
  return shippoFetch('/shipments/', { method: 'POST', body: JSON.stringify(buildShipmentPayload(order)) });
}

export async function createShippoReturnShipment(returnRequest) {
  return shippoFetch('/shipments/', { method: 'POST', body: JSON.stringify(buildReturnShipmentPayload(returnRequest)) });
}

export function normalizeShippoRate(rate = {}) {
  const provider = rate.provider || rate.carrier || '';
  const service = rate.servicelevel?.name || rate.servicelevel?.token || rate.service || '';
  const amount = rate.amount || rate.rate || '';
  const currency = rate.currency || 'USD';
  return {
    id: rate.object_id || rate.id || '',
    object_id: rate.object_id || rate.id || '',
    provider,
    carrier: provider,
    service,
    servicelevel: rate.servicelevel || {},
    amount,
    rate: amount,
    currency,
    duration_terms: rate.duration_terms || '',
    estimated_days: rate.estimated_days || rate.delivery_days || '',
    raw: rate
  };
}

export function normalizeShippoRates(rates = []) {
  return (rates || []).map(normalizeShippoRate).sort((a, b) => Number(a.rate || 0) - Number(b.rate || 0));
}

export function cheapestRate(rates = []) {
  return normalizeShippoRates(rates)[0];
}

export function cheapestUspsRate(rates = []) {
  return normalizeShippoRates(rates).filter(r => String(r.carrier || '').toUpperCase() === 'USPS')[0];
}

export async function buyShippoLabel(rateId) {
  return shippoFetch('/transactions/', {
    method: 'POST',
    body: JSON.stringify({ rate: rateId, label_file_type: 'PDF_4x6', async: false })
  });
}

export async function refundShippoLabel(transactionId) {
  return shippoFetch('/refunds/', {
    method: 'POST',
    body: JSON.stringify({ transaction: transactionId, async: false })
  });
}

export function normalizeShippoTransaction(tx = {}) {
  const rate = normalizeShippoRate(tx.rate || {});
  return {
    shippo_transaction_id: tx.object_id || '',
    label_url: tx.label_url || '',
    tracking_number: tx.tracking_number || '',
    tracking_url: tx.tracking_url_provider || '',
    carrier: rate.carrier || tx.provider || '',
    mail_class: rate.service || '',
    postage_amount: rate.rate || '',
    postage_currency: rate.currency || 'USD',
    status: tx.status === 'SUCCESS' ? 'label_purchased' : (tx.status || 'label_purchased'),
    batch_selected: true
  };
}

export function normalizeShippoReturnTransaction(tx = {}, rate = {}) {
  const r = normalizeShippoRate(tx.rate || rate || {});
  return {
    shippo_transaction_id: tx.object_id || '',
    return_tracking_number: tx.tracking_number || '',
    return_tracking_url: tx.tracking_url_provider || '',
    return_label_url: tx.label_url || '',
    return_carrier: r.carrier || 'USPS',
    return_service: r.service || '',
    return_postage_amount: r.rate || null,
    return_postage_currency: r.currency || 'USD',
    status: tx.status === 'SUCCESS' ? 'label_created' : (tx.status || 'label_created')
  };
}
