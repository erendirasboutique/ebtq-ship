'use client';

import { useEffect } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';

export default function LoginPage() {
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabaseClient.auth.getSession();

      if (data?.session) {
        window.location.href = '/';
      }
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

  return (
    <main className="login-wrap">
      <section className="login-card glass">
        <img src="/logo.jpeg" alt="Erendira's Boutique" />
        <h1>Shipping Studio</h1>
        <p className="muted">Sign in with your Erendira's Boutique Google account.</p>

        <button className="googleBtn" onClick={loginWithGoogle}>
  <div className="googleIcon">
    <FcGoogle size={20}/>
  </div>

  <span>Continue with Google</span>
</button>
      </section>
    </main>
  );
}
