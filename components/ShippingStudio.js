'use client';
import { useMemo, useState } from 'react';
import { notificationText } from '@/lib/format';

const blank = {
  customer_name:'', customer_email:'', customer_phone:'', address_line1:'', address_line2:'', city:'', state:'CA', zip:'', country:'US',
  parcel_length:'13', parcel_width:'10', parcel_height:'10', parcel_weight:'', weight_unit:'oz', ship_date:new Date().toISOString().slice(0,10),
  printer_type:'thermal-wide', require_signature:false, saturday_delivery_ups:false, additional_handling_ups:false, insurance_enabled:false, insure_shipping:false, insured_value:'', package_type_ups:'', notes:''
};
function today(){return new Date().toISOString().slice(0,10)}
function titleCarrier(r){return r.carrier || r.provider || r.shippingMethod || 'Carrier'}
function titleService(r){return r.serviceLevel || r.service || r.name || r.servicelevel?.name || 'Service'}
function price(r){return r.amount || r.rate || r.price || r.total || ''}

export default function ShippingStudio({ initialOrders=[], loadError='' }){
  const [orders,setOrders]=useState(initialOrders);
  const [form,setForm]=useState({...blank, ship_date:today()});
  const [selected,setSelected]=useState(null);
  const [rates,setRates]=useState([]);
  const [message,setMessage]=useState(loadError);
  const [busy,setBusy]=useState(false);
  const [q,setQ]=useState('');
  const [batch,setBatch]=useState([]);

  const filtered=useMemo(()=>{const t=q.toLowerCase(); return orders.filter(o=>!t||[o.customer_name,o.customer_email,o.customer_phone,o.tracking_number,o.city,o.zip,o.carrier,o.mail_class].join(' ').toLowerCase().includes(t))},[orders,q]);
  const labelCount = orders.filter(o=>o.label_url).length;
  const batchLabels = orders.filter(o=>batch.includes(o.id) && o.label_url).map(o=>o.label_url);
  function set(k,v){setForm(p=>({...p,[k]:v}))}
  async function api(url,body){ const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); const data=await res.json(); if(!res.ok) throw new Error(data.error||'Request failed'); return data; }
  async function saveDraft(e){ e?.preventDefault(); setBusy(true); setMessage('Saving order...'); try{ const data=await api('/api/shipping/orders',form); setOrders(data.orders||orders); setSelected(data.order); setMessage('Order saved. Now create the Ship.com order and get rates.'); }catch(err){setMessage(err.message)}finally{setBusy(false)} }
  async function createOrder(){ if(!selected) return; setBusy(true); setMessage('Creating Ship.com order...'); try{ const data=await api('/api/shipping/create-order',selected); setOrders(data.orders||orders); setSelected(data.order); setMessage('Ship.com order created. Getting rates...'); await getRates(data.order); }catch(err){setMessage(err.message)}finally{setBusy(false)} }
  async function getRates(order=selected){ if(!order) return; setBusy(true); setMessage('Loading shipping methods...'); try{ const data=await api('/api/shipping/rates',order); setRates(data.rates||[]); setMessage((data.rates||[]).length ? 'Choose a shipping method.' : 'No rates returned. Check address/package details.'); }catch(err){setMessage(err.message)}finally{setBusy(false)} }
  async function buyLabel(rate){ if(!selected) return; setBusy(true); setMessage('Buying label...'); try{ const data=await api('/api/shipping/buy-label',{order:selected,rate}); setOrders(data.orders||orders); setSelected(data.order); setMessage('Label purchased. You can print it, add it to a batch, or copy the notification.'); }catch(err){setMessage(err.message)}finally{setBusy(false)} }
  async function cancelLabel(o){ if(!confirm('Cancel/refund this shipping label? Only works if Ship.com enables this endpoint for your account.')) return; setBusy(true); setMessage('Requesting cancellation/refund...'); try{ const data=await api('/api/shipping/cancel-label',o); setOrders(data.orders||orders); setSelected(data.order||o); setMessage('Cancel/refund request sent.'); }catch(err){setMessage(err.message)}finally{setBusy(false)} }
  async function copy(o){ await navigator.clipboard.writeText(notificationText(o)); setMessage('Notification copied.'); }
  function openOrder(o){ setSelected(o); setRates([]); }
  function toggleBatch(o){ setBatch(prev=>prev.includes(o.id)?prev.filter(x=>x!==o.id):[...prev,o.id]); }
  async function printBatch(){ if(!batchLabels.length){ setMessage('Select at least one purchased label first.'); return; } const res=await fetch('/api/shipping/batch-pdf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({labels:batchLabels})}); if(!res.ok){ const data=await res.json().catch(()=>({error:'Batch PDF failed'})); setMessage(data.error); return; } const blob=await res.blob(); const url=URL.createObjectURL(blob); window.open(url,'_blank'); }

  return <div className="studio-page">
    <div className="bg-flower f1">✿</div><div className="bg-flower f2">✿</div><div className="bg-flower f3">✿</div>
    <header className="hero glass-card"><img src="/logo.jpeg"/><div><p>Erendira&apos;s Boutique</p><h1>Shipping Studio</h1><span>Create Ship.com labels from your own portal.</span></div><nav className="top-links"><a className="btn ghost" href="/shipping/customers">Customers</a><form action="/api/auth/logout" method="post"><button className="btn ghost">Logout</button></form></nav></header>
    {message && <div className="notice">{message}</div>}
    <section className="batch-bar glass-card"><b>{batch.length}</b><span>labels selected for batch printing</span><button className="btn green" onClick={printBatch}>Combine PDFs + Print Batch</button><button className="btn ghost" onClick={()=>setBatch([])}>Clear Batch</button></section>
    <main className="studio-grid">
      <section className="panel glass-card"><h2>1. Customer</h2><form onSubmit={saveDraft} className="order-form">
        <input placeholder="Customer name" value={form.customer_name} onChange={e=>set('customer_name',e.target.value)} required/><input placeholder="Email" value={form.customer_email} onChange={e=>set('customer_email',e.target.value)}/><input placeholder="Phone" value={form.customer_phone} onChange={e=>set('customer_phone',e.target.value)}/>
        <input className="wide" placeholder="Street address" value={form.address_line1} onChange={e=>set('address_line1',e.target.value)} required/><input className="wide" placeholder="Apt, suite, etc." value={form.address_line2} onChange={e=>set('address_line2',e.target.value)}/>
        <input placeholder="City" value={form.city} onChange={e=>set('city',e.target.value)} required/><input placeholder="State" value={form.state} onChange={e=>set('state',e.target.value)} required/><input placeholder="ZIP" value={form.zip} onChange={e=>set('zip',e.target.value)} required/>
        <h2 className="wide small-head">2. Package</h2><input placeholder="Length" value={form.parcel_length} onChange={e=>set('parcel_length',e.target.value)}/><input placeholder="Width" value={form.parcel_width} onChange={e=>set('parcel_width',e.target.value)}/><input placeholder="Height" value={form.parcel_height} onChange={e=>set('parcel_height',e.target.value)}/><input placeholder="Weight" value={form.parcel_weight} onChange={e=>set('parcel_weight',e.target.value)} required/>
        <select value={form.weight_unit} onChange={e=>set('weight_unit',e.target.value)}><option>oz</option><option>lb</option></select>
        <button disabled={busy} className="btn primary wide">Save Order</button>
      </form></section>
      <section className="panel glass-card"><h2>3. Label Options</h2><div className="options">
        <label>Printer Type<select value={form.printer_type} onChange={e=>set('printer_type',e.target.value)}><option value="thermal-wide">Thermal - wide</option><option value="thermal-4x6">Thermal 4x6</option><option value="paper-8.5x11">Paper 8.5x11</option></select></label><label>Ship Date<input type="date" value={form.ship_date} onChange={e=>set('ship_date',e.target.value)}/></label>
        <label className="check"><input type="checkbox" checked={form.require_signature} onChange={e=>set('require_signature',e.target.checked)}/> Require Signature</label><label className="check"><input type="checkbox" checked={form.insurance_enabled} onChange={e=>set('insurance_enabled',e.target.checked)}/> Insurance</label><label className="check"><input type="checkbox" checked={form.saturday_delivery_ups} onChange={e=>set('saturday_delivery_ups',e.target.checked)}/> Saturday Delivery (UPS)</label><label className="check"><input type="checkbox" checked={form.additional_handling_ups} onChange={e=>set('additional_handling_ups',e.target.checked)}/> Additional Handling (UPS)</label>
        <input placeholder="Insured value" value={form.insured_value} onChange={e=>set('insured_value',e.target.value)}/><button disabled={busy||!selected} onClick={createOrder} className="btn green">Create Order + Rates</button>
      </div><div className="rates"><h2>4. Choose Shipping Method</h2>{!rates.length && <p className="muted">Save an order, then create order + rates.</p>}{rates.map((r,i)=><button key={i} onClick={()=>buyLabel(r)} className="rate-card"><b>{titleCarrier(r)} {titleService(r)}</b><span>{price(r) ? `$${price(r)}` : 'Select'}</span><small>{r.estimatedDays || r.delivery_days || r.deliveryEstimate || ''}</small></button>)}</div></section>
      <section className="panel glass-card orders-panel"><h2>Orders <small>{labelCount} labels</small></h2><input className="search" placeholder="Search orders..." value={q} onChange={e=>setQ(e.target.value)}/><div className="order-list">{filtered.map(o=><div key={o.id} className="order-row-wrap"><button onClick={()=>openOrder(o)} className="order-row"><b>{o.customer_name||'Customer'}</b><span>{o.tracking_number||o.status||'draft'}</span></button>{o.label_url && <label className="mini-check"><input type="checkbox" checked={batch.includes(o.id)} onChange={()=>toggleBatch(o)}/> batch</label>}</div>)}</div></section>
    </main>
    {selected && <div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="modal glass-card" onClick={e=>e.stopPropagation()}><button className="x" onClick={()=>setSelected(null)}>×</button><h2>{selected.customer_name}</h2><p>{selected.customer_email} {selected.customer_phone}</p><pre>{selected.customer_address || [selected.address_line1,selected.address_line2,`${selected.city}, ${selected.state} ${selected.zip}`].filter(Boolean).join('\n')}</pre><div className="modal-grid"><span>Carrier</span><b>{selected.carrier||'—'}</b><span>Service</span><b>{selected.mail_class||'—'}</b><span>Tracking</span><b>{selected.tracking_number||'—'}</b><span>Status</span><b>{selected.status||'draft'}</b></div><div className="actions">{selected.label_url && <a className="btn ghost" href={selected.label_url} target="_blank">Print Label</a>}{selected.tracking_number && <a className="btn primary" href={`https://track.erendirasboutique.com/?tracking=${encodeURIComponent(selected.tracking_number)}`} target="_blank">Open Tracking</a>}<button className="btn green" onClick={()=>copy(selected)}>Copy Notification</button>{selected.label_url && <button className="btn danger" onClick={()=>cancelLabel(selected)}>Cancel / Refund Label</button>}</div></div></div>}
  </div>
}
