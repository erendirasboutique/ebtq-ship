'use client';
import { useMemo, useState } from 'react';

export default function CustomersPage({ initialCustomers=[] }){
  const [customers,setCustomers]=useState(initialCustomers);
  const [selected,setSelected]=useState(null);
  const [q,setQ]=useState('');
  const [message,setMessage]=useState('');
  const filtered=useMemo(()=>{const t=q.toLowerCase(); return customers.filter(c=>!t||[c.customer_name,c.customer_email,c.customer_phone,c.customer_address,c.city,c.zip].join(' ').toLowerCase().includes(t));},[customers,q]);
  function editCustomer(c){ setSelected({...c}); }
  function set(k,v){ setSelected(p=>({...p,[k]:v})); }
  async function save(){
    setMessage('Saving customer address...');
    const patch={customer_name:selected.customer_name,customer_email:selected.customer_email,customer_phone:selected.customer_phone,address_line1:selected.address_line1,address_line2:selected.address_line2,city:selected.city,state:selected.state,zip:selected.zip,country:selected.country,customer_address:[selected.address_line1,selected.address_line2,`${selected.city}, ${selected.state} ${selected.zip}`].filter(Boolean).join('\n')};
    const match={customer_email:selected.customer_email,customer_phone:selected.customer_phone,customer_name:selected.customer_name};
    const res=await fetch('/api/shipping/update-customer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({match,patch})});
    const data=await res.json();
    if(!res.ok){ setMessage(data.error||'Could not save'); return; }
    const grouped=new Map();
    for(const row of data.orders){ const key=row.customer_email||row.customer_phone||`${row.customer_name}-${row.zip}`; if(!grouped.has(key)) grouped.set(key,{...row,orders:[],order_count:0}); const c=grouped.get(key); c.orders.push(row); c.order_count++; }
    setCustomers(Array.from(grouped.values())); setMessage('Customer updated.'); setSelected(null);
  }
  return <div className="studio-page">
    <div className="bg-flower f1">✿</div><div className="bg-flower f2">✿</div>
    <header className="hero glass-card"><img src="/logo.jpeg"/><div><p>Erendira&apos;s Boutique</p><h1>Customers</h1><span>View customers, update addresses, and see every order.</span></div><nav className="top-links"><a className="btn ghost" href="/shipping">Shipping Studio</a><form action="/api/auth/logout" method="post"><button className="btn ghost">Logout</button></form></nav></header>
    {message && <div className="notice">{message}</div>}
    <section className="panel glass-card"><input className="search" placeholder="Search customers..." value={q} onChange={e=>setQ(e.target.value)}/><div className="customer-grid">{filtered.map(c=><button className="customer-card" key={(c.customer_email||c.customer_phone||c.customer_name)+c.zip} onClick={()=>editCustomer(c)}><b>{c.customer_name||'Customer'}</b><span>{c.customer_email||c.customer_phone||'No contact saved'}</span><small>{c.order_count} order(s)</small><pre>{c.customer_address || [c.address_line1,c.address_line2,`${c.city}, ${c.state} ${c.zip}`].filter(Boolean).join('\n')}</pre></button>)}</div></section>
    {selected && <div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="modal glass-card wide-modal" onClick={e=>e.stopPropagation()}><button className="x" onClick={()=>setSelected(null)}>×</button><h2>{selected.customer_name}</h2><div className="edit-grid"><input value={selected.customer_name||''} onChange={e=>set('customer_name',e.target.value)} placeholder="Name"/><input value={selected.customer_email||''} onChange={e=>set('customer_email',e.target.value)} placeholder="Email"/><input value={selected.customer_phone||''} onChange={e=>set('customer_phone',e.target.value)} placeholder="Phone"/><input className="wide" value={selected.address_line1||''} onChange={e=>set('address_line1',e.target.value)} placeholder="Street"/><input className="wide" value={selected.address_line2||''} onChange={e=>set('address_line2',e.target.value)} placeholder="Apt/Suite"/><input value={selected.city||''} onChange={e=>set('city',e.target.value)} placeholder="City"/><input value={selected.state||''} onChange={e=>set('state',e.target.value)} placeholder="State"/><input value={selected.zip||''} onChange={e=>set('zip',e.target.value)} placeholder="ZIP"/></div><button className="btn green" onClick={save}>Save Address For Customer</button><h3>Orders</h3><div className="order-history">{(selected.orders||[]).map(o=><div className="history-row" key={o.id}><b>{o.tracking_number||o.status||'draft'}</b><span>{o.carrier||'—'} {o.mail_class||''}</span>{o.label_url&&<a href={o.label_url} target="_blank">Print</a>}</div>)}</div></div></div>}
  </div>
}
