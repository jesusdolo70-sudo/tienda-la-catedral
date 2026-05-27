import { CartProvider } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { Cormorant_Garamond, Raleway, Cinzel } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-raleway',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});

export const metadata = {
  title: 'Imperial — Moda de Autor',
  description: 'Prendas para quienes definen el lujo con su presencia.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${raleway.variable} ${cinzel.variable}`}>
      <body style={{ background: '#050505' }}>
        <CurrencyProvider>
          <CartProvider>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-10">
              <PageTransition>{children}</PageTransition>
            </main>

            <Footer />
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
