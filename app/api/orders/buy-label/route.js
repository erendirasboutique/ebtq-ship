import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { buyShippoLabel, normalizeShippoTransaction } from '@/lib/shippo';
import { updateOrder } from '@/lib/supabaseRest';

export async function POST(req) {
  const c = await cookies();
  if (!isShippingAuthenticated(c)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { order, rateId } = await req.json();
    if (!order?.id) throw new Error('Missing order.');
    if (!rateId) throw new Error('Missing Shippo rate.');

    const tx = await buyShippoLabel(rateId);
    if (tx.status && tx.status !== 'SUCCESS') throw new Error(tx.messages?.[0]?.text || `Shippo transaction failed: ${tx.status}`);

    const patch = normalizeShippoTransaction(tx);
    const saved = await updateOrder(order.id, patch);
    return NextResponse.json({ ok: true, order: saved, transaction: tx });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
