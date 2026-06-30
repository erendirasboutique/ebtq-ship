import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isShippingAuthenticated } from '@/lib/auth';
import { selectCustomers, selectOrders } from '@/lib/supabaseRest';
import TopNav from '@/components/TopNav';
import CustomersView from '@/components/CustomersView';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const c = await cookies();
  if (!isShippingAuthenticated(c)) redirect('/shipping/login');

  let customers = [];
  let orders = [];
  let error = '';
  try {
    customers = await selectCustomers();
    orders = await selectOrders();
  } catch (e) { error = e.message; }

  return (
    <main className="app-bg">
      <div className="flower f1">✿</div><div className="flower f2">✿</div>
      <div className="container">
        <TopNav />
        <section className="card">
          <h2>Customers</h2>
          <p className="muted">Import your Ship.com customer CSV, search customers, edit addresses, and view order history.</p>
          {error && <div className="notice error">{error}</div>}
          <CustomersView initialCustomers={customers} orders={orders} />
        </section>
      </div>
    </main>
  );
}
