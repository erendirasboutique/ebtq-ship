import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { cancelShipcomLabel } from '@/lib/shipcom';
import { updateOrder, selectOrders } from '@/lib/supabaseRest';

export async function POST(req){
  const c = await cookies();
  if(!isShippingAuthenticated(c)) return NextResponse.json({error:'Unauthorized'}, {status:401});
  try{
    const order = await req.json();
    const result = await cancelShipcomLabel(order);
    const patched = await updateOrder(order.id, { status:'refund_requested', refund_response: JSON.stringify(result) });
    const orders = await selectOrders();
    return NextResponse.json({ok:true, result, order:patched, orders});
  }catch(error){
    return NextResponse.json({error:error.message}, {status:500});
  }
}
