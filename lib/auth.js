import crypto from 'crypto';
export const cookieName = 'ebtq_shipping_session';
export function createSessionToken(){const secret=process.env.SHIPPING_SESSION_SECRET||'change-me';return crypto.createHash('sha256').update(secret).digest('hex')}
export function isShippingAuthenticated(cookieStore){return cookieStore.get(cookieName)?.value===createSessionToken()}
export function setCookie(res){res.cookies.set(cookieName,createSessionToken(),{path:'/',httpOnly:true,sameSite:'lax',secure:true,maxAge:60*60*24*7})}
export function clearCookie(res){res.cookies.set(cookieName,'',{path:'/',maxAge:0})}
