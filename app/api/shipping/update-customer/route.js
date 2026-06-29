import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { updateCustomerOrders, selectOrders } from '@/lib/supabaseRest';

export async function POST(req){
  const c = await cookies();
  if(!isShippingAuthenticated(c)) return NextResponse.json({error:'Unauthorized'}, {status:401});
  try{
    const body = await req.json();
    const updated = await updateCustomerOrders(body.match || {}, body.patch || {});
    const orders = await selectOrders();
    return NextResponse.json({ok:true, updated, orders});
  }catch(error){
    return NextResponse.json({error:error.message}, {status:500});
  }
}
