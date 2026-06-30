'use client';
import Link from 'next/link';

function money(n) {
  const value = Number(n || 0);
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function Dashboard({ orders = [], customers = [] }) {
  const purchased = orders.filter(o => o.status === 'label_purchased');
  const batch = orders.filter(o => o.batch_selected && o.label_url);
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter(o => String(o.created_at || '').slice(0, 10) === today);
  const postage = purchased.reduce((sum, o) => sum + Number(o.postage_amount || 0), 0);
  const pending = orders.filter(o => ['draft', 'rates_ready'].includes(o.status || 'draft'));

  return (
    <>
      <section className="hero boutiqueHero">
        <div>
          <p className="eyebrow">Shipping Portal</p>
          <h2>Shipping Dashboard</h2>
        </div>
        <div className="heroPanel">
          <span>Today</span>
    
          <b>{todayOrders.length}</b>
          <small>Shipments Created</small>
        </div>
      </section>

      <section className="grid statGrid">
        <div className="stat"><span>Today&apos;s Shipments</span><b>{todayOrders.length}</b><small>Created today</small></div>
        <div className="stat"><span>Customers</span><b>{customers.length}</b><small>Saved profiles</small></div>
        <div className="stat"><span>Labels Purchased</span><b>{purchased.length}</b><small>All-time purchased</small></div>
        <div className="stat"><span>Pending Labels</span><b>{pending.length}</b><small>Drafts/rates ready</small></div>
        <div className="stat"><span>Batch Queue</span><b>{batch.length}</b><small>Ready to print</small></div>
        <div className="stat"><span>Postage Spent</span><b>{money(postage)}</b><small>Purchased postage</small></div>
      </section>

      <main className="dashboardSplit">
        <section className="card boutiqueCard actionPanel">
          <p className="eyebrow">Start here</p>
          <h2>Quick Actions</h2>
          <div className="quickGrid actionTiles">
            <Link className="mini-card actionTile primaryTile" href="/create-label"><b>Create a label</b><span>Search customer, choose rate, buy 4×6 PDF</span></Link>
            <Link className="mini-card actionTile" href="/batch-print"><b>Batch Print</b><span>Combine selected labels into one PDF</span></Link>
            <Link className="mini-card actionTile" href="/customers"><b>Customers</b><span>Edit addresses, View contact info</span></Link>
            <Link className="mini-card actionTile" href="/orders"><b>Orders</b><span>Review full shipment details and tracking</span></Link>
          </div>
        </section>

        <section className="card boutiqueCard recentPanel">
          <div className="row">
            <div>
              <p className="eyebrow">Latest activity</p>
              <h2>Recent Shipments</h2>
    
            </div>
            <Link className="btn ghost" href="/orders">View all</Link>
          </div>
          <div className="list shipmentTimeline">
            {!orders.length && <div className="empty">No shipments yet.</div>}
            {orders.slice(0, 7).map(o => (
              <Link className="mini-card shipmentLine" href="/orders" key={o.id}>
                <span className="dot" />
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
