import Link from 'next/link';

export default function Header({ userName = '' }) {
  return (
    <header className="topbar glass">
      <div className="brand">
        <img src="/logo.jpeg" className="brand-mark" alt="Erendira's Boutique" />
        <div>
          <h1>Shipping Studio</h1>
          <p>{userName ? `Welcome, ${userName}` : "Erendira's Boutique"}</p>
        </div>
      </div>

      <nav className="nav">
        <Link href="/">Dashboard</Link>
        <Link href="/create-label">Create Label</Link>
        <Link href="/orders">Orders</Link>
        <Link href="/customers">Customers</Link>
        <Link href="/batch-print">Batch Print</Link>
      </nav>
    </header>
  );
}
