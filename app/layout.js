import './globals.css';

export const metadata = {
  title: "Erendira's Boutique Shipping",
  description: "Shipping portal for Erendira's Boutique",
  icons: { icon: '/favicon.png', apple: '/favicon.png' }
};

export const viewport = {
  themeColor: '#f7f4ee'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
