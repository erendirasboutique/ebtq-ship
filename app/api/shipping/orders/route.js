import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { saveOrder, selectOrders } from '@/lib/supabaseRest';
import { formatAddress } from '@/lib/format';
export async function GET(){ const c=await cookies(); if(!isShippingAuthenticated(c)) return NextResponse.json({error:'Unauthorized'},{status:401}); return NextResponse.json({orders:await selectOrders()}); }
export async function POST(req){ const c=await cookies(); if(!isShippingAuthenticated(c)) return NextResponse.json({error:'Unauthorized'},{status:401}); const body=await req.json(); const row={...body, customer_address:body.customer_address || formatAddress(body), status:'draft', source:'shipcom'}; const saved=await saveOrder(row); return NextResponse.json({ok:true, order:saved, orders:await selectOrders()}); }
