import './globals.css';

export const metadata = {
  title: "Erendira's Boutique Shipping Portal",
  description: "Internal shipping portal for Erendira's Boutique",
  icons: { icon: '/icon.png', apple: '/icon.png' }
};

export const viewport = {
  themeColor: '#f7f4ee'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
