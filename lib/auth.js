import crypto from 'crypto';
export const cookieName='ebtq_shipping_session';
export function createSessionToken(){const s=process.env.SHIPPING_SESSION_SECRET||'change-me';return crypto.createHash('sha256').update(s).digest('hex')}
export function isShippingAuthenticated(cookieStore){return cookieStore.get(cookieName)?.value===createSessionToken()}
export function setCookie(res){res.cookies.set(cookieName,createSessionToken(),{httpOnly:true,sameSite:'lax',secure:true,path:'/',maxAge:60*60*24*7})}
export function clearCookie(res){res.cookies.set(cookieName,'',{path:'/',maxAge:0})}
