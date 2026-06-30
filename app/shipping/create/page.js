import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isShippingAuthenticated } from '@/lib/auth';
import { selectCustomers } from '@/lib/supabaseRest';
import TopNav from '@/components/TopNav';
import CreateLabelStudio from '@/components/CreateLabelStudio';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const c = await cookies();
  if (!isShippingAuthenticated(c)) redirect('/shipping/login');

  let customers = [];
  let error = '';
  try { customers = await selectCustomers(); } catch (e) { error = e.message; }

  return (
    <main className="app-bg">
      <div className="flower f1">✿</div><div className="flower f2">✿</div>
      <div className="container">
        <TopNav />
        {error && <div className="notice error">{error}</div>}
        <CreateLabelStudio initialCustomers={customers} />
      </div>
    </main>
  );
}
