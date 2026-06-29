import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Dashboard from '@/components/Dashboard';
import { isShippingAuthenticated } from '@/lib/auth';
import { selectOrders } from '@/lib/supabaseRest';
export const dynamic='force-dynamic';
export default async function Page(){const c=await cookies();if(!isShippingAuthenticated(c))redirect('/shipping/login');let orders=[];let error='';try{orders=await selectOrders()}catch(e){error=e.message}return <AppShell title="Shipping Studio"><>{error&&<div className="notice error">{error}</div>}<Dashboard orders={orders}/></></AppShell>}
