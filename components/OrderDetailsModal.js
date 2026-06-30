'use client';

import { useState } from 'react';
import { notificationText, fullAddress } from '@/lib/format';

export default function OrderDetailsModal({ order, onClose, onUpdated }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function copyNotification() {
    await navigator.clipboard.writeText(notificationText(order));
    setMessage('Notification copied.');
  }

  async function refundLabel() {
    const ok = confirm('Are you sure you want to request a refund/cancel this label?');
    if (!ok) return;

    setBusy(true);
    setMessage('Requesting refund...');

    try {
      const res = await fetch('/api/orders/refund-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Could not refund label');
      }

      setMessage('Refund requested.');
      if (onUpdated) onUpdated(data.orders);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }

  const address = order.customer_address || fullAddress(order);
  const weight = `${order.parcel_weight_lb || 0} lb ${order.parcel_weight_oz || 0} oz`;
  const dimensions = `${order.parcel_length || 13} × ${order.parcel_width || 10} × ${order.parcel_height || 10} in`;

  const canRefund =
    order.easypost_shipment_id &&
    order.status !== 'refunded' &&
    order.status !== 'refund_requested';

  return (
    <div className="modal-backdrop">
      <div className="modal card">
        <button className="close" type="button" onClick={onClose}>×</button>

        <h2>Shipment Details</h2>
        <p className="muted">{order.customer_name || 'Customer'}</p>

        {message && <div className="notice">{message}</div>}

        <div className="detail-grid">
          <b>Customer</b>
          <span>{order.customer_name || '—'}</span>

          <b>Email</b>
          <span>{order.customer_email || order.email || '—'}</span>

          <b>Phone</b>
          <span>{order.customer_phone || order.phone || '—'}</span>

          <b>Address</b>
          <span>{address || '—'}</span>

          <b>Package</b>
          <span>{dimensions} · {weight}</span>

          <b>Carrier</b>
          <span>{order.carrier || '—'}</span>

          <b>Service</b>
          <span>{order.mail_class || '—'}</span>

          <b>Tracking</b>
          <span>{order.tracking_number || '—'}</span>

          <b>Status</b>
          <span>{order.status || 'draft'}</span>

          <b>Postage</b>
          <span>{order.postage_amount ? `$${order.postage_amount}` : '—'}</span>
        </div>

        <div className="actions">
          {order.label_url && (
            <a className="btn primary" href={order.label_url} target="_blank">
              Print Label
            </a>
          )}

          {order.tracking_url && (
            <a className="btn ghost" href={order.tracking_url} target="_blank">
              Track Package
            </a>
          )}

          <button className="btn green" type="button" onClick={copyNotification}>
            Copy Notification
          </button>

          {canRefund && (
            <button className="btn danger" type="button" onClick={refundLabel} disabled={busy}>
              {busy ? 'Requesting...' : 'Cancel / Refund Label'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
