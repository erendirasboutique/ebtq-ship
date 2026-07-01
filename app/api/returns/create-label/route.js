import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import {
  createShippoReturnShipment,
  cheapestUspsRate,
  buyShippoLabel
} from '@/lib/shippo';
import {
  updateReturnRequest,
  selectReturnRequests
} from '@/lib/supabaseRest';

export async function POST(req) {
  const c = await cookies();

  if (!isShippingAuthenticated(c)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { returnRequest } = await req.json();

    if (!returnRequest?.id) {
      return NextResponse.json({ error: 'Missing return request id' }, { status: 400 });
    }

    const shipment = await createShippoReturnShipment(returnRequest);
    const rate = cheapestUspsRate(shipment.rates || []);

    if (!rate?.object_id) {
      return NextResponse.json(
        { error: 'No USPS return rates were returned by Shippo.' },
        { status: 400 }
      );
    }

    const transaction = await buyShippoLabel(rate.object_id);

    if (transaction.status && transaction.status !== 'SUCCESS') {
      throw new Error(transaction.messages?.[0]?.text || `Shippo transaction failed: ${transaction.status}`);
    }

    await updateReturnRequest(returnRequest.id, {
      status: 'label_created',
      shippo_shipment_id: shipment.object_id,
      shippo_transaction_id: transaction.object_id,
      return_carrier: rate.provider || 'USPS',
      return_service: rate.servicelevel?.name || '',
      return_postage_amount: rate.amount || null,
      return_postage_currency: rate.currency || 'USD',
      return_tracking_number: transaction.tracking_number || '',
      return_tracking_url: transaction.tracking_url_provider || '',
      return_label_url: transaction.label_url || '',
      updated_at: new Date().toISOString()
    });

    const returns = await selectReturnRequests();

    return NextResponse.json({
      ok: true,
      shipment,
      transaction,
      returns
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
