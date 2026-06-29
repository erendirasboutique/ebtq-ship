import { NextResponse } from 'next/server';
import { portalPassword,setShippingCookie } from '@/lib/auth';
export async function POST(req){const form=await req.formData();const password=form.get('password');if(password!==portalPassword())return NextResponse.redirect(new URL('/shipping/login?error=1',req.url));const res=NextResponse.redirect(new URL('/shipping',req.url));setShippingCookie(res);return res}
