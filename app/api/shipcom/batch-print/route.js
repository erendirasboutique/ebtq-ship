import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
export async function POST(req){const c=await cookies();if(!isShippingAuthenticated(c))return NextResponse.json({error:'Unauthorized'},{status:401});const {labels=[]}=await req.json();return NextResponse.json({ok:true,labels,message:'Open each label URL and print. True PDF merging requires label URLs that allow server-side download.'})}
