import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { updateOrder, selectOrders, updateCustomer, selectCustomers } from '@/lib/supabaseRest';
export async function POST(req){const c=await cookies();if(!isShippingAuthenticated(c))return NextResponse.json({error:'Unauthorized'},{status:401});try{const body=await req.json();if(body.customerMatch){const customers=await updateCustomer(body.customerMatch,body.patch||{});return NextResponse.json({ok:true,customers})}const order=await updateOrder(body.id,body.patch||body);const orders=await selectOrders();return NextResponse.json({ok:true,order,orders})}catch(e){return NextResponse.json({error:e.message},{status:500})}}
