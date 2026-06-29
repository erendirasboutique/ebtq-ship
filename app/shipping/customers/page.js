import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import CustomersClient from '@/components/CustomersClient';
import { isShippingAuthenticated } from '@/lib/auth';
import { selectCustomers } from '@/lib/supabaseRest';
export const dynamic='force-dynamic';
export default async function Page(){const c=await cookies();if(!isShippingAuthenticated(c))redirect('/shipping/login');let customers=[];let error='';try{customers=await selectCustomers()}catch(e){error=e.message}return <AppShell title="Customers"><>{error&&<div className="notice error">{error}</div>}<CustomersClient initialCustomers={customers}/></></AppShell>}
