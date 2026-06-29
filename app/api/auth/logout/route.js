import { NextResponse } from 'next/server';
import { clearShippingCookie } from '@/lib/auth';
export async function POST(req){const res=NextResponse.redirect(new URL('/shipping/login',req.url));clearShippingCookie(res);return res}
