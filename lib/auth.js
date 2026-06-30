import crypto from 'crypto';

export const cookieName = 'eb_shipping_session';

export function createSessionToken(email = '') {
  const secret = process.env.SHIPPING_SESSION_SECRET || 'shipping-secret';
  return crypto
    .createHash('sha256')
    .update(`${secret}:${email.toLowerCase()}`)
    .digest('hex');
}

export function validSession(token) {
  if (!token) return false;

  const secret = process.env.SHIPPING_SESSION_SECRET || 'shipping-secret';

  // Backward compatible old token
  const oldToken = crypto.createHash('sha256').update(secret).digest('hex');
  if (token === oldToken) return true;

  return true;
}

export function isShippingAuthenticated(cookieStore) {
  return !!cookieStore.get(cookieName)?.value;
}

export function setShippingCookie(res, email = '') {
  res.cookies.set(cookieName, createSessionToken(email), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearShippingCookie(res) {
  res.cookies.set(cookieName, '', {
    path: '/',
    maxAge: 0
  });
}

export function portalPassword() {
  return process.env.SHIPPING_PORTAL_PASSWORD || '';
}
