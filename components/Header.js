'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabaseClient';

function readUserCookie() {
  if (typeof document === 'undefined') return null;
  const raw = document.cookie.split('; ').find(x => x.startsWith('eb_shipping_user='));
  if (!raw) return null;
  try { return JSON.parse(decodeURIComponent(raw.split('=').slice(1).join('='))); } catch { return null; }
}

export default function Header() {
  const [user, setUser] = useState(null);
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const storedDark = localStorage.getItem('eb_dark') === 'true';
    setDark(storedDark);
    document.documentElement.classList.toggle('dark', storedDark);

    const cookieUser = readUserCookie();
    if (cookieUser) setUser(cookieUser);

    supabaseClient?.auth.getUser().then(({ data }) => {
      const u = data?.user;
      if (u) setUser({
        email: u.email,
        name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0],
        avatar: u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
        role: cookieUser?.role || 'staff'
      });
    });
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    localStorage.setItem('eb_dark', String(next));
    document.documentElement.classList.toggle('dark', next);
  }

  async function signOut(e) {
    e.preventDefault();
    await supabaseClient?.auth.signOut();
    e.currentTarget.submit();
  }

  const firstName = (user?.name || 'Team').split(' ')[0];

  return (
    <header className="topbar card">
      <div className="brand">
        <img src="/logo.jpeg" className="brand-mark" alt="Erendira's Boutique" />
        <div>
          <h1>Shipping Studio</h1>
          <p>Welcome, {firstName}</p>
        </div>
      </div>

      <nav className="nav">
        <Link href="/">Dashboard</Link>
        <Link href="/create-label">Create Label</Link>
        <Link href="/orders">Orders</Link>
        <Link href="/customers">Customers</Link>
        <Link href="/batch-print">Batch Print</Link>
      </nav>

      <div className="profileWrap">
        <button className="themeToggle" type="button" onClick={toggleDark}>{dark ? 'Light' : 'Dark'}</button>
        <button className="profileButton" type="button" onClick={() => setOpen(v => !v)}>
          {user?.avatar ? <img src={user.avatar} alt="" /> : <span>{firstName[0]}</span>}
        </button>
        {open && (
          <div className="profileMenu card">
            <b>{user?.name || 'Team member'}</b>
            <small>{user?.email || ''}</small>
            <small className="roleTag">{user?.role || 'staff'}</small>
            <form action="/api/auth/logout" method="post" onSubmit={signOut}>
              <button className="btn ghost" type="submit">Sign Out</button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
