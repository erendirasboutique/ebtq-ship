import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { buyShippoLabel, normalizeShippoTransaction } from '@/lib/shippo';
import { updateOrder } from '@/lib/supabaseRest';

export async function POST(req) {
  const c = await cookies();

  if (!isShippingAuthenticated(c)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { order, rateId, rate } = await req.json();

    if (!order?.id) throw new Error('Missing order.');
    if (!rateId) throw new Error('Missing Shippo rate.');

    const tx = await buyShippoLabel(rateId);

    if (tx.status && tx.status !== 'SUCCESS') {
      throw new Error(tx.messages?.[0]?.text || `Shippo transaction failed: ${tx.status}`);
    }

    const patch = normalizeShippoTransaction(tx);

    const carrier =
      patch.carrier ||
      tx.rate?.provider ||
      rate?.provider ||
      rate?.carrier ||
      rate?.raw?.provider ||
      order.carrier ||
      '';

    const mailClass =
      patch.mail_class ||
      tx.rate?.servicelevel?.name ||
      rate?.servicelevel?.name ||
      rate?.service ||
      rate?.raw?.servicelevel?.name ||
      rate?.raw?.servicelevel?.token ||
      order.mail_class ||
      '';

    const postageAmount =
      patch.postage_amount ||
      tx.rate?.amount ||
      rate?.amount ||
      rate?.rate ||
      rate?.raw?.amount ||
      order.postage_amount ||
      '';

    const postageCurrency =
      patch.postage_currency ||
      tx.rate?.currency ||
      rate?.currency ||
      rate?.raw?.currency ||
      order.postage_currency ||
      'USD';

    const saved = await updateOrder(order.id, {
      ...patch,
      carrier,
      mail_class: mailClass,
      postage_amount: postageAmount,
      postage_currency: postageCurrency,
      label_purchased_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return NextResponse.json({ ok: true, order: saved, transaction: tx });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
