const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
function headers(extra={}){if(!url||!key)throw new Error('Missing Supabase environment variables');return {apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=representation',...extra}}
async function sb(path,options={}){const res=await fetch(`${url}/rest/v1${path}`,{...options,headers:{...headers(),...(options.headers||{})},cache:'no-store'});const text=await res.text();let data;try{data=text?JSON.parse(text):[]}catch{data={raw:text}}if(!res.ok)throw new Error(typeof data==='object'?JSON.stringify(data):text);return data}
export async function selectCustomers(){return sb('/shipping_customers?select=*&order=customer_name.asc')}
export async function upsertCustomers(rows=[]){if(!rows.length)return [];return sb('/shipping_customers?on_conflict=import_key',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(rows)})}
export async function updateCustomer(id, patch){return sb(`/shipping_customers?id=eq.${id}`,{method:'PATCH',body:JSON.stringify({...patch,updated_at:new Date().toISOString()})})}
export async function selectOrders(){return sb('/shipping_orders?select=*&order=created_at.desc')}
export async function upsertOrder(order){const payload={...order,customer_address:order.customer_address||[order.address_line1,order.address_line2,[order.city,order.state,order.zip].filter(Boolean).join(', ')].filter(Boolean).join('\n'),updated_at:new Date().toISOString()};return sb('/shipping_orders',{method:'POST',body:JSON.stringify(payload)})}
export async function updateOrder(id, patch){return sb(`/shipping_orders?id=eq.${id}`,{method:'PATCH',body:JSON.stringify({...patch,updated_at:new Date().toISOString()})})}
export async function getOrder(id){const rows=await sb(`/shipping_orders?id=eq.${id}&select=*`);return rows[0]}
