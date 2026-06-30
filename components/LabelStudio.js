'use client';
import { useMemo, useState } from 'react';

const empty={customer_id:'',customer_name:'',customer_email:'',customer_phone:'',address_line1:'',address_line2:'',city:'',state:'CA',zip:'',country:'US',parcel_length:13,parcel_width:10,parcel_height:10,parcel_weight_lb:1,parcel_weight_oz:0,signature_required:false,notes:''};

export default function LabelStudio({initialCustomers=[]}){
  const [customers,setCustomers]=useState(initialCustomers);
  const [q,setQ]=useState('');
  const [order,setOrder]=useState(empty);
  const [saved,setSaved]=useState(null);
  const [rates,setRates]=useState([]);
  const [msg,setMsg]=useState('');
  const [busy,setBusy]=useState(false);

  const matches=useMemo(()=>{
    const t=q.toLowerCase().trim();
    return customers.filter(c=>!t||[c.customer_name,c.email,c.phone,c.customer_address,c.zip].join(' ').toLowerCase().includes(t)).slice(0,8)
  },[q,customers]);

  function useCustomer(c){
    setOrder(o=>({...o,customer_id:c.id,customer_name:c.customer_name,customer_email:c.email||c.customer_email,customer_phone:c.phone||c.customer_phone,address_line1:c.address_line1,address_line2:c.address_line2,city:c.city,state:c.state,zip:c.zip,country:c.country||'US'}));
    setQ(c.customer_name)
  }

  function set(k,v){setOrder(o=>({...o,[k]:v}))}

  async function save(){
    setBusy(true);
    setMsg('Saving order...');
    try{
      const res=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(order)});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error || 'Could not save order');
      setSaved(data.order);
      setOrder(data.order);
      setMsg('Order saved.');
      return data.order;
    }catch(e){
      setMsg(e.message);
      throw e;
    }finally{
      setBusy(false)
    }
  }

  async function getRates(){
    setBusy(true);
    setMsg('Saving order and getting EasyPost rates...');
    try{
      let currentOrder=saved||order;

      if(!currentOrder.id){
        const saveRes=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(currentOrder)});
        const saveData=await saveRes.json();
        if(!saveRes.ok)throw new Error(saveData.error || 'Could not save order');
        currentOrder=saveData.order;
        setSaved(currentOrder);
        setOrder(currentOrder);
      }

      const res=await fetch('/api/orders/rates',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order:currentOrder})});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error || 'Could not get rates');

      setSaved(data.order);
      setOrder(data.order);
      setRates(data.rates||[]);
      setMsg(`${(data.rates||[]).length} rates found.`);
    }catch(e){
      setMsg(e.message)
    }finally{
      setBusy(false)
    }
  }

  async function buy(rate){
    setBusy(true);
    setMsg('Purchasing 4x6 label...');
    try{
      const res=await fetch('/api/orders/buy-label',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order:saved||order,rateId:rate.id})});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error || 'Could not purchase label');
      setMsg('Label purchased. Returning to dashboard...');
      setTimeout(()=>location.href='/',900)
    }catch(e){
      setMsg(e.message)
    }finally{
      setBusy(false)
    }
  }

<div className="form">
  <div className="card mini">
    <h3>Customer</h3>
    {/* customer search, name, phone, email */}
  </div>

  <div className="card mini">
    <h3>Shipping Address</h3>
    {/* address1, address2, city, state, zip */}
  </div>

  <div className="card mini">
    <h3>Package Weight</h3>
    {/* lbs, oz */}
  </div>

  <div className="card mini">
    <h3>Package Dimensions</h3>
    {/* length, width, height */}
  </div>

  <div className="card mini">
    <h3>Shipping Options</h3>
    {/* signature checkbox, notes */}
  </div>
</div>}
