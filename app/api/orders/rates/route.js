import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { createShippoShipment } from '@/lib/shippo';
import { updateOrder } from '@/lib/supabaseRest';

export async function POST(req) {
  const c = await cookies();

  if (!isShippingAuthenticated(c)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { order } = await req.json();

    if (!order) {
      return NextResponse.json({ error: 'Missing order' }, { status: 400 });
    }

    const shipment = await createShippoShipment(order);
    const rates = shipment.rates || [];

    let updatedOrder = order;

    if (order.id) {
      updatedOrder = await updateOrder(order.id, {
        shippo_shipment_id: shipment.object_id,
        rates,
        status: 'rates_ready'
      });
    }

    return NextResponse.json({
      ok: true,
      shipment,
      rates,
      order: updatedOrder
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
