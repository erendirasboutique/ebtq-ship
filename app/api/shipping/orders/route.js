import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { selectOrders, upsertOrder } from '@/lib/supabaseRest';
import { fullAddress as formatAddress } from '@/lib/format';
export async function GET(){const c=await cookies();if(!isShippingAuthenticated(c))return NextResponse.json({error:'Unauthorized'},{status:401});try{return NextResponse.json({orders:await selectOrders()})}catch(e){return NextResponse.json({error:e.message},{status:500})}}
export async function POST(req){const c=await cookies();if(!isShippingAuthenticated(c))return NextResponse.json({error:'Unauthorized'},{status:401});try{const body=await req.json();const row=await upsertOrder({...body,customer_address:body.customer_address||formatAddress(body),status:body.status||'draft',source:'easypost'});return NextResponse.json({ok:true,order:row,orders:await selectOrders()})}catch(e){return NextResponse.json({error:e.message},{status:500})}}
