import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isShippingAuthenticated } from '@/lib/auth';
import { selectOrders } from '@/lib/supabaseRest';
import Header from '@/components/Header';
import OrdersDashboard from '@/components/OrdersDashboard';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const c = await cookies();

  if (!isShippingAuthenticated(c)) {
    redirect('/login');
  }

  const orders = await selectOrders();

  return (
    <div className="page">
      <div className="shell">
        <Header />
        <OrdersDashboard initialOrders={orders} />
      </div>
    </div>
  );
}
