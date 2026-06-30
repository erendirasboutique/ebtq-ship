import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { PDFDocument } from 'pdf-lib';
export async function POST(req){const c=await cookies();if(!isShippingAuthenticated(c))return NextResponse.json({error:'Unauthorized'},{status:401});try{const {urls=[]}=await req.json();if(!urls.length)throw new Error('No label URLs selected.');const merged=await PDFDocument.create();for(const url of urls){const r=await fetch(url);if(!r.ok)continue;const bytes=await r.arrayBuffer();const pdf=await PDFDocument.load(bytes);const pages=await merged.copyPages(pdf,pdf.getPageIndices());pages.forEach(p=>merged.addPage(p))}const out=await merged.save();return new NextResponse(Buffer.from(out),{headers:{'Content-Type':'application/pdf','Content-Disposition':'inline; filename="erendiras-label-batch.pdf"'}})}catch(e){return NextResponse.json({error:e.message},{status:500})}}
