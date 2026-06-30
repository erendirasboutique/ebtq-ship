import crypto from 'crypto';

export const cookieName = 'eb_shipping_session';
export const userCookieName = 'eb_shipping_user';

export function createSessionToken(email = '') {
  const secret = process.env.SHIPPING_SESSION_SECRET || 'shipping-secret';
  return crypto.createHash('sha256').update(`${secret}:${String(email).toLowerCase()}`).digest('hex');
}

export function isShippingAuthenticated(cookieStore) {
  return Boolean(cookieStore.get(cookieName)?.value);
}

export function setShippingCookie(res, profile = {}) {
  const email = profile.email || '';
  const name = profile.name || email.split('@')[0] || 'Team';
  const role = profile.role || 'staff';
  const avatar = profile.avatar || '';

  res.cookies.set(cookieName, createSessionToken(email), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 60 * 60 * 24 * 7
  });

  res.cookies.set(userCookieName, JSON.stringify({ email, name, role, avatar }), {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    secure: true,
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearShippingCookie(res) {
  res.cookies.set(cookieName, '', { path: '/', maxAge: 0 });
  res.cookies.set(userCookieName, '', { path: '/', maxAge: 0 });
}

export function portalPassword() {
  return process.env.SHIPPING_PORTAL_PASSWORD || '';
}
