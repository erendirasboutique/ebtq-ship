import { NextResponse } from 'next/server';
import { portalPassword, setShippingCookie } from '@/lib/auth';
export async function POST(req){const form=await req.formData();if(form.get('password')!==portalPassword())return NextResponse.redirect(new URL('/login?error=1',req.url));const res=NextResponse.redirect(new URL('/',req.url));setShippingCookie(res);return res}
