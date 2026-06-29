import './globals.css';

export const metadata = {
  title: "Erendira's Boutique Shipping Studio",
  description: 'Internal Ship.com label portal for Erendira\'s Boutique'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
