'use client';
import { useMemo, useState } from 'react';

const blank = {
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
  parcel_weight: '8',
  parcel_length: '13',
  parcel_width: '10',
  parcel_height: '10',
  notes: ''
};

function customerToOrder(c = {}) {
  return {
    customer_id: c.id || '',
    customer_name: c.customer_name || [c.first_name, c.last_name].filter(Boolean).join(' '),
    customer_email: c.email || '',
    customer_phone: c.phone || '',
    address_line1: c.address_line1 || '',
    address_line2: c.address_line2 || '',
    city: c.city || '',
    state: c.state || 'CA',
    zip: c.zip || '',
    country: c.country || 'US'
  };
}

export default function CreateLabelStudio({ initialCustomers = [] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [customerQuery, setCustomerQuery] = useState('');
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [order, setOrder] = useState(blank);
  const [saved, setSaved] = useState(null);
  const [rates, setRates] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const customerMatches = useMemo(() => {
    const term = customerQuery.toLowerCase().trim();
    if (!term) return customers.slice(0, 8);
    return customers.filter(c => [c.customer_name, c.email, c.phone, c.address_line1, c.city, c.zip]
      .join(' ')
      .toLowerCase()
      .includes(term)
    ).slice(0, 12);
  }, [customers, customerQuery]);

  function upd(k, v) {
    setOrder(o => ({ ...o, [k]: v }));
    setSaved(null);
  }

  function selectCustomer(c) {
    setOrder(o => ({ ...o, ...customerToOrder(c) }));
    setCustomerQuery(c.customer_name || '');
    setShowCustomerPicker(false);
    setMsg(`Selected ${c.customer_name}. Package defaults are 13 × 10 × 10.`);
  }

  async function saveNewCustomerFromForm() {
    setBusy(true);
    setMsg('Saving customer...');
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone,
          address_line1: order.address_line1,
          address_line2: order.address_line2,
          city: order.city,
          state: order.state,
          zip: order.zip,
          country: order.country || 'US',
          customer_address: [order.address_line1, order.address_line2, [order.city, order.state, order.zip].filter(Boolean).join(', ')].filter(Boolean).join('\n'),
          source: 'manual'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save customer');
      setCustomers(data.customers || customers);
      if (data.customer) setOrder(o => ({ ...o, customer_id: data.customer.id }));
      setMsg('Customer saved.');
    } catch (e) { setMsg(e.message); }
    finally { setBusy(false); }
  }

  async function save() {
    setBusy(true);
    setMsg('Saving order...');
    try {
      const res = await fetch('/api/shipping/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save order');
      setSaved(data.order);
      setOrder(data.order);
      setMsg('Order saved. Now get rates.');
    } catch (e) { setMsg(e.message); }
    finally { setBusy(false); }
  }

  async function getRates() {
    setBusy(true);
    setMsg('Getting EasyPost rates...');
    try {
      const current = saved || order;
      if (!current.id) throw new Error('Save the order before getting rates.');
      const res = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(current)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not get rates');
      setRates(data.rates || []);
      const withShipment = { ...current, easypost_shipment_id: data.shipment_id };
      setOrder(withShipment);
      setSaved(withShipment);
      setMsg(`${(data.rates || []).length} rates found.`);
    } catch (e) { setMsg(e.message); }
    finally { setBusy(false); }
  }

  async function buy(rate) {
    setBusy(true);
    setMsg(`Buying ${rate.carrier} ${rate.service} label...`);
    try {
      const current = { ...(saved || order), easypost_shipment_id: (saved || order).easypost_shipment_id || order.easypost_shipment_id };
      const res = await fetch('/api/shipping/buy-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: current, rate })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not buy label');
      setMsg('Label purchased. Go to Orders to print it or batch print.');
      setRates([]);
      setSaved(null);
      setOrder(blank);
      setCustomerQuery('');
    } catch (e) { setMsg(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="layout">
      <section className="card create-card">
        <h2>Create Label</h2>
        <p className="muted">Search your imported customers first. If they are not there, type a new customer manually.</p>

        <div className="section-title">Find Customer</div>
        <div className="customer-searchbox">
          <input
            value={customerQuery}
            onFocus={() => setShowCustomerPicker(true)}
            onChange={e => { setCustomerQuery(e.target.value); setShowCustomerPicker(true); }}
            placeholder="Search name, email, phone, address, ZIP..."
          />
          {showCustomerPicker && (
            <div className="customer-suggestions glass">
              {customerMatches.length === 0 && <div className="suggestion muted">No customer found. Enter details below and click Save Customer.</div>}
              {customerMatches.map(c => (
                <button key={c.id || c.import_key} type="button" className="suggestion" onClick={() => selectCustomer(c)}>
                  <b>{c.customer_name}</b>
                  <span>{c.email || c.phone || 'No contact'}</span>
                  <small>{[c.address_line1, c.city, c.state, c.zip].filter(Boolean).join(', ')}</small>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="section-title">Customer</div>
        <div className="form-grid">
          <label className="label">Name<input value={order.customer_name || ''} onChange={e => upd('customer_name', e.target.value)} /></label>
          <label className="label">Email<input value={order.customer_email || ''} onChange={e => upd('customer_email', e.target.value)} /></label>
          <label className="label">Phone<input value={order.customer_phone || ''} onChange={e => upd('customer_phone', e.target.value)} /></label>
          <label className="label wide">Street<input value={order.address_line1 || ''} onChange={e => upd('address_line1', e.target.value)} /></label>
          <label className="label wide">Apt / Suite<input value={order.address_line2 || ''} onChange={e => upd('address_line2', e.target.value)} /></label>
          <label className="label">City<input value={order.city || ''} onChange={e => upd('city', e.target.value)} /></label>
          <label className="label">State<input value={order.state || ''} onChange={e => upd('state', e.target.value)} /></label>
          <label className="label">ZIP<input value={order.zip || ''} onChange={e => upd('zip', e.target.value)} /></label>
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn ghost" type="button" onClick={saveNewCustomerFromForm} disabled={busy || !order.customer_name}>Save Customer</button>
        </div>

        <div className="section-title">Package</div>
        <div className="form-grid">
          <label className="label">Weight (oz)<input value={order.parcel_weight || ''} onChange={e => upd('parcel_weight', e.target.value)} /></label>
          <label className="label">Length<input value={order.parcel_length || ''} onChange={e => upd('parcel_length', e.target.value)} /></label>
          <label className="label">Width<input value={order.parcel_width || ''} onChange={e => upd('parcel_width', e.target.value)} /></label>
          <label className="label">Height<input value={order.parcel_height || ''} onChange={e => upd('parcel_height', e.target.value)} /></label>
          <label className="label wide">Notes<textarea rows="3" value={order.notes || ''} onChange={e => upd('notes', e.target.value)} /></label>
        </div>

        <div className="row" style={{ marginTop: 16 }}>
          <button className="btn green" onClick={save} disabled={busy}>Save Order</button>
          <button className="btn primary" onClick={getRates} disabled={busy || !(saved || order.id)}>Get Rates</button>
        </div>
      </section>

      <section className="card">
        <h2>Rates</h2>
        <p className="muted">Choose the label you want to buy.</p>
        {msg && <div className={msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('missing') || msg.toLowerCase().includes('could not') ? 'notice error' : 'notice'}>{msg}</div>}
        <div className="list">
          {!rates.length && <div className="empty">Rates will show here after you save and click Get Rates.</div>}
          {rates.map(r => (
            <div className="rate-card" key={r.id}>
              <div className="order-head">
                <div><h3>{r.carrier}</h3><p>{r.service}</p></div>
                <h3>${r.rate}</h3>
              </div>
              <div className="pills"><span className="pill">{r.delivery_days ? `${r.delivery_days} days` : 'Delivery varies'}</span><span className="pill">{r.est_delivery_date || 'No ETA'}</span></div>
              <button className="btn primary" onClick={() => buy(r)} disabled={busy}>Buy This Label</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
