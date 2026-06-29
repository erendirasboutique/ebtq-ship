import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ShippingStudio from '@/components/ShippingStudio';
import { isShippingAuthenticated } from '@/lib/auth';
import { selectOrders } from '@/lib/supabaseRest';
export const dynamic='force-dynamic';
export default async function ShippingPage(){ const c=await cookies(); if(!isShippingAuthenticated(c)) redirect('/shipping/login'); let orders=[]; let loadError=''; try{orders=await selectOrders()}catch(e){loadError=e.message} return <ShippingStudio initialOrders={orders} loadError={loadError}/>; }
