'use client';

import { useMemo, useState } from 'react';
import ReturnDetailsModal from './ReturnDetailsModal';

function newCodeForm() {
  return {
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    original_tracking_number: '',
    note: ''
  };
}

export default function ReturnsDashboard({ initialReturns = [], initialCodes = [] }) {
  const [returns, setReturns] = useState(initialReturns);
  const [codes, setCodes] = useState(initialCodes);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(newCodeForm());
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();

    return returns.filter(r =>
      !t ||
      [
        r.customer_name,
        r.customer_email,
        r.original_tracking_number,
        r.return_tracking_number,
        r.access_code,
        r.reason,
        r.status
      ].join(' ').toLowerCase().includes(t)
    );
  }, [q, returns]);

  async function createCode(e) {
    e.preventDefault();
    setBusy(true);
    setMsg('Creating return code...');

    try {
      const res = await fetch('/api/returns/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Could not create code');

      setCodes(data.codes || codes);
      setForm(newCodeForm());
      setMsg(`Return code created: ${data.code?.code}`);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  function onUpdated(next) {
    if (Array.isArray(next)) {
      setReturns(next);
      const s = next.find(r => r.id === selected?.id);
      if (s) setSelected(s);
    }
  }

  return (
    <main className="card boutiqueCard">
      <div className="row">
        <div>
          <p className="eyebrow">Return label desk</p>
          <h2>Returns</h2>
          <p className="muted">
            Generate access codes, review submitted requests, print labels, and track returns.
          </p>
        </div>
      </div>

      <div className="actions" style={{ margin: '14px 0 18px' }}>
        <a
          className="btn ghost"
          href="/return-instructions-half-page.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Return Instructions: Half Page
        </a>

        <a
          className="btn primary"
          href="/return-instructions-full-page.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Return Instructions: Full Page
        </a>
      </div>

      {msg && <div className="notice">{msg}</div>}

      <div className="dashboardSplit">
        <section className="section">
          <h3>Generate Return Code</h3>

          <form className="section-grid" onSubmit={createCode}>
            <label className="wide">
              Customer Name
              <input
                value={form.customer_name}
                onChange={e => setForm({ ...form, customer_name: e.target.value })}
              />
            </label>

            <label>
              Email
              <input
                value={form.customer_email}
                onChange={e => setForm({ ...form, customer_email: e.target.value })}
              />
            </label>

            <label>
              Phone
              <input
                value={form.customer_phone}
                onChange={e => setForm({ ...form, customer_phone: e.target.value })}
              />
            </label>

            <label className="wide">
              Original Tracking Number
              <input
                value={form.original_tracking_number}
                onChange={e => setForm({ ...form, original_tracking_number: e.target.value })}
              />
            </label>

            <label className="wide">
              Internal Note
              <textarea
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
                rows="2"
              />
            </label>

            <div className="wide actions">
              <button className="btn primary" disabled={busy}>
                {busy ? 'Creating...' : 'Create Code'}
              </button>
            </div>
          </form>
        </section>

        <section className="section">
          <h3>Recent Codes</h3>

          <div className="list">
            {codes.slice(0, 5).map(c => (
              <div className="mini-card" key={c.id || c.code}>
                <b>{c.code}</b>
                <span>{c.customer_name || c.customer_email || 'No customer assigned'}</span>
                <small>{c.is_used ? 'Used' : 'Unused'}</small>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="toolbar">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search return requests..."
        />
      </div>

      <div className="list">
        {!filtered.length && <div className="empty">No return requests yet.</div>}

        {filtered.map(r => (
          <button
            key={r.id}
            className="order-card"
            type="button"
            onClick={() => setSelected(r)}
          >
            <div className="order-head">
              <div>
                <h3>{r.customer_name || 'Customer'}</h3>
                <p className="muted">{r.reason || 'Return request'}</p>
              </div>

              <b>{r.status || 'requested'}</b>
            </div>

            <div className="pills">
              <span className="pill">Code: {r.access_code || '—'}</span>
              <span className="pill">Original: {r.original_tracking_number || '—'}</span>
              <span className="pill">Return: {r.return_tracking_number || 'No label yet'}</span>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <ReturnDetailsModal
          returnRequest={selected}
          onClose={() => setSelected(null)}
          onUpdated={onUpdated}
        />
      )}
    </main>
  );
}
