function apiKey() {
  const k = process.env.EASYPOST_API_KEY;
  if (!k) throw new Error('Missing EASYPOST_API_KEY');
  return k;
}

function auth() {
  return 'Basic ' + Buffer.from(`${apiKey()}:`).toString('base64');
}

async function epFetch(path, options = {}) {
  const res = await fetch(`https://api.easypost.com/v2${path}`, {
    ...options,
    headers: {
      Authorization: auth(),
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    cache: 'no-store'
  });

  const text = await res.text();

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`EasyPost API failed: ${res.status} ${JSON.stringify(data)}`);
  }

  return data;
}

export function buildShipmentPayload(order = {}) {
  return {
    shipment: {
      to_address: {
        name: order.customer_name,
        street1: order.address_line1,
        street2: order.address_line2 || undefined,
        city: order.city,
        state: order.state,
        zip: order.zip,
        country: order.country || 'US',
        phone: order.customer_phone || undefined,
        email: order.customer_email || undefined
      },

      from_address: {
        company: "Erendira's Boutique",
        street1: '17121 Hawthorne Ave',
        city: 'Fontana',
        state: 'CA',
        zip: '92335',
        country: 'US',
        phone: process.env.SHIP_FROM_PHONE || undefined,
        email: process.env.SHIP_FROM_EMAIL || undefined
      },

      parcel: {
        length: Number(order.parcel_length || 13),
        width: Number(order.parcel_width || 10),
        height: Number(order.parcel_height || 10),
        weight: Number(order.parcel_weight || 16)
      },

      options: {
        label_format: 'PDF',
        print_custom_1: order.customer_name || undefined
      },

      reference: order.id || undefined
    }
  };
}

export async function createEasyPostShipment(order) {
  return epFetch('/shipments', {
    method: 'POST',
    body: JSON.stringify(buildShipmentPayload(order))
  });
}

export async function buyEasyPostLabel(shipmentId, rateId) {
  return epFetch(`/shipments/${shipmentId}/buy`, {
    method: 'POST',
    body: JSON.stringify({
      rate: {
        id: rateId
      }
    })
  });
}

export async function refundEasyPostShipment(shipmentId) {
  return epFetch(`/shipments/${shipmentId}/refund`, {
    method: 'POST',
    body: JSON.stringify({})
  });
}
