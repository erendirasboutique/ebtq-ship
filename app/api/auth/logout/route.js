import { NextResponse } from 'next/server';import { clearCookie } from '@/lib/auth';
export async function POST(req){const res=NextResponse.redirect(new URL('/login',req.url));clearCookie(res);return res}
