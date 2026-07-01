import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { buyShippoLabel, normalizeShippoTransaction } from '@/lib/shippo';
import { updateOrder, selectOrders } from '@/lib/supabaseRest';

export async function POST(req) {
  const c = await cookies();

  if (!isShippingAuthenticated(c)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const order = body.order || {};
    const rateId = body.rateId || body.rate_id;

    if (!order.id) {
      return NextResponse.json({ error: 'Missing order id' }, { status: 400 });
    }

    if (!rateId) {
      return NextResponse.json({ error: 'Missing Shippo rate id' }, { status: 400 });
    }

    const transaction = await buyShippoLabel(rateId);

    if (transaction.status && transaction.status !== 'SUCCESS') {
      throw new Error(transaction.messages?.[0]?.text || `Shippo transaction failed: ${transaction.status}`);
    }

    const normalized = normalizeShippoTransaction(transaction);

    await updateOrder(order.id, {
      ...normalized,
      updated_at: new Date().toISOString()
    });

    const orders = await selectOrders();

    return NextResponse.json({
      ok: true,
      transaction,
      order: {
        ...order,
        ...normalized
      },
      orders
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
