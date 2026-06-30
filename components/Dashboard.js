'use client';
import Link from 'next/link';

function money(n) {
  const value = Number(n || 0);
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function Dashboard({ orders = [], customers = [] }) {
  const purchased = orders.filter(o => o.status === 'label_purchased');
  const batch = orders.filter(o => o.batch_selected && o.label_url);
  const drafts = orders.filter(o => o.status === 'draft');
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter(o => String(o.created_at || '').slice(0, 10) === today);
  const postage = purchased.reduce((sum, o) => sum + Number(o.postage_amount || 0), 0);
  const pending = orders.filter(o => ['draft', 'rates_ready'].includes(o.status || 'draft'));

  return (
    <>
      <section className="hero card">
        <div>
          <p className="eyebrow">Internal shipping workspace</p>
          <h2>Today&apos;s shipping overview</h2>
          <p className="muted">Create labels, manage customers, and batch print from one clean dashboard.</p>
        </div>
        <div className="actions">
          <Link className="btn primary" href="/create-label">Create Label</Link>
          <Link className="btn ghost" href="/batch-print">Batch Print</Link>
        </div>
      </section>

      <section className="grid">
        <div className="stat"><b>{todayOrders.length}</b><span>Today&apos;s Shipments</span></div>
        <div className="stat"><b>{customers.length}</b><span>Customers</span></div>
        <div className="stat"><b>{purchased.length}</b><span>Labels Purchased</span></div>
        <div className="stat"><b>{pending.length}</b><span>Pending Labels</span></div>
        <div className="stat"><b>{batch.length}</b><span>Batch Queue</span></div>
        <div className="stat"><b>{money(postage)}</b><span>Postage Spent</span></div>
      </section>

      <main className="layout">
        <section className="card">
          <h2>Quick Actions</h2>
          <div className="quickGrid">
            <Link className="mini-card" href="/create-label"><b>Create a label</b><span>Search or add customer</span></Link>
            <Link className="mini-card" href="/orders"><b>View orders</b><span>Tracking and label details</span></Link>
            <Link className="mini-card" href="/customers"><b>Customers</b><span>Edit addresses inline</span></Link>
            <Link className="mini-card" href="/batch-print"><b>Batch print</b><span>Combine selected PDFs</span></Link>
          </div>
        </section>

        <section className="card">
          <h2>Recent Shipments</h2>
          <div className="list">
            {!orders.length && <div className="empty">No shipments yet.</div>}
            {orders.slice(0, 6).map(o => (
              <Link className="mini-card row" href="/orders" key={o.id}>
                <span><b>{o.customer_name || 'Customer'}</b><small>{o.carrier || 'Draft'} {o.mail_class || ''}</small></span>
                <small>{o.status || 'draft'}</small>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
