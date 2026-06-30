'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabaseClient.auth.getSession();

      if (data?.session) {
        window.location.replace('/');
        return;
      }

      setChecking(false);
    }

    checkSession();
  }, []);

  async function loginWithGoogle() {
    await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://ship.erendirasboutique.com/login'
      }
    });
  }

  if (checking) {
    return (
      <main className="login-wrap">
        <section className="login-card glass">
          <p>Checking login...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="login-wrap">
      <section className="login-card glass">
        <img src="/logo.jpeg" alt="Erendira's Boutique" />
        <h1>Shipping Studio</h1>
        <p className="muted">Sign in with your approved Google account.</p>

        <button className="googleBtn" onClick={loginWithGoogle}>
          <span className="googleIcon"><FcGoogle size={20} /></span>
          <span>Continue with Google</span>
        </button>
      </section>
    </main>
  );
}
