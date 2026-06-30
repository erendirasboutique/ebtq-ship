import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { refundEasyPostShipment } from '@/lib/easypost';
import { updateOrder, selectOrders } from '@/lib/supabaseRest';
export async function POST(req){const c=await cookies();if(!isShippingAuthenticated(c))return NextResponse.json({error:'Unauthorized'},{status:401});try{const {order}=await req.json();if(!order.easypost_shipment_id)throw new Error('Missing EasyPost shipment id.');const refund=await refundEasyPostShipment(order.easypost_shipment_id);await updateOrder(order.id,{status:'refund_requested',refund_response:JSON.stringify(refund)});return NextResponse.json({ok:true,refund,orders:await selectOrders()})}catch(e){return NextResponse.json({error:e.message},{status:500})}}
