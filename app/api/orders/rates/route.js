import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { createShippoShipment, normalizeShippoRates } from '@/lib/shippo';
import { updateOrder } from '@/lib/supabaseRest';

export async function POST(req) {
  const c = await cookies();
  if (!isShippingAuthenticated(c)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { order } = await req.json();
    if (!order?.id) throw new Error('Save the order before getting rates.');

    const shipment = await createShippoShipment(order);
    const rates = normalizeShippoRates(shipment.rates || []);
    console.log('SHIPPO RATES RAW:', JSON.stringify(shipment.rates, null, 2));

    const saved = await updateOrder(order.id, {
      shippo_shipment_id: shipment.object_id,
      rates,
      status: 'rates_ready'
    });

    return NextResponse.json({ ok: true, order: saved, shipment, rates });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
