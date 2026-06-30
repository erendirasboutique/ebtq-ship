export function fullAddress(x = {}) {
  return [
    x.address_line1,
    x.address_line2,
    [x.city, x.state, x.zip].filter(Boolean).join(', ')
  ].filter(Boolean).join('\n');
}

export function notificationText(o = {}) {
  const carrier = o.carrier || 'the shipping carrier';

  return `A package was shipped to you via ${carrier} and will be delivered to:

${o.customer_name || ''}
${o.customer_address || fullAddress(o)}

Shipment Date: ${new Date(o.updated_at || o.created_at || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })}
Mail Class: ${o.mail_class || ''}
Tracking Number: ${o.tracking_number || ''}

Check the package status:
https://track.erendirasboutique.com/?tracking=${o.tracking_number || ''}

For questions about this package, please contact us or ${carrier}.`;
}

export function normalizeCustomer(row = {}) {
  const first = (row.First || row.first || row.first_name || '').trim();
  const last = (row.Last || row.last || row.last_name || '').trim();

  const name = (
    row.customer_name ||
    row.Name ||
    row.name ||
    `${first} ${last}`.trim() ||
    row.Email ||
    row.Phone ||
    'Customer'
  ).trim();

  const address1 = row.Address1 || row.address1 || row.address_line1 || '';
  const address2 = row.Address2 || row.address2 || row.address_line2 || '';
  const city = row.City || row.city || '';
  const state = row.State || row.state || '';
  const zip = row.Zip || row.ZIP || row.zip || '';

  return {
    import_key: (row.Email || row.email || row.Phone || row.phone || `${name}-${address1}-${zip}`).toLowerCase(),
    first_name: first,
    last_name: last,
    customer_name: name,
    email: row.Email || row.email || '',
    phone: row.Phone || row.phone || '',
    customer_email: row.Email || row.email || '',
    customer_phone: row.Phone || row.phone || '',
    address_line1: address1,
    address_line2: address2,
    city,
    state,
    zip,
    country: 'US',
    customer_address: [
      address1,
      address2,
      [city, state, zip].filter(Boolean).join(', ')
    ].filter(Boolean).join('\n'),
    imported_order_count: Number(row.OrderCount || 0),
    imported_spend: Number(String(row.Spend || 0).replace(/[^0-9.]/g, '')) || 0,
    imported_reward_points: Number(row.RewardPoints || 0) || 0,
    order_count: Number(row.OrderCount || 0) || 0,
    spend: Number(String(row.Spend || 0).replace(/[^0-9.]/g, '')) || 0,
    reward_points: Number(row.RewardPoints || 0) || 0,
    imported_at: new Date().toISOString()
  };
}

export function normalizeShipment(shipment = {}) {
  const rate = shipment.selected_rate || shipment.rate || {};
  const label = shipment.postage_label || {};

  return {
    easypost_shipment_id: shipment.id || '',
    easypost_rate_id: rate.id || '',
    easypost_tracker_id: shipment.tracker?.id || '',
    easypost_postage_label_id: label.id || '',
    carrier: rate.carrier || '',
    mail_class: rate.service || '',
    tracking_number: shipment.tracking_code || '',
    tracking_url: shipment.tracker?.public_url || '',
    label_url: label.label_url || '',
    postage_amount: rate.rate || '',
    postage_currency: rate.currency || 'USD',
    status: 'label_purchased'
  };
}
