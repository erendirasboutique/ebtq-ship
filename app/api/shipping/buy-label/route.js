import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { buyEasyPostLabel } from '@/lib/easypost';
import { updateOrder, selectOrders } from '@/lib/supabaseRest';
import { normalizeShipment } from '@/lib/format';
export async function POST(req){const c=await cookies();if(!isShippingAuthenticated(c))return NextResponse.json({error:'Unauthorized'},{status:401});try{const {order,rate}=await req.json();const shipmentId=order.easypost_shipment_id;if(!shipmentId)throw new Error('Missing EasyPost shipment id. Get rates first.');const shipment=await buyEasyPostLabel(shipmentId,rate.id);const patch=normalizeEasyPostShipment(shipment,order,rate);await updateOrder(order.id,patch);return NextResponse.json({ok:true,shipment,orders:await selectOrders()})}catch(e){return NextResponse.json({error:e.message},{status:500})}}
