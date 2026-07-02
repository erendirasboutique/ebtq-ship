'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { notificationText, fullAddress } from '@/lib/format';

function formatDateTime(value) {
  if (!value) return '—';

  try {
    return new Date(value).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch {
    return '—';
  }
}

export default function OrderDetailsModal({ order, onClose, onUpdated }) {
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => setMounted(true), []);

  async function copy() {
    await navigator.clipboard.writeText(notificationText(order));
    setMessage('Notification copied.');
  }
async function deleteOrder() {
  const ok = confirm(
    `Delete the order for "${order.customer_name}"?\n\nThis cannot be undone.`
  );

  if (!ok) return;

  setBusy(true);
  setMessage('Deleting order...');

  try {
    const res = await fetch('/api/orders/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: order.id
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Could not delete order.');
    }

    setMessage('Order deleted.');

    onUpdated?.(data.orders || []);

    onClose();
  } catch (e) {
    setMessage(e.message);
  } finally {
    setBusy(false);
  }
}
  async function refundLabel() {
    const ok = confirm('Request a refund/cancellation for this Shippo label?');
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
      if (!res.ok) throw new Error(data.error || 'Could not refund label');

      setMessage('Refund requested.');
      onUpdated?.(data.orders || []);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!mounted || !order) return null;

  const canRefund =
    order.shippo_transaction_id &&
    !['refunded', 'refund_requested'].includes(order.status);

  const trackUrl = order.tracking_number
    ? `https://track.erendirasboutique.com/?tracking=${encodeURIComponent(order.tracking_number)}`
    : order.tracking_url;

  return createPortal(
    <div className="modal-backdrop">
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
      >
        <button className="close" type="button" onClick={onClose}>×</button>

        <h2>{order.customer_name || 'Shipment Details'}</h2>
        <p className="muted">Full label, tracking, package, and customer details.</p>

        {message && <div className="notice">{message}</div>}

        <div className="detail-grid">
          <b>Address</b>
          <span>{order.customer_address || fullAddress(order) || '—'}</span>

          <b>Package</b>
          <span>
            {order.parcel_length || 13} × {order.parcel_width || 10} × {order.parcel_height || 10} in · {order.parcel_weight_lb || 0} lb {order.parcel_weight_oz || 0} oz
          </span>

          <b>Carrier</b>
          <span>{order.carrier || '—'}</span>

          <b>Service</b>
          <span>{order.mail_class || '—'}</span>

          <b>Postage</b>
          <span>{order.postage_amount ? `$${order.postage_amount} ${order.postage_currency || 'USD'}` : '—'}</span>

          <b>Created</b>
          <span>{formatDateTime(order.label_purchased_at || order.created_at)}</span>

          <b>Tracking</b>
          <span>{order.tracking_number || '—'}</span>

          <b>Status</b>
          <span>{order.status || 'draft'}</span>

          <b>Refund</b>
          <span>{order.refund_status || '—'}</span>

          <b>Notes</b>
          <span>{order.notes || '—'}</span>
        </div>

        <div className="actions">
          {order.label_url && (
            <a className="btn primary" href={order.label_url} target="_blank" rel="noopener noreferrer">
              Print Label
            </a>
          )}

          {trackUrl && (
            <a className="btn ghost" href={trackUrl} target="_blank" rel="noopener noreferrer">
              Track Package
            </a>
          )}
{!order.label_url && (
  <a
    className="btn primary"
    href={`/create-label?order=${encodeURIComponent(order.id)}`}
  >
    Continue Label
  </a>
)}
  
<button
  className="btn danger"
  type="button"
  onClick={deleteOrder}
  disabled={busy}
>
  Delete Order
</button>
          <button className="btn green" type="button" onClick={copy}>Copy Notification</button>

          {canRefund && (
            <button className="btn danger" type="button" onClick={refundLabel} disabled={busy}>
              {busy ? 'Requesting...' : 'Cancel / Refund Label'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
