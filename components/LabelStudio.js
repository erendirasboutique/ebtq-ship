'use client';

import { useMemo, useState } from 'react';

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
  parcel_weight_lb: 1,
  parcel_weight_oz: 0,
  signature_required: false,
  notes: ''
};

function rateId(rate = {}) {
  return rate.object_id || rate.id || rate.rate_id || '';
}

function rateCarrier(rate = {}) {
  return rate.carrier || rate.provider || rate.raw?.provider || 'Carrier';
}

function rateService(rate = {}) {
  return rate.service || rate.servicelevel?.name || rate.raw?.servicelevel?.name || rate.raw?.servicelevel?.token || 'Service';
}

function rateAmount(rate = {}) {
  return rate.rate || rate.amount || rate.raw?.amount || '';
}

function rateCurrency(rate = {}) {
  return rate.currency || rate.raw?.currency || 'USD';
}

export default function LabelStudio({initialCustomers=[], initialOrder=null}){
  const [customers] = useState(initialCustomers);
  const [q, setQ] = useState('');
  const[order,setOrder]=useState(initialOrder || empty);
const[saved,setSaved]=useState(initialOrder || null);
  const [rates, setRates] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const matches = useMemo(() => {
    const t = q.toLowerCase().trim();
    return customers
      .filter(c => !t || [c.customer_name, c.email, c.phone, c.customer_address, c.zip].join(' ').toLowerCase().includes(t))
      .slice(0, 8);
  }, [q, customers]);

  function useCustomer(c) {
    setOrder(o => ({
      ...o,
      customer_id: c.id,
      customer_name: c.customer_name,
      customer_email: c.email || c.customer_email,
      customer_phone: c.phone || c.customer_phone,
      address_line1: c.address_line1,
      address_line2: c.address_line2,
      city: c.city,
      state: c.state,
      zip: c.zip,
      country: c.country || 'US'
    }));
    setQ(c.customer_name || '');
  }

  function set(key, value) {
    setOrder(o => ({ ...o, [key]: value }));
  }

  async function save() {
    setBusy(true);
    setMsg('Saving order...');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save order');

      setSaved(data.order);
      setOrder(data.order);
      setMsg('Order saved.');
      return data.order;
    } catch (e) {
      setMsg(e.message);
      throw e;
    } finally {
      setBusy(false);
    }
  }

  async function getRates() {
    setBusy(true);
    setMsg('Saving order and getting Shippo rates...');

    try {
      let current = saved || order;

      if (!current.id) {
        const saveRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(current)
        });

        const saveData = await saveRes.json();
        if (!saveRes.ok) throw new Error(saveData.error || 'Could not save order');

        current = saveData.order;
        setSaved(current);
        setOrder(current);
      }

      const res = await fetch('/api/orders/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: current })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not get rates');

      setSaved(data.order);
      setOrder(data.order);
      setRates(data.rates || []);
      setMsg(`${(data.rates || []).length} rates found.`);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function buy(rate) {
    setBusy(true);
    setMsg('Purchasing 4×6 label...');

    try {
      const res = await fetch('/api/orders/buy-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: saved || order,
          rateId: rateId(rate),
          rate
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not purchase label');

      setSaved(data.order);
      setOrder(data.order);
      setMsg('Label purchased and added to batch queue. Returning home...');
      setTimeout(() => { location.href = '/'; }, 900);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="layout">
      <section className="card">
        <h2>Create Label</h2>
        <p className="muted">Search a saved customer or create a new one manually.</p>

        {msg && (
          <div className={msg.toLowerCase().includes('error') || msg.toLowerCase().includes('could') ? 'notice error' : 'notice'}>
            {msg}
          </div>
        )}

        <div className="form">
          <div className="section">
            <h3>Customer</h3>
            <div className="section-grid">
              <label className="wide">
                Search Customers
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Name, phone, email, zip..." />
              </label>
            </div>

            <div className="list" style={{ margin: '12px 0' }}>
              {q && matches.map(c => (
                <button key={c.id} type="button" className="customer" onClick={() => useCustomer(c)}>
                  <b>{c.customer_name}</b><br />
                  <span className="small">{c.customer_address}</span>
                </button>
              ))}
            </div>

            <div className="section-grid">
              <label>Customer Name<input value={order.customer_name || ''} onChange={e => set('customer_name', e.target.value)} /></label>
              <label>Phone<input value={order.customer_phone || ''} onChange={e => set('customer_phone', e.target.value)} /></label>
              <label className="wide">Email<input value={order.customer_email || ''} onChange={e => set('customer_email', e.target.value)} /></label>
            </div>
          </div>

          <div className="section">
            <h3>Shipping Address</h3>
            <div className="section-grid">
              <label className="wide">Address 1<input value={order.address_line1 || ''} onChange={e => set('address_line1', e.target.value)} /></label>
              <label className="wide">Address 2<input value={order.address_line2 || ''} onChange={e => set('address_line2', e.target.value)} /></label>
              <label>City<input value={order.city || ''} onChange={e => set('city', e.target.value)} /></label>
              <label>State<input value={order.state || ''} onChange={e => set('state', e.target.value)} /></label>
              <label>ZIP<input value={order.zip || ''} onChange={e => set('zip', e.target.value)} /></label>
              <label>Country<input value={order.country || 'US'} onChange={e => set('country', e.target.value)} /></label>
            </div>
          </div>

          <div className="section">
            <h3>Package Weight</h3>
            <div className="section-grid">
              <label>Lbs<input type="number" value={order.parcel_weight_lb || 0} onChange={e => set('parcel_weight_lb', e.target.value)} /></label>
              <label>Oz<input type="number" value={order.parcel_weight_oz || 0} onChange={e => set('parcel_weight_oz', e.target.value)} /></label>
            </div>
          </div>

          <div className="section">
            <h3>Package Dimensions</h3>
            <div className="section-grid">
              <label>Length<input type="number" value={order.parcel_length || 13} onChange={e => set('parcel_length', e.target.value)} /></label>
              <label>Width<input type="number" value={order.parcel_width || 10} onChange={e => set('parcel_width', e.target.value)} /></label>
              <label>Height<input type="number" value={order.parcel_height || 10} onChange={e => set('parcel_height', e.target.value)} /></label>
            </div>
          </div>

          <div className="section">
            <h3>Shipping Options</h3>
            <div className="section-grid">
              <label className="wide checkbox-row">
                <input type="checkbox" checked={!!order.signature_required} onChange={e => set('signature_required', e.target.checked)} /> Signature confirmation
              </label>
              <label className="wide">Notes<textarea value={order.notes || ''} onChange={e => set('notes', e.target.value)} rows="3" /></label>
            </div>
          </div>
        </div>

        <div className="actions" style={{ marginTop: 14 }}>
          <button type="button" className="btn ghost" onClick={save} disabled={busy}>Save Order</button>
          <button type="button" className="btn primary" onClick={getRates} disabled={busy}>Get Rates</button>
        </div>
      </section>

      <section className="card">
        <h2>Rates</h2>
        <p className="muted">Labels purchase as 4×6 PDF and are added to batch print.</p>

        <div className="list">
          {!rates.length && <div className="empty">Rates will appear here.</div>}

          {rates.map(r => (
            <div className="rate" key={rateId(r)}>
              <div className="order-head">
                <div>
                  <h3>{rateCarrier(r)} {rateService(r)}</h3>
                  <p className="muted">{r.estimated_days ? `${r.estimated_days} day(s)` : r.duration_terms || ''}</p>
                </div>
                <b>{rateAmount(r) ? `$${rateAmount(r)} ${rateCurrency(r)}` : '—'}</b>
              </div>

              <button type="button" className="btn green" onClick={() => buy(r)} disabled={busy}>
                Purchase Label
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
