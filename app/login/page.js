'use client';

import { supabaseClient } from '@/lib/supabaseClient';

export default function LoginPage() {
  async function loginWithGoogle() {
  await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://ship.erendirasboutique.com'
    }
  });
}

  return (
    <main className="login-wrap">
      <section className="login-card glass">
        <img src="/logo.jpeg" alt="Erendira's Boutique" />
        <h1>Shipping Studio</h1>
        <p className="muted">Sign in with your approved Google account.</p>

        <button className="btn primary" onClick={loginWithGoogle}>
          Continue with Google
        </button>
      </section>
    </main>
  );
}
