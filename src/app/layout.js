import { CartProvider } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import Navbar from '@/components/Navbar';
import PageTransition from '@/components/PageTransition';
import { Cormorant_Garamond, Raleway } from 'next/font/google';
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

export const metadata = {
  title: 'La Catedral — Moda de Autor',
  description: 'Prendas para quienes definen el lujo con su presencia.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${raleway.variable}`}>
      <body style={{ background: '#050505' }}>
        <CurrencyProvider>
          <CartProvider>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-10">
              <PageTransition>{children}</PageTransition>
            </main>

            {/* Footer de lujo */}
            <footer style={{ borderTop: '1px solid #1e1e1e', background: '#080808' }} className="mt-20 py-14">
              <div className="max-w-7xl mx-auto px-8 flex flex-col items-center gap-6">
                <p className="gold-shimmer font-cormorant text-3xl font-light tracking-[0.4em] uppercase">
                  La Catedral
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px" style={{ background: '#c9a96e40' }} />
                  <span className="text-xs font-raleway tracking-[0.35em] uppercase" style={{ color: '#7a5f32' }}>
                    Moda · Exclusividad · Presencia
                  </span>
                  <div className="w-8 h-px" style={{ background: '#c9a96e40' }} />
                </div>
                <p className="font-raleway text-xs tracking-widest uppercase" style={{ color: '#3a3228' }}>
                  © 2025 La Catedral — Todos los derechos reservados
                </p>
              </div>
            </footer>
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
