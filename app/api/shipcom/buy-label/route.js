import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { updateOrder, selectOrders } from '@/lib/supabaseRest';
import { purchaseShipcomLabel, normalizeLabelResponse } from '@/lib/shipcom';
export async function POST(req){const c=await cookies();if(!isShippingAuthenticated(c))return NextResponse.json({error:'Unauthorized'},{status:401});try{const {order,rate}=await req.json();const data=await purchaseShipcomLabel(order,rate);const patch=normalizeLabelResponse(data,order);const saved=order.id?await updateOrder(order.id,patch):null;const orders=await selectOrders();return NextResponse.json({ok:true,data,patch,saved,orders})}catch(e){return NextResponse.json({error:e.message},{status:500})}}
