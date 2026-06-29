import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import CreateLabel from '@/components/CreateLabel';
import { isShippingAuthenticated } from '@/lib/auth';
export default async function Page(){const c=await cookies();if(!isShippingAuthenticated(c))redirect('/shipping/login');return <AppShell title="Create Label" subtitle="Create customer orders and buy Ship.com labels inside the portal"><CreateLabel/></AppShell>}
