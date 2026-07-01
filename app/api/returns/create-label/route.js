import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { createShippoReturnShipment, cheapestUspsRate, buyShippoLabel, normalizeShippoReturnTransaction } from '@/lib/shippo';
import { updateReturnRequest, selectReturns } from '@/lib/supabaseRest';

export async function POST(req) {
  const c = await cookies();
  if (!isShippingAuthenticated(c)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { returnRequest } = await req.json();
    if (!returnRequest?.id) return NextResponse.json({ error: 'Missing return request' }, { status: 400 });

    const shipment = await createShippoReturnShipment(returnRequest);
    const rate = cheapestUspsRate(shipment.rates || []);
    if (!rate?.id) return NextResponse.json({ error: 'No USPS return rates were returned by Shippo.' }, { status: 400 });

    const tx = await buyShippoLabel(rate.id);
    if (tx.status && tx.status !== 'SUCCESS') throw new Error(tx.messages?.[0]?.text || `Shippo transaction failed: ${tx.status}`);

    const patch = {
      shippo_shipment_id: shipment.object_id,
      ...normalizeShippoReturnTransaction(tx, rate)
    };
    await updateReturnRequest(returnRequest.id, patch);
    return NextResponse.json({ ok: true, shipment, transaction: tx, returns: await selectReturns() });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
