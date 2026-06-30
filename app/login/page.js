'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import { FcGoogle } from 'react-icons/fc';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ship.erendirasboutique.com';

export default function LoginPage() {
  const [message, setMessage] = useState("Sign in with your Erendira's Boutique Google account.");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let tries = 0;

    async function finishLogin() {
      if (!supabaseClient) {
        setMessage('Missing Supabase browser environment variables.');
        return;
      }
      tries += 1;
      const { data } = await supabaseClient.auth.getSession();
      const session = data?.session;
      if (!session && tries < 12) {
        setTimeout(finishLogin, 300);
        return;
      }
      if (!session || cancelled) return;

      setMessage('Creating portal session...');
      const user = session.user || {};
      const res = await fetch('/api/auth/google-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
          avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error === 'Access denied' ? 'Access denied. This Google account is not approved for the shipping portal.' : 'Login worked, but the portal session could not be created.');
        return;
      }

      window.location.replace('/');
    }

    if (window.location.hash.includes('access_token')) {
      setBusy(true);
      setMessage('Finishing Google login...');
      finishLogin();
    }

    return () => { cancelled = true; };
  }, []);

  async function loginWithGoogle() {
    if (!supabaseClient) {
      setMessage('Missing Supabase browser environment variables.');
      return;
    }
    setBusy(true);
    await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${SITE_URL}/login` }
    });
  }

  return (
    <main className="login-wrap">
      <section className="login-card card">
        <img src="/logo.jpeg" alt="Erendira's Boutique" />
        <h1>Shipping Studio</h1>
        <p className="muted">{message}</p>
        <button className="googleBtn" onClick={loginWithGoogle} disabled={busy}>
          <span className="googleIcon"><FcGoogle size={22} /></span>
          <span>{busy ? 'Please wait...' : 'Continue with Google'}</span>
        </button>
      </section>
    </main>
  );
}
