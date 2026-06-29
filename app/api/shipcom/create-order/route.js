import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { updateOrder } from '@/lib/supabaseRest';
import { createShipcomOrder } from '@/lib/shipcom';
export async function POST(req){const c=await cookies();if(!isShippingAuthenticated(c))return NextResponse.json({error:'Unauthorized'},{status:401});try{const order=await req.json();const data=await createShipcomOrder(order);const shipcom_order_id=data.orderID||data.orderId||data.id||data.object_id||'';const saved=order.id?await updateOrder(order.id,{shipcom_order_id,status:'order_created'}):null;return NextResponse.json({ok:true,data,shipcom_order_id,saved})}catch(e){return NextResponse.json({error:e.message},{status:500})}}
