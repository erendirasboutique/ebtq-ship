'use client';
import { useMemo, useState } from 'react';
import OrderDetailsModal from './OrderDetailsModal';

export default function OrdersDashboard({ initialOrders = [] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();
    return orders.filter(o => !t || [o.customer_name, o.tracking_number, o.carrier, o.mail_class, o.status, o.zip].join(' ').toLowerCase().includes(t));
  }, [q, orders]);

  function handleUpdated(nextOrders) {
    if (Array.isArray(nextOrders)) {
      setOrders(nextOrders);
      const nextSelected = nextOrders.find(o => o.id === selected?.id);
      if (nextSelected) setSelected(nextSelected);
    }
  }

  return (
    <main className="card boutiqueCard">
      <div className="row">
        <div>
          <p className="eyebrow">Shipment archive</p>
          <h2>Orders</h2>
          <p className="muted">View labels, drafts, tracking, customer details, and refund requests.</p>
        </div>
      </div>
      <div className="toolbar"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search orders, customer, tracking..." /></div>
      <div className="list">
        {!filtered.length && <div className="empty">No orders found.</div>}
        {filtered.map(o => (
          <button key={o.id} className="order-card" onClick={() => setSelected(o)}>
            <div className="order-head"><div><h3>{o.customer_name || 'Customer'}</h3><p className="muted">{o.carrier || 'Carrier'} {o.mail_class || ''}</p></div><b>{o.status || 'draft'}</b></div>
            <div className="pills"><span className="pill">{o.tracking_number || 'No tracking yet'}</span><span className="pill">{o.parcel_length || 13}×{o.parcel_width || 10}×{o.parcel_height || 10}</span><span className="pill">{o.parcel_weight_lb || 0} lb {o.parcel_weight_oz || 0} oz</span></div>
          </button>
        ))}
      </div>
      {selected && <OrderDetailsModal order={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />}
    </main>
  );
}
