const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
function h(extra={}){if(!url||!key)throw new Error('Missing Supabase env vars');return {apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=representation',...extra}}
async function supa(path,options={}){const res=await fetch(`${url}/rest/v1${path}`,{...options,headers:{...h(),...(options.headers||{})},cache:'no-store'});const text=await res.text();let data;try{data=text?JSON.parse(text):[]}catch{data={raw:text}}if(!res.ok)throw new Error(typeof data==='object'?JSON.stringify(data):text);return data}
export const selectCustomers=()=>supa('/shipping_customers?select=*&order=customer_name.asc');
export const selectOrders=()=>supa('/shipping_orders?select=*&order=created_at.desc');
export async function upsertCustomers(rows){if(!rows?.length)return [];const seen=new Set();const clean=rows.filter(r=>{const k=r.import_key||r.email||r.phone||`${r.customer_name}-${r.address_line1}-${r.zip}`;if(!k||seen.has(k))return false;seen.add(k);r.import_key=k;return true});return supa('/shipping_customers?on_conflict=import_key',{method:'POST',headers:h({Prefer:'resolution=merge-duplicates,return=representation'}),body:JSON.stringify(clean)})}
export async function upsertCustomer(row){return upsertCustomers([row])}
export async function updateCustomer(id, patch){return supa(`/shipping_customers?id=eq.${id}`,{method:'PATCH',body:JSON.stringify({...patch,updated_at:new Date().toISOString()})})}
export async function upsertOrder(row){return supa('/shipping_orders',{method:'POST',body:JSON.stringify([{...row,updated_at:new Date().toISOString()}])}).then(r=>r[0])}
export async function updateOrder(id, patch){return supa(`/shipping_orders?id=eq.${id}`,{method:'PATCH',body:JSON.stringify({...patch,updated_at:new Date().toISOString()})}).then(r=>r[0])}
