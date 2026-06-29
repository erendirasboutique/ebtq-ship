import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { getShipcomRates } from '@/lib/shipcom';
export async function POST(req){const c=await cookies();if(!isShippingAuthenticated(c))return NextResponse.json({error:'Unauthorized'},{status:401});try{const order=await req.json();const data=await getShipcomRates(order);const rates=data.rates||data.data||data.result||[];return NextResponse.json({ok:true,rates,data})}catch(e){return NextResponse.json({error:e.message},{status:500})}}
