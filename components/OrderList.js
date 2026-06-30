'use client';
import { useMemo, useState } from 'react';
import OrderModal from './OrderModal';

export default function OrderList({ initialOrders = [] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');
  const [batch, setBatch] = useState([]);
  const [printing, setPrinting] = useState(false);

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return orders.filter(o => !t || [o.customer_name, o.customer_address, o.tracking_number, o.carrier, o.mail_class, o.status].join(' ').toLowerCase().includes(t));
  }, [q, orders]);

  const printable = filtered.filter(o => o.label_url);
  const selectedPrintable = orders.filter(o => batch.includes(o.id) && o.label_url);

  function toggleAllLabels() {
    if (selectedPrintable.length === printable.length) setBatch([]);
    else setBatch(printable.map(o => o.id));
  }

  async function refund(order) {
    if (!confirm('Request refund/void for this label?')) return;
    setMsg('Requesting refund...');
    const res = await fetch('/api/shipping/refund-label', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order })
    });
    const data = await res.json();
    if (!res.ok) setMsg(data.error);
    else {
      setOrders(data.orders);
      setSelected(data.orders.find(x => x.id === order.id));
      setMsg('Refund request submitted.');
    }
  }

  async function printBatch() {
    const urls = selectedPrintable.map(o => o.label_url);
    if (!urls.length) { setMsg('Select at least one purchased label first.'); return; }
    setPrinting(true);
    setMsg('Combining selected label PDFs...');
    try {
      const res = await fetch('/api/shipping/batch-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Could not combine labels');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setMsg(`Batch PDF created with ${urls.length} labels.`);
    } catch (e) { setMsg(e.message); }
    finally { setPrinting(false); }
  }

  return (
    <>
      <div className="batch-panel glass">
        <div>
          <h3>Batch Print Labels</h3>
          <p className="muted">Select purchased labels below, then print one combined PDF.</p>
        </div>
        <div className="row">
          <button className="btn ghost" onClick={toggleAllLabels} disabled={!printable.length}>{selectedPrintable.length === printable.length && printable.length ? 'Clear Selection' : 'Select All Labels'}</button>
          <button className="btn primary" onClick={printBatch} disabled={printing || !selectedPrintable.length}>{printing ? 'Building PDF...' : `Print Batch (${selectedPrintable.length})`}</button>
        </div>
      </div>

      <div className="toolbar"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search orders, customers, tracking..." /></div>
      {msg && <div className={msg.toLowerCase().includes('could not') || msg.toLowerCase().includes('error') ? 'notice error' : 'notice'}>{msg}</div>}
      <div className="list">
        {!filtered.length && <div className="empty card">No orders found.</div>}
        {filtered.map(o => (
          <article className="order-card" key={o.id} onClick={() => setSelected(o)}>
            <div className="order-head">
              <div>
                <h3>{o.customer_name || 'Customer'}</h3>
                <p className="muted">{o.customer_email || o.customer_phone || 'No contact saved'}</p>
              </div>
              <label className="checkbox-row" onClick={e => e.stopPropagation()}>
                <input type="checkbox" disabled={!o.label_url} checked={batch.includes(o.id)} onChange={e => setBatch(v => e.target.checked ? [...new Set([...v, o.id])] : v.filter(id => id !== o.id))} />
                <span>{o.label_url ? 'Batch' : 'No label'}</span>
              </label>
            </div>
            <div className="pills"><span className="pill">{o.status || 'draft'}</span><span className="pill">{o.carrier || 'No carrier'}</span><span className="pill">{o.mail_class || 'No service'}</span><span className="pill">{o.source || 'easypost'}</span></div>
            <div className="address">{o.customer_address}</div>
            <p><b>Tracking:</b> {o.tracking_number || '—'}</p>
            <div className="row">{o.label_url && <a className="btn ghost" href={o.label_url} target="_blank" onClick={e => e.stopPropagation()}>Print Label</a>}</div>
          </article>
        ))}
      </div>
      <OrderModal order={selected} onClose={() => setSelected(null)} onRefund={refund} />
    </>
  );
}
