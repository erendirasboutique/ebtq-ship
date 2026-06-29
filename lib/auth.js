import crypto from 'crypto';
export const cookieName='eb_shipping_session';
export function portalPassword(){return process.env.SHIPPING_PORTAL_PASSWORD||''}
export function createSessionToken(){const secret=process.env.SHIPPING_SESSION_SECRET||'shipping-secret';return crypto.createHash('sha256').update(secret).digest('hex')}
export function validSession(token){return token===createSessionToken()}
export function isShippingAuthenticated(cookieStore){return validSession(cookieStore.get(cookieName)?.value)}
export function setShippingCookie(res){res.cookies.set(cookieName,createSessionToken(),{path:'/',httpOnly:true,sameSite:'lax',secure:true,maxAge:60*60*24*7})}
export function clearShippingCookie(res){res.cookies.set(cookieName,'',{path:'/',maxAge:0})}
