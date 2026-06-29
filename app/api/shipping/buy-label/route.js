import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { purchaseShipcomLabel } from '@/lib/shipcom';
import { normalizeShipcomLabel } from '@/lib/format';
import { updateOrder, selectOrders } from '@/lib/supabaseRest';
export async function POST(req){ const c=await cookies(); if(!isShippingAuthenticated(c)) return NextResponse.json({error:'Unauthorized'},{status:401}); try{ const {order,rate}=await req.json(); const data=await purchaseShipcomLabel(order,rate||{}); const patch=normalizeShipcomLabel(data,order); const saved=await updateOrder(order.id,{...patch,carrier:rate?.carrier || rate?.shippingMethod || order.carrier, mail_class:rate?.serviceLevel || rate?.service || order.mail_class, shipment_date:order.ship_date || new Date().toLocaleDateString('en-US')}); return NextResponse.json({ok:true, order:saved, label:data, orders:await selectOrders()}); }catch(error){ return NextResponse.json({error:error.message},{status:500}); } }
