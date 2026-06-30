'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabaseClient } from '@/lib/supabaseClient';

function readUserCookie() {
  if (typeof document === 'undefined') return null;
  const raw = document.cookie.split('; ').find(x => x.startsWith('eb_shipping_user='));
  if (!raw) return null;
  try { return JSON.parse(decodeURIComponent(raw.split('=').slice(1).join('='))); } catch { return null; }
}

const links = [
  { href: '/', label: 'Dashboard', icon: '⌂' },
  { href: '/create-label', label: 'Create Label', icon: '✦' },
  { href: '/orders', label: 'Orders', icon: '□' },
  { href: '/customers', label: 'Customers', icon: '◇' },
  { href: '/batch-print', label: 'Batch Print', icon: '◐' }
];

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const storedDark = localStorage.getItem('eb_dark') === 'true';
    setDark(storedDark);
    document.documentElement.classList.toggle('dark', storedDark);

    const cookieUser = readUserCookie();
    if (cookieUser) setUser(cookieUser);

    async function loadUser() {
      if (!supabaseClient) return;
      const { data } = await supabaseClient.auth.getUser();
      const u = data?.user;
      if (u) {
        setUser({
          email: u.email,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0],
          avatar: u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
          role: cookieUser?.role || 'Shipping Team'
        });
      }
    }

    loadUser();
    if (!supabaseClient) return;
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(() => loadUser());
    return () => subscription.unsubscribe();
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    localStorage.setItem('eb_dark', String(next));
    document.documentElement.classList.toggle('dark', next);
  }

  async function signOut() {
    try {
      await supabaseClient?.auth.signOut();
      await fetch('/api/auth/logout', { method: 'POST' });
      document.cookie = 'eb_shipping_user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.replace('/login');
    } catch (err) {
      console.error(err);
      alert('Unable to sign out.');
    }
  }

  const firstName = (user?.name || 'Team').split(' ')[0];

  return (
    <aside className="topbar sidebarCard">
      <div className="sidebarBrand">
        <img src="/logo.jpeg" className="brand-mark" alt="Erendira's Boutique" />
        <div className="brandCopy">
          <p className="eyebrow">Erendira&apos;s Boutique</p>
          <h1>Shipping Studio</h1>
          <p>Welcome, {firstName}</p>
        </div>
      </div>

      <div className="green-divider" />

      <nav className="nav sidebarNav">
        {links.map(link => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={active ? 'active' : ''}>
              <span className="navIcon">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebarNote">
        <b>Quick tip</b>
        <span>Purchased labels are saved automatically and can be printed from Batch Print.</span>
      </div>

      <div className="profileWrap sidebarProfile">
        <button className="themeToggle" type="button" onClick={toggleDark}>{dark ? 'Light Mode' : 'Dark Mode'}</button>
        <button className="profileButton profileWide" type="button" onClick={() => setOpen(v => !v)}>
          {user?.avatar ? <img src={user.avatar} alt={firstName} /> : <span>{firstName.charAt(0)}</span>}
          <small>{user?.email || 'Signed in'}</small>
        </button>
        {open && (
          <div className="profileMenu card">
            <b>{user?.name || 'Team member'}</b>
            <small>{user?.email || ''}</small>
            <small className="roleTag">{user?.role || 'Shipping Team'}</small>
            <hr />
            <button className="btn ghost" type="button" onClick={signOut}>Sign Out</button>
          </div>
        )}
      </div>
    </aside>
  );
}
