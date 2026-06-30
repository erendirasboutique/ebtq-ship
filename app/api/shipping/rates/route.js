import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { createEasyPostShipment } from '@/lib/easypost';
import { updateOrder, selectOrders } from '@/lib/supabaseRest';
export async function POST(req){const c=await cookies();if(!isShippingAuthenticated(c))return NextResponse.json({error:'Unauthorized'},{status:401});try{const order=await req.json();const shipment=await createEasyPostShipment(order);await updateOrder(order.id,{easypost_shipment_id:shipment.id,status:'rates_ready'});return NextResponse.json({ok:true,shipment_id:shipment.id,rates:shipment.rates||[],orders:await selectOrders()})}catch(e){return NextResponse.json({error:e.message},{status:500})}}
