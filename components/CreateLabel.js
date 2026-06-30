'use client';

import { useState } from 'react';

const empty = {
  customer_id: '',
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: 'CA',
  zip: '',
  country: 'US',
  parcel_length: 13,
  parcel_width: 10,
  parcel_height: 10,
  parcel_weight_lbs: 1,
  parcel_weight_oz: 0,
  parcel_weight: 16,
  signature_option: 'NONE',
  notes: ''
};

export default function CreateLabel({ customers = [], initialOrders = [], loadError = '' }) {
  const [q, setQ] = useState('');
  const [order, setOrder] = useState(empty);
  const [orders, setOrders] = useState(initialOrders);
  const [active, setActive] = useState(null);
  const [rates, setRates] = useState([]);
  const [msg, setMsg] = useState(loadError);
  const [savingCustomer, setSavingCustomer] = useState(false);

  const matches = customers
    .filter(c =>
      (c.customer_name || '').toLowerCase().includes(q.toLowerCase()) ||
      String(c.email || c.phone || '').includes(q)
    )
    .slice(0, 8);

  function patch(p) {
    const next = { ...order, ...p };
    const lbs = Number(next.parcel_weight_lbs || 0);
    const oz = Number(next.parcel_weight_oz || 0);
    next.parcel_weight = (lbs * 16) + oz;
    setOrder(next);
  }

  function fill(c) {
    setOrder(prev => ({
      ...prev,
      customer_id: c.id,
      customer_name: c.customer_name,
      customer_email: c.customer_email || c.email,
      customer_phone: c.customer_phone || c.phone,
      address_line1: c.address_line1,
      address_line2: c.address_line2,
      city: c.city,
      state: c.state,
      zip: c.zip,
      country: c.country || 'US'
    }));
    setQ(c.customer_name || '');
  }

  async function saveCustomer() {
    setSavingCustomer(true);
    setMsg('Saving customer...');
    try {
      const res = await fetch('/api/customers/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save customer');
      if (data.customer) fill(data.customer);
      setMsg('Customer saved. You can now save the order.');
    } catch (e) {
      setMsg(e.message);
    } finally {
      setSavingCustomer(false);
    }
  }

  async function save() {
    setMsg('Saving order...');
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error);
      return;
    }
    setOrders(data.orders);
    setActive(data.order);
    setMsg('Order saved. Now get rates.');
  }

  async function getRates(id = active?.id) {
    setMsg('Getting EasyPost rates...');
    const res = await fetch('/api/orders/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error);
      return;
    }
    setOrders(data.orders);
    setRates(data.rates || []);
    setMsg(`${(data.rates || []).length} rates found.`);
  }

  async function buy(rate) {
    setMsg('Purchasing 4×6 label...');
    const res = await fetch('/api/orders/buy-label', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: active.id, rateId: rate.id })
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error);
      return;
    }
    window.location.href = '/?purchased=1';
  }

  return (
    <>
      <h1 className="page-title">Create Label</h1>
      {msg && <div className={msg.includes('failed') || msg.includes('{') || msg.toLowerCase().includes('error') ? 'notice error' : 'notice'}>{msg}</div>}

      <section className="layout">
        <div className="card glass">
          <h2>Customer</h2>
          <label className="label">
            Search customers
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, email, phone..." />
          </label>

          {q && matches.length > 0 && (
            <div className="list" style={{ marginTop: 10 }}>
              {matches.map(c => (
                <button className="item" key={c.id} onClick={() => fill(c)}>
                  <b>{c.customer_name}</b>
                  <div className="small">{c.customer_address}</div>
                </button>
              ))}
            </div>
          )}

          <p className="small">Choose a customer above or type a new one below. Use “Save New Customer” to keep them for next time.</p>

          <div className="form-grid" style={{ marginTop: 12 }}>
            {['customer_name', 'customer_email', 'customer_phone', 'address_line1', 'address_line2', 'city', 'state', 'zip'].map(f => (
              <label className="label" key={f}>
                {f.replaceAll('_', ' ')}
                <input value={order[f] || ''} onChange={e => patch({ [f]: e.target.value })} />
              </label>
            ))}

            <label className="label">
              Weight lbs
              <input type="number" min="0" step="1" value={order.parcel_weight_lbs} onChange={e => patch({ parcel_weight_lbs: e.target.value })} />
            </label>

            <label className="label">
              Weight oz
              <input type="number" min="0" step="0.1" value={order.parcel_weight_oz} onChange={e => patch({ parcel_weight_oz: e.target.value })} />
            </label>

            <label className="label">
              Length
              <input type="number" value={order.parcel_length} onChange={e => patch({ parcel_length: e.target.value })} />
            </label>

            <label className="label">
              Width
              <input type="number" value={order.parcel_width} onChange={e => patch({ parcel_width: e.target.value })} />
            </label>

            <label className="label">
              Height
              <input type="number" value={order.parcel_height} onChange={e => patch({ parcel_height: e.target.value })} />
            </label>

            <label className="label">
              Signature delivery
              <select value={order.signature_option} onChange={e => patch({ signature_option: e.target.value })}>
                <option value="NONE">No signature</option>
                <option value="SIGNATURE">Signature required</option>
                <option value="ADULT_SIGNATURE">Adult signature</option>
              </select>
            </label>

            <label className="label wide">
              Notes
              <textarea value={order.notes || ''} onChange={e => patch({ notes: e.target.value })} />
            </label>
          </div>

          <br />
          <div className="row">
            <button className="btn ghost" onClick={saveCustomer} disabled={savingCustomer}>{savingCustomer ? 'Saving...' : 'Save New Customer'}</button>
            <button className="btn primary" onClick={save}>Save Order</button>
          </div>
        </div>

        <div className="card glass sticky-actions">
          <h2>Rates + Label</h2>
          {active ? (
            <>
              <p><b>{active.customer_name}</b></p>
              <button className="btn green" onClick={() => getRates(active.id)}>Get Rates</button>
            </>
          ) : <p className="muted">Save an order first.</p>}

          <div className="list" style={{ marginTop: 14 }}>
            {rates.map(r => (
              <div className="rate-card" key={r.id}>
                <h3>{r.carrier} {r.service}</h3>
                <div className="pills">
                  <span className="pill">${r.rate} {r.currency}</span>
                  <span className="pill">{r.delivery_days ? `${r.delivery_days} days` : 'No estimate'}</span>
                  <span className="pill">4×6 PDF</span>
                </div>
                <button className="btn primary" onClick={() => buy(r)}>Purchase Label</button>
              </div>
            ))}
          </div>
          <p className="small">After purchase, you will return to the dashboard so you can create another label and batch print later.</p>
        </div>
      </section>
    </>
  );
}
