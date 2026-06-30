import { cookies } from 'next/headers';import { redirect } from 'next/navigation';import { isShippingAuthenticated } from '@/lib/auth';import TopNav from '@/components/TopNav';import CreateLabelStudio from '@/components/CreateLabelStudio';
export const dynamic='force-dynamic';
export default async function Page(){const c=await cookies();if(!isShippingAuthenticated(c))redirect('/shipping/login');return <main className="app-bg"><div className="flower f1">✿</div><div className="flower f2">✿</div><div className="container"><TopNav/><CreateLabelStudio/></div></main>}
