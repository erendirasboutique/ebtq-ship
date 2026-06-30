import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { refundEasyPostShipment } from '@/lib/easypost';
import { updateOrder, selectOrders } from '@/lib/supabaseRest';

export async function POST(req) {
  const c = await cookies();

  if (!isShippingAuthenticated(c)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { order } = await req.json();

    if (!order?.id) {
      return NextResponse.json({ error: 'Missing order id' }, { status: 400 });
    }

    if (!order?.easypost_shipment_id) {
      return NextResponse.json({ error: 'Missing EasyPost shipment id' }, { status: 400 });
    }

    const refund = await refundEasyPostShipment(order.easypost_shipment_id);

    await updateOrder(order.id, {
      status: refund?.refund_status || 'refund_requested',
      refund_status: refund?.refund_status || 'submitted',
      refunded_at: new Date().toISOString()
    });

    const orders = await selectOrders();

    return NextResponse.json({
      ok: true,
      refund,
      orders
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
