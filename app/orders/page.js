import { cookies } from 'next/headers';import { redirect } from 'next/navigation';import Shell from '@/components/Shell';import Orders from '@/components/Orders';import { isShippingAuthenticated } from '@/lib/auth';import { selectOrders } from '@/lib/supabaseRest';
export const dynamic='force-dynamic';
export default async function Page(){const c=await cookies();if(!isShippingAuthenticated(c))redirect('/login');let orders=[],error='';try{orders=await selectOrders()}catch(e){error=e.message}return <Shell><Orders initialOrders={orders} loadError={error}/></Shell>}
