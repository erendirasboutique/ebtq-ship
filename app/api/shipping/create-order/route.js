import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { createShipcomOrder } from '@/lib/shipcom';
import { updateOrder, selectOrders } from '@/lib/supabaseRest';
export async function POST(req){ const c=await cookies(); if(!isShippingAuthenticated(c)) return NextResponse.json({error:'Unauthorized'},{status:401}); try{ const order=await req.json(); const data=await createShipcomOrder(order); const id=data.orderID || data.id || data.data?.orderID || ''; const saved=await updateOrder(order.id,{shipcom_order_id:id,status:'order_created'}); return NextResponse.json({ok:true, order:saved, shipcom:data, orders:await selectOrders()}); }catch(error){ return NextResponse.json({error:error.message},{status:500}); } }
