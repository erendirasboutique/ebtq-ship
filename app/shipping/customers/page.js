import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CustomersPage from '@/components/CustomersPage';
import { isShippingAuthenticated } from '@/lib/auth';
import { selectCustomers } from '@/lib/supabaseRest';
export const dynamic='force-dynamic';
export default async function Page(){
  const c=await cookies();
  if(!isShippingAuthenticated(c)) redirect('/shipping/login');
  let customers=[];
  try{ customers=await selectCustomers(); }catch{}
  return <CustomersPage initialCustomers={customers}/>;
}
