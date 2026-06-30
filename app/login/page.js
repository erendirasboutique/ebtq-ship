'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
const [message, setMessage] = useState("Sign in with your Erendira's Boutique Google account.");
  useEffect(() => {
    let tries = 0;

    async function finishLogin() {
      tries += 1;

      const { data } = await supabaseClient.auth.getSession();
      const session = data?.session;

      if (!session && tries < 10) {
        setTimeout(finishLogin, 300);
        return;
      }

      if (!session) {
        return;
      }

      const email = session.user?.email || '';

      const res = await fetch('/api/auth/google-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        setMessage('Login worked, but the portal session could not be created.');
        return;
      }

      window.location.replace('/');
    }

    if (window.location.hash.includes('access_token')) {
      setMessage('Finishing login...');
      finishLogin();
    }
  }, []);

  async function loginWithGoogle() {
    await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://ship.erendirasboutique.com/login'
      }
    });
  }

  return (
    <main className="login-wrap">
      <section className="login-card glass">
        <img src="/logo.jpeg" alt="Erendira's Boutique" />
        <h1>Shipping Studio</h1>
        <p className="muted">{message}</p>

        <button className="googleBtn" onClick={loginWithGoogle}>
          <span className="googleIcon"><FcGoogle size={20} /></span>
          <span>Continue with Google</span>
        </button>
      </section>
    </main>
  );
}
