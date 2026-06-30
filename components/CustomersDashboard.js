'use client';

import { useMemo, useState } from 'react';

function parseCSV(text) {
  const rows = [];
  let row = [], cur = '', q = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i], n = text[i + 1];

    if (ch === '"' && q && n === '"') {
      cur += '"';
      i++;
    } else if (ch === '"') {
      q = !q;
    } else if (ch === ',' && !q) {
      row.push(cur);
      cur = '';
    } else if ((ch === '\n' || ch === '\r') && !q) {
      if (ch === '\r' && n === '\n') i++;
      row.push(cur);
      if (row.some(v => v.trim())) rows.push(row);
      row = [];
      cur = '';
    } else {
      cur += ch;
    }
  }

  row.push(cur);
  if (row.some(v => v.trim())) rows.push(row);

  const headers = (rows.shift() || []).map(h => h.trim());
  return rows.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] || ''])));
}

function blankCustomer() {
  return {
    customer_name: '',
    email: '',
    phone: '',
    customer_email: '',
    customer_phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: 'CA',
    zip: '',
    country: 'US'
  };
}

function formatAddress(c = {}) {
  return [
    c.address_line1,
    c.address_line2,
    [c.city, c.state, c.zip].filter(Boolean).join(', ')
  ].filter(Boolean).join('\n');
}

export default function CustomersDashboard({ initialCustomers = [] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [q, setQ] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();

    return customers.filter(c =>
      !t ||
      [
        c.customer_name,
        c.email,
        c.phone,
        c.customer_email,
        c.customer_phone,
        c.customer_address,
        c.address_line1,
        c.city,
        c.state,
        c.zip
      ].join(' ').toLowerCase().includes(t)
    );
  }, [q, customers]);

  function openCustomer(c) {
    setEditingId(c.id || c.import_key || 'new');
    setForm({
      ...blankCustomer(),
      ...c,
      email: c.email || c.customer_email || '',
      phone: c.phone || c.customer_phone || '',
      customer_email: c.customer_email || c.email || '',
      customer_phone: c.customer_phone || c.phone || ''
    });
  }

  function addCustomer() {
    setEditingId('new');
    setForm(blankCustomer());
  }

  function closeModal() {
    setEditingId(null);
    setForm(null);
  }

  function updateField(key, value) {
    setForm(prev => {
      const next = { ...prev, [key]: value };

      if (key === 'email') next.customer_email = value;
      if (key === 'customer_email') next.email = value;
      if (key === 'phone') next.customer_phone = value;
      if (key === 'customer_phone') next.phone = value;

      next.customer_address = formatAddress(next);

      return next;
    });
  }

  async function importFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setMsg('Importing customers...');

    try {
      const rows = parseCSV(await file.text());

      const res = await fetch('/api/customers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Import failed');

      setCustomers(data.customers || []);
      setMsg(`Imported ${data.imported || 0}. Skipped duplicates: ${data.skipped_duplicates || 0}.`);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  async function saveCustomer(e) {
    e.preventDefault();
    if (!form) return;

    setBusy(true);
    setMsg('Saving customer...');

    try {
      const payload = {
        ...form,
        customer_address: formatAddress(form),
        email: form.email || form.customer_email || '',
        phone: form.phone || form.customer_phone || '',
        customer_email: form.customer_email || form.email || '',
        customer_phone: form.customer_phone || form.phone || ''
      };

      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Save failed');

      setCustomers(data.customers || customers);
      closeModal();
      setMsg('Customer saved.');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="card">
      <h2>Customers</h2>
      <p className="muted">Import your CSV, manually add customers, and edit addresses anytime.</p>

      {msg && <div className="notice">{msg}</div>}

      <div className="toolbar">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search customers..."
        />

        <label className="btn ghost" style={{ display: 'inline-flex' }}>
          Import CSV
          <input
            type="file"
            accept=".csv"
            onChange={importFile}
            style={{ display: 'none' }}
            disabled={busy}
          />
        </label>

        <button className="btn primary" type="button" onClick={addCustomer}>
          Add Customer
        </button>
      </div>

      <div className="customer-grid">
        {filtered.map(c => (
          <button
            key={c.id || c.import_key || `${c.customer_name}-${c.zip}`}
            className="customer"
            type="button"
            onClick={() => openCustomer(c)}
          >
            <b>{c.customer_name}</b>
            <br />
            <span className="small">{c.email || c.phone || 'No contact'}</span>
            <div className="address">{c.customer_address || formatAddress(c)}</div>
          </button>
        ))}
      </div>

   {form && (
  <div className="modal-backdrop customer-modal-lock">
    <form
      className="modal"
      onSubmit={saveCustomer}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
            <button type="button" className="close" onClick={closeModal}>×</button>

            <h2>{editingId === 'new' ? 'Add Customer' : 'Edit Customer'}</h2>

            <div className="section-grid">
              <label className="wide">
                Name
                <input
                  value={form.customer_name || ''}
                  onChange={e => updateField('customer_name', e.target.value)}
                  required
                />
              </label>

              <label>
                Email
                <input
                  value={form.email || ''}
                  onChange={e => updateField('email', e.target.value)}
                />
              </label>

              <label>
                Phone
                <input
                  value={form.phone || ''}
                  onChange={e => updateField('phone', e.target.value)}
                />
              </label>

              <label className="wide">
                Address 1
                <input
                  value={form.address_line1 || ''}
                  onChange={e => updateField('address_line1', e.target.value)}
                />
              </label>

              <label className="wide">
                Address 2
                <input
                  value={form.address_line2 || ''}
                  onChange={e => updateField('address_line2', e.target.value)}
                />
              </label>

              <label>
                City
                <input
                  value={form.city || ''}
                  onChange={e => updateField('city', e.target.value)}
                />
              </label>

              <label>
                State
                <input
                  value={form.state || ''}
                  onChange={e => updateField('state', e.target.value)}
                />
              </label>

              <label>
                ZIP
                <input
                  value={form.zip || ''}
                  onChange={e => updateField('zip', e.target.value)}
                />
              </label>

              <label>
                Country
                <input
                  value={form.country || 'US'}
                  onChange={e => updateField('country', e.target.value)}
                />
              </label>
            </div>

            <div className="actions" style={{ marginTop: 16 }}>
              <button className="btn primary" disabled={busy}>
                {busy ? 'Saving...' : 'Save Customer'}
              </button>

              <button className="btn ghost" type="button" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
