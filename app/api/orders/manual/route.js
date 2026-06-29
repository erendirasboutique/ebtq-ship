import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { createOrder, selectOrders } from '@/lib/supabaseRest';
export async function POST(req){const c=await cookies();if(!isShippingAuthenticated(c))return NextResponse.json({error:'Unauthorized'},{status:401});try{const body=await req.json();const order=await createOrder({...body,status:body.status||'draft',source:'shipcom'});const orders=await selectOrders();return NextResponse.json({ok:true,order,orders})}catch(e){return NextResponse.json({error:e.message},{status:500})}}
