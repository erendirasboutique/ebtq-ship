import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { PDFDocument } from 'pdf-lib';

export async function POST(req){
  const c = await cookies();
  if(!isShippingAuthenticated(c)) return NextResponse.json({error:'Unauthorized'}, {status:401});
  try{
    const { labels = [] } = await req.json();
    const urls = labels.filter(Boolean);
    if(!urls.length) return NextResponse.json({error:'No label URLs selected'}, {status:400});
    const merged = await PDFDocument.create();
    for(const url of urls){
      const res = await fetch(url, {cache:'no-store'});
      if(!res.ok) continue;
      const bytes = await res.arrayBuffer();
      const src = await PDFDocument.load(bytes);
      const pages = await merged.copyPages(src, src.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    const out = await merged.save();
    return new NextResponse(Buffer.from(out), { headers:{ 'Content-Type':'application/pdf', 'Content-Disposition':'inline; filename="erendiras-label-batch.pdf"' } });
  }catch(error){
    return NextResponse.json({error:error.message}, {status:500});
  }
}
