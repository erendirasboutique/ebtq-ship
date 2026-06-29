const BASE = process.env.SHIPCOM_BASE_URL || 'https://app.ship.com';

function token(){ return process.env.SHIPCOM_ACCESS_TOKEN || process.env.SHIPCOM_API_KEY || ''; }
function authHeaders(){ const t=token(); if(!t) throw new Error('Missing SHIPCOM_ACCESS_TOKEN in Vercel'); return {'Content-Type':'application/json', Authorization:`Bearer ${t}`}; }
async function shipcom(path, options={}){ const res=await fetch(`${BASE}${path}`,{...options,headers:{...authHeaders(),...(options.headers||{})},cache:'no-store'}); const text=await res.text(); let data; try{data=JSON.parse(text)}catch{data=text} if(!res.ok) throw new Error(`Ship.com API failed: ${res.status} ${typeof data==='string'?data:JSON.stringify(data)}`); return data; }

export async function createShipcomOrder(order){
  const body={
    toAddress:{ name:order.customer_name, street1:order.address_line1, street2:order.address_line2 || '', city:order.city, state:order.state, zip:order.zip, country:order.country || 'US', email:order.customer_email || '', phone:order.customer_phone || '' },
    fromAddress:{ name:process.env.SHIP_FROM_NAME || "Erendira's Boutique", street1:process.env.SHIP_FROM_STREET1, street2:process.env.SHIP_FROM_STREET2 || '', city:process.env.SHIP_FROM_CITY, state:process.env.SHIP_FROM_STATE, zip:process.env.SHIP_FROM_ZIP, country:'US' },
    package:{ weight:order.parcel_weight, weightUnit:order.weight_unit || 'oz', length:order.parcel_length, width:order.parcel_width, height:order.parcel_height },
    reference: order.reference || order.id
  };
  return shipcom(process.env.SHIPCOM_CREATE_ORDER_PATH || '/public/orders', {method:'POST', body:JSON.stringify(body)});
}

export async function getShipcomRates(order){
  const body={
    orderID: order.shipcom_order_id,
    destination:{ name:order.customer_name, street1:order.address_line1, street2:order.address_line2 || '', city:order.city, state:order.state, zip:order.zip, country:order.country || 'US' },
    package:{ weight:order.parcel_weight, weightUnit:order.weight_unit || 'oz', length:order.parcel_length, width:order.parcel_width, height:order.parcel_height },
    shipDate: order.ship_date
  };
  return shipcom(process.env.SHIPCOM_RATES_PATH || '/public/rates', {method:'POST', body:JSON.stringify(body)});
}

export async function purchaseShipcomLabel(order, rate){
  const body={
    orderID: order.shipcom_order_id,
    rateID: rate.rateID || rate.id || order.rate_id,
    packageID: rate.packageID || order.package_id,
    shippingMethod: rate.shippingMethod || rate.carrier || order.carrier,
    serviceLevel: rate.serviceLevel || rate.service || order.mail_class,
    weight: order.parcel_weight,
    shipDate: order.ship_date,
    signature: Boolean(order.require_signature),
    insurance: Boolean(order.insurance_enabled),
    insureShipping: Boolean(order.insure_shipping),
    insuredValue: order.insured_value || undefined,
    saturdayDeliveryUPS: Boolean(order.saturday_delivery_ups),
    additionalHandlingUPS: Boolean(order.additional_handling_ups),
    packageTypeUPS: order.package_type_ups || undefined,
    printerType: order.printer_type || 'thermal-wide'
  };
  return shipcom(process.env.SHIPCOM_PURCHASE_LABEL_PATH || '/public/purchase-label', {method:'POST', body:JSON.stringify(body)});
}

export async function cancelShipcomLabel(order){
  const path = process.env.SHIPCOM_CANCEL_LABEL_PATH;
  if (!path) {
    throw new Error('Ship.com cancel/refund endpoint is not configured. Add SHIPCOM_CANCEL_LABEL_PATH in Vercel after Ship.com confirms the endpoint for your account.');
  }
  return shipcom(path, { method:'POST', body: JSON.stringify({ orderID: order.shipcom_order_id, labelID: order.shipcom_label_id, trackingNumber: order.tracking_number }) });
}
