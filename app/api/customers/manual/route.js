import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { upsertCustomers, selectCustomers } from '@/lib/supabaseRest';

export async function POST(req){
  const c=await cookies();
  if(!isShippingAuthenticated(c))return NextResponse.json({error:'Unauthorized'},{status:401});
  try{
    const body=await req.json();
    const name=body.customer_name||'Customer';
    const row={
      import_key:(body.customer_email||body.customer_phone||`${name}-${body.address_line1}-${body.zip}`).toLowerCase(),
      customer_name:name,
      email:body.customer_email||'',
      phone:body.customer_phone||'',
      customer_email:body.customer_email||'',
      customer_phone:body.customer_phone||'',
      address_line1:body.address_line1||'',
      address_line2:body.address_line2||'',
      city:body.city||'',
      state:body.state||'',
      zip:body.zip||'',
      country:body.country||'US',
      customer_address:[body.address_line1,body.address_line2,[body.city,body.state,body.zip].filter(Boolean).join(', ')].filter(Boolean).join('\n'),
      notes:body.notes||'',
      updated_at:new Date().toISOString()
    };
    const saved=await upsertCustomers([row]);
    const customers=await selectCustomers();
    return NextResponse.json({ok:true,customer:saved[0],customers});
  }catch(e){return NextResponse.json({error:e.message},{status:500})}
}
