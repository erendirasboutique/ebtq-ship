import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import SettingsClient from '@/components/SettingsClient';
import { isShippingAuthenticated } from '@/lib/auth';
export default async function Page(){const c=await cookies();if(!isShippingAuthenticated(c))redirect('/shipping/login');return <AppShell title="Settings"><SettingsClient/></AppShell>}
