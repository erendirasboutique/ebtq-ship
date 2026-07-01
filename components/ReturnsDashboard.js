'use client';
import { useMemo, useState } from 'react';
import ReturnDetailsModal from './ReturnDetailsModal';

function newCodeForm(){return {customer_name:'',customer_email:'',customer_phone:'',original_tracking_number:'',note:''}}
export default function ReturnsDashboard({initialReturns=[], initialCodes=[]}){
  const [returns,setReturns]=useState(initialReturns);
  const [codes,setCodes]=useState(initialCodes);
  const [q,setQ]=useState('');
  const [selected,setSelected]=useState(null);
  const [form,setForm]=useState(newCodeForm());
  const [msg,setMsg]=useState('');
  const [busy,setBusy]=useState(false);
  const filtered=useMemo(()=>{const t=q.toLowerCase().trim();return returns.filter(r=>!t||[r.customer_name,r.customer_email,r.original_tracking_number,r.return_tracking_number,r.access_code,r.reason,r.status].join(' ').toLowerCase().includes(t))},[q,returns]);
  async function createCode(e){e.preventDefault();setBusy(true);setMsg('Creating return code...');try{const res=await fetch('/api/returns/code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});const data=await res.json();if(!res.ok)throw new Error(data.error||'Could not create code');setCodes(data.codes||codes);setForm(newCodeForm());setMsg(`Return code created: ${data.code?.code}`)}catch(err){setMsg(err.message)}finally{setBusy(false)}}
  function onUpdated(next){if(Array.isArray(next)){setReturns(next);const s=next.find(r=>r.id===selected?.id);if(s)setSelected(s)}}
  return <main className="card boutiqueCard"><div className="row"><div><p className="eyebrow">Return label desk</p><h2>Returns</h2><p className="muted">Generate access codes, review submitted requests, print labels, and track returns.</p></div></div><div className="actions" style={{margin:'14px 0 18px'}}><a className="btn ghost" href="/return-instructions-half-page.pdf" target="_blank" rel="noopener noreferrer">Half Page</a><a className="btn primary" href="/return-instructions-full-page.pdf" target="_blank" rel="noopener noreferrer">Full Page</a></div>{msg&&
