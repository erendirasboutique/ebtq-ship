import { NextResponse } from 'next/server';
import { setCookie } from '@/lib/auth';
export async function POST(req){ const form=await req.formData(); if(form.get('password') !== process.env.SHIPPING_PORTAL_PASSWORD){ return NextResponse.redirect(new URL('/shipping/login?error=1', req.url)); } const res=NextResponse.redirect(new URL('/shipping', req.url)); setCookie(res); return res; }
