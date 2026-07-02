import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isShippingAuthenticated } from '@/lib/auth';
import { deleteOrder, selectOrders } from '@/lib/supabaseRest';

export async function DELETE(req) {
  const c = await cookies();

  if (!isShippingAuthenticated(c)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id } = await req.json();

    if (!id) {
      throw new Error('Missing order ID.');
    }

    await deleteOrder(id);

    const orders = await selectOrders();

    return NextResponse.json({
      ok: true,
      orders
    });

  } catch (e) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}
