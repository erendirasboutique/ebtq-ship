import './globals.css';
export const metadata = {
  title: "Shipping Portal | Erendira's Boutique",
  description: "EBTQ Shipping Portal",

  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png"
  }
}
export default function RootLayout({children}){return <html lang="en"><body>{children}</body></html>}
