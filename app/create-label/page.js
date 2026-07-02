import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isShippingAuthenticated } from '@/lib/auth';
import { selectCustomers, selectOrders } from '@/lib/supabaseRest';
import Header from '@/components/Header';
import LabelStudio from '@/components/LabelStudio';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }) {
  const c = await cookies();

  if (!isShippingAuthenticated(c)) {
    redirect('/login');
  }

  const params = await searchParams;
  const orderId = params?.order || '';

  let customers = [];
  let initialOrder = null;

  try {
    customers = await selectCustomers();
  } catch (e) {}

  if (orderId) {
    try {
      const orders = await selectOrders();
      initialOrder = orders.find(o => String(o.id) === String(orderId)) || null;
    } catch (e) {}
  }

  return (
    <div className="page">
      <div className="shell">
        <Header />
        <LabelStudio
          initialCustomers={customers}
          initialOrder={initialOrder}
        />
      </div>
    </div>
  );
}
