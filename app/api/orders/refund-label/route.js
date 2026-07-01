import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { refundShippoLabel } from '@/lib/shippo';
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

    if (!order?.shippo_transaction_id) {
      return NextResponse.json({ error: 'Missing Shippo transaction id' }, { status: 400 });
    }

    const refund = await refundShippoLabel(order.shippo_transaction_id);

    await updateOrder(order.id, {
      status: 'refund_requested',
      refund_status: refund.status || 'submitted',
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
