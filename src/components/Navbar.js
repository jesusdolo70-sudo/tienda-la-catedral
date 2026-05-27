'use client';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import CurrencySelector from '@/components/CurrencySelector';

const LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/?categoria=Camisetas', label: 'Camisetas' },
  { href: '/?categoria=Pantalones', label: 'Pantalones' },
  { href: '/?categoria=Vestidos', label: 'Vestidos' },
  { href: '/?categoria=Chaquetas', label: 'Chaquetas' },
];

export default function Navbar() {
  const { cantidad } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  function handleNavClick(e, href) {
    // Si ya estamos en esa ruta, hacer scroll al tope en vez de ignorar el clic
    if (href === '/' && pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <nav style={{ background: '#080808', borderBottom: '1px solid #1a1a1a' }} className="sticky top-0 z-50">
      {/* Ticker dorado superior */}
      <div style={{ background: '#0d0a04', borderBottom: '1px solid #2a2416' }} className="overflow-hidden py-1.5">
        <div className="marquee-track">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="font-raleway text-xs tracking-[0.35em] uppercase mx-8" style={{ color: '#7a5f32' }}>
              Imperial &nbsp;·&nbsp; Nueva Colección 2025 &nbsp;·&nbsp; Envío Internacional &nbsp;·&nbsp; Exclusividad Garantizada &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        {/* Logo con shimmer dorado */}
        <Link href="/" className="gold-shimmer font-cinzel text-xl tracking-[0.35em] uppercase">
          Imperial
        </Link>

        {/* Navegación */}
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={e => handleNavClick(e, href)}
              className="font-raleway text-xs font-medium tracking-[0.2em] uppercase relative group"
              style={{ color: '#6b5f4a' }}
              onMouseEnter={e => e.currentTarget.style.color = '#c9a96e'}
              onMouseLeave={e => e.currentTarget.style.color = '#6b5f4a'}
            >
              {label}
              <span
                className="absolute -bottom-1 left-0 w-0 group-hover:w-full transition-all duration-300 h-px"
                style={{ background: '#c9a96e' }}
              />
            </Link>
          ))}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          <CurrencySelector />
          <Link href="/carrito" className="relative group">
            <ShoppingCartIcon className="w-5 h-5 transition-colors" style={{ color: '#6b5f4a' }}
              onMouseEnter={e => e.currentTarget.style.color = '#c9a96e'}
              onMouseLeave={e => e.currentTarget.style.color = '#6b5f4a'}
            />
            {cantidad > 0 && (
              <span
                className="absolute -top-2 -right-2 text-xs rounded-full w-4 h-4 flex items-center justify-center font-raleway font-semibold leading-none"
                style={{ background: '#c9a96e', color: '#080808' }}
              >
                {cantidad}
              </span>
            )}
          </Link>
          <Link href="/admin"
            className="hidden md:block font-raleway text-xs tracking-widest uppercase transition-colors"
            style={{ color: '#3a3228' }}
            onMouseEnter={e => e.currentTarget.style.color = '#c9a96e'}
            onMouseLeave={e => e.currentTarget.style.color = '#3a3228'}
          >
            Admin
          </Link>
          <button className="md:hidden" style={{ color: '#6b5f4a' }} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <div style={{ background: '#080808', borderTop: '1px solid #1a1a1a' }} className="md:hidden px-6 py-5 flex flex-col gap-4">
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={e => { handleNavClick(e, href); setMenuOpen(false); }}
              className="font-raleway text-xs tracking-[0.25em] uppercase"
              style={{ color: '#6b5f4a' }}
            >
              {label}
            </Link>
          ))}
          <Link href="/admin" onClick={() => setMenuOpen(false)}
            className="font-raleway text-xs tracking-widest uppercase"
            style={{ color: '#3a3228' }}
          >
            Admin
          </Link>
        </div>
      )}
    </nav>
  );
}
