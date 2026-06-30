'use client';
import { notificationText } from '@/lib/format';

export default function OrderModal({ order, onClose, onRefund }) {
  if (!order) return null;

  async function copy() {
    await navigator.clipboard.writeText(notificationText(order));
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal glass order-modal" onClick={e => e.stopPropagation()}>
        <button className="close" onClick={onClose}>×</button>
        <div className="modal-hero">
          <div>
            <h2>{order.customer_name || 'Customer'}</h2>
            <p className="muted">Order, label, customer, and tracking details</p>
          </div>
          <span className="modal-status">{order.status || 'draft'}</span>
        </div>

        <div className="detail-cards">
          <div><b>Email</b><span>{order.customer_email || '—'}</span></div>
          <div><b>Phone</b><span>{order.customer_phone || '—'}</span></div>
          <div className="wide"><b>Ship To</b><span className="address">{order.customer_address || '—'}</span></div>
          <div><b>Carrier</b><span>{order.carrier || '—'}</span></div>
          <div><b>Service</b><span>{order.mail_class || '—'}</span></div>
          <div><b>Tracking</b><span>{order.tracking_number || '—'}</span></div>
          <div><b>Postage</b><span>{order.postage_amount ? `$${order.postage_amount}` : '—'}</span></div>
          <div><b>Shipment Date</b><span>{order.shipment_date || '—'}</span></div>
          <div className="wide"><b>Notes</b><span>{order.notes || '—'}</span></div>

        </div>

        <div className="notification-preview">
          <b>Notification Preview</b>
          <pre>{notificationText(order)}</pre>
        </div>

        <div className="row modal-actions">
          <button className="btn green" onClick={copy}>Copy Notification</button>
          {order.label_url && <a className="btn ghost" href={order.label_url} target="_blank">Print Label</a>}
          {order.tracking_url && <a className="btn primary" href={order.tracking_url} target="_blank">Track</a>}
          {order.easypost_shipment_id && <button className="btn danger" onClick={() => onRefund(order)}>Refund/Void Label</button>}
        </div>
      </div>
    </div>
  );
}
