export function formatAddress(o = {}) {
  return [
    o.address_line1,
    o.address_line2,
    [o.city, o.state, o.zip].filter(Boolean).join(', ')
  ].filter(Boolean).join('\n');
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function notificationText(o = {}) {
  const carrier = o.carrier || 'the shipping carrier';
  return `A package was shipped to you via ${carrier} and will be delivered to:\n\n${o.customer_name || ''}\n${o.customer_address || formatAddress(o)}\n\nShipment Date: ${o.shipment_date || today()}\nMail Class: ${o.mail_class || ''}\nTracking Number: ${o.tracking_number || ''}\n\nCheck the package status:\nhttps://track.erendirasboutique.com/?tracking=${o.tracking_number || ''}\n\nFor questions about this package, please contact us or ${carrier}.`;
}

export function normalizeEasyPostShipment(shipment = {}, order = {}, rate = {}) {
  const selected = shipment.selected_rate || rate || {};
  const tracker = shipment.tracker || {};
  const label = shipment.postage_label || {};
  return {
    easypost_shipment_id: shipment.id || order.easypost_shipment_id || '',
    easypost_rate_id: selected.id || order.easypost_rate_id || '',
    easypost_tracker_id: tracker.id || '',
    easypost_postage_label_id: label.id || order.easypost_postage_label_id || '',
    carrier: selected.carrier || order.carrier || '',
    mail_class: selected.service || order.mail_class || '',
    tracking_number: tracker.tracking_code || shipment.tracking_code || order.tracking_number || '',
    tracking_url: tracker.public_url || order.tracking_url || '',
    label_url: label.label_url || label.label_pdf_url || order.label_url || '',
    shipment_date: today(),
    status: shipment.status || 'label_created',
    postage_amount: selected.rate || order.postage_amount || '',
    postage_currency: selected.currency || order.postage_currency || 'USD',
    source: 'easypost'
  };
}
