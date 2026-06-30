'use client';
import { useMemo, useState } from 'react';

function blankEdit(c = {}) {
  return {
    id: c.id || '',
    first_name: c.first_name || '',
    last_name: c.last_name || '',
    customer_name: c.customer_name || '',
    email: c.email || '',
    phone: c.phone || '',
    address_line1: c.address_line1 || '',
    address_line2: c.address_line2 || '',
    city: c.city || '',
    state: c.state || 'CA',
    zip: c.zip || '',
    country: c.country || 'US'
  };
}

export default function CustomersView({ initialCustomers = [], orders = [] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [edit, setEdit] = useState(null);
  const [msg, setMsg] = useState('');
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    return customers.filter(c => !term || [c.customer_name, c.email, c.phone, c.address_line1, c.city, c.state, c.zip]
      .join(' ')
      .toLowerCase()
      .includes(term)
    );
  }, [customers, q]);

  function customerOrders(c) {
    return orders.filter(o =>
      (c.id && o.customer_id === c.id) ||
      (c.email && o.customer_email === c.email) ||
      (c.customer_name && o.customer_name === c.customer_name)
    );
  }

  async function importCSV(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setMsg('Importing customers...');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/customers/import', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      setCustomers(data.customers || customers);
      setMsg(`Imported ${data.imported || 0} customers from CSV.`);
    } catch (error) {
      setMsg(error.message);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  async function saveCustomer(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('Saving customer...');
    try {
      const res = await fetch('/api/customers/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: edit.id, patch: edit })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save customer');
      setCustomers(data.customers || customers);
      const next = data.customers?.find(x => x.id === edit.id) || data.customer;
      setSelected(next || selected);
      setEdit(null);
      setMsg('Customer updated.');
    } catch (error) {
      setMsg(error.message);
    } finally {
      setSaving(false);
    }
  }

  function upd(k, v) { setEdit(prev => ({ ...prev, [k]: v })); }

  return (
    <>
      <div className="customer-tools">
        <div className="toolbar" style={{ flex: 1 }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search customers..." />
        </div>
        <label className="btn primary import-btn">
          {importing ? 'Importing...' : 'Import CSV'}
          <input type="file" accept=".csv,text/csv" hidden onChange={importCSV} disabled={importing} />
        </label>
      </div>

      {msg && <div className={msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('could not') ? 'notice error' : 'notice'}>{msg}</div>}

      <div className="customer-grid">
        {!filtered.length && <div className="empty card">No customers found. Import your Ship.comCustomers.csv file.</div>}
        {filtered.map(c => {
          const hist = customerOrders(c);
          return (
            <button className="customer-card customer-button" key={c.id || c.import_key} onClick={() => { setSelected(c); setEdit(null); }}>
              <h2>{c.customer_name || 'Customer'}</h2>
              <p className="muted">{c.email || c.phone || 'No contact'}</p>
              <div className="address">{c.customer_address || [c.address_line1, c.address_line2, [c.city, c.state, c.zip].filter(Boolean).join(', ')].filter(Boolean).join('\n') || 'No address saved'}</div>
              <div className="pills">
                <span className="pill">{hist.length} portal orders</span>
                <span className="pill">CSV orders: {c.imported_order_count || 0}</span>
                {c.imported_spend && <span className="pill">Spend: ${c.imported_spend}</span>}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => { setSelected(null); setEdit(null); }}>
          <div className="modal glass customer-modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => { setSelected(null); setEdit(null); }}>×</button>
            {!edit ? (
              <>
                <div className="modal-hero">
                  <div>
                    <h2>{selected.customer_name || 'Customer'}</h2>
                    <p className="muted">Customer profile, editable address, and order history</p>
                  </div>
                  <button className="btn green" onClick={() => setEdit(blankEdit(selected))}>Edit Address</button>
                </div>
                <div className="detail-cards">
                  <div><b>Email</b><span>{selected.email || '—'}</span></div>
                  <div><b>Phone</b><span>{selected.phone || '—'}</span></div>
                  <div className="wide"><b>Address</b><span className="address">{selected.customer_address || [selected.address_line1, selected.address_line2, [selected.city, selected.state, selected.zip].filter(Boolean).join(', ')].filter(Boolean).join('\n') || '—'}</span></div>
                  <div><b>CSV Order Count</b><span>{selected.imported_order_count || 0}</span></div>
                  <div><b>CSV Spend</b><span>{selected.imported_spend ? `$${selected.imported_spend}` : '—'}</span></div>
                </div>
                <h3 className="subheading">Portal Orders</h3>
                <div className="modal-order-list">
                  {customerOrders(selected).length === 0 && <div className="empty">No portal orders yet.</div>}
                  {customerOrders(selected).map(o => (
                    <div className="mini-order" key={o.id}>
                      <div><b>{o.carrier || 'Draft'}</b><span>{o.mail_class || o.status || 'draft'}</span></div>
                      <div><b>{o.tracking_number || 'No tracking yet'}</b><span>{o.shipment_date || o.created_at?.slice(0, 10)}</span></div>
                      {o.label_url && <a className="btn ghost" href={o.label_url} target="_blank">Print</a>}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <form onSubmit={saveCustomer}>
                <h2>Edit Customer</h2>
                <div className="form-grid">
                  <label className="label">First<input value={edit.first_name} onChange={e => upd('first_name', e.target.value)} /></label>
                  <label className="label">Last<input value={edit.last_name} onChange={e => upd('last_name', e.target.value)} /></label>
                  <label className="label wide">Display Name<input value={edit.customer_name} onChange={e => upd('customer_name', e.target.value)} /></label>
                  <label className="label">Email<input value={edit.email} onChange={e => upd('email', e.target.value)} /></label>
                  <label className="label">Phone<input value={edit.phone} onChange={e => upd('phone', e.target.value)} /></label>
                  <label className="label wide">Street<input value={edit.address_line1} onChange={e => upd('address_line1', e.target.value)} /></label>
                  <label className="label wide">Apt / Suite<input value={edit.address_line2} onChange={e => upd('address_line2', e.target.value)} /></label>
                  <label className="label">City<input value={edit.city} onChange={e => upd('city', e.target.value)} /></label>
                  <label className="label">State<input value={edit.state} onChange={e => upd('state', e.target.value)} /></label>
                  <label className="label">ZIP<input value={edit.zip} onChange={e => upd('zip', e.target.value)} /></label>
                </div>
                <div className="row" style={{ marginTop: 16 }}>
                  <button className="btn primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                  <button className="btn ghost" type="button" onClick={() => setEdit(null)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
