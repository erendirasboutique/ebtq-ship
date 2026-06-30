'use client';

import { useState } from 'react';
import OrderDetailsModal from './OrderDetailsModal';

export default function OrdersDashboard({ initialOrders = [] }) {
  const [orders] = useState(initialOrders);
  const [selected, setSelected] = useState(null);

  return (
    <main className="card glass">
      <h2>Orders</h2>
      <p className="muted">View purchased labels, draft orders, tracking, and customer details.</p>

      <div className="list">
        {orders.map(order => (
          <button key={order.id} className="order-card" onClick={() => setSelected(order)}>
            <div className="order-head">
              <div>
                <h3>{order.customer_name || 'Customer'}</h3>
                <p>{order.carrier || 'Carrier'} {order.mail_class || ''}</p>
              </div>
              <b>{order.status || 'draft'}</b>
            </div>

            <div className="pills">
              <span className="pill">{order.tracking_number || 'No tracking yet'}</span>
              <span className="pill">{order.parcel_length || 13}×{order.parcel_width || 10}×{order.parcel_height || 10}</span>
              <span className="pill">{order.parcel_weight_lb || 0} lb {order.parcel_weight_oz || 0} oz</span>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <OrderDetailsModal order={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}
