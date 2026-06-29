import { NextResponse } from 'next/server';
import { clearCookie } from '@/lib/auth';
export async function POST(req){ const res=NextResponse.redirect(new URL('/shipping/login', req.url)); clearCookie(res); return res; }
