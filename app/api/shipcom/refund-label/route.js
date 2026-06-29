import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { updateOrder } from '@/lib/supabaseRest';
import { refundShipcomLabel } from '@/lib/shipcom';
export async function POST(req){const c=await cookies();if(!isShippingAuthenticated(c))return NextResponse.json({error:'Unauthorized'},{status:401});try{const order=await req.json();const data=await refundShipcomLabel(order);const saved=order.id?await updateOrder(order.id,{status:'refund_requested',refund_response:JSON.stringify(data)}):null;return NextResponse.json({ok:true,data,saved})}catch(e){return NextResponse.json({error:e.message},{status:500})}}
