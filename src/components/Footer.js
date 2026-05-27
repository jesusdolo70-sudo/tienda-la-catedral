'use client';
import Link from 'next/link';

const CATEGORIAS = ['Camisetas', 'Pantalones', 'Vestidos', 'Chaquetas', 'Sudaderas', 'Camisas'];

function GoldDivider() {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #c9a96e25)' }} />
      <span style={{ color: '#c9a96e25', fontSize: '8px' }}>◆</span>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #c9a96e25, transparent)' }} />
    </div>
  );
}

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #1a1a1a', background: '#060606' }} className="mt-24">
      <div className="max-w-7xl mx-auto px-8 pt-16 pb-10">

        {/* Logo + tagline */}
        <div className="flex flex-col items-center gap-3 mb-14">
          <p className="gold-shimmer font-cinzel text-3xl tracking-[0.5em] uppercase">
            Imperial
          </p>
          <div className="flex items-center gap-4">
            <div className="w-10 h-px" style={{ background: '#c9a96e25' }} />
            <span className="font-raleway text-xs tracking-[0.4em] uppercase" style={{ color: '#5a4f3a' }}>
              Moda · Exclusividad · Presencia
            </span>
            <div className="w-10 h-px" style={{ background: '#c9a96e25' }} />
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div>
            <p className="font-raleway text-xs tracking-[0.35em] uppercase mb-5" style={{ color: '#c9a96e' }}>
              Colección
            </p>
            <ul className="flex flex-col gap-3">
              {CATEGORIAS.map(cat => (
                <li key={cat}>
                  <Link
                    href={`/?categoria=${cat}`}
                    className="font-raleway text-xs tracking-wider transition-colors"
                    style={{ color: '#5a4f3a' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#c9a96e'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#5a4f3a'; }}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-raleway text-xs tracking-[0.35em] uppercase mb-5" style={{ color: '#c9a96e' }}>
              La Marca
            </p>
            <ul className="flex flex-col gap-3">
              {['Sobre Imperial', 'Sostenibilidad', 'Prensa', 'Carreras'].map(item => (
                <li key={item}>
                  <span className="font-raleway text-xs tracking-wider cursor-default" style={{ color: '#5a4f3a' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-raleway text-xs tracking-[0.35em] uppercase mb-5" style={{ color: '#c9a96e' }}>
              Atención
            </p>
            <ul className="flex flex-col gap-3">
              {['Contacto', 'Envíos y Devoluciones', 'Guía de Tallas', 'Preguntas Frecuentes'].map(item => (
                <li key={item}>
                  <span className="font-raleway text-xs tracking-wider cursor-default" style={{ color: '#5a4f3a' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-raleway text-xs tracking-[0.35em] uppercase mb-5" style={{ color: '#c9a96e' }}>
              Síguenos
            </p>
            <div className="flex flex-col gap-3">
              {['Instagram', 'TikTok', 'Pinterest', 'X (Twitter)'].map(label => (
                <span key={label} className="font-raleway text-xs tracking-wider cursor-default" style={{ color: '#5a4f3a' }}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <GoldDivider />

        {/* Newsletter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-10">
          <div>
            <p className="font-cormorant text-2xl font-light mb-1" style={{ color: '#f0ead6' }}>
              Acceso exclusivo
            </p>
            <p className="font-raleway text-xs tracking-wider" style={{ color: '#5a4f3a' }}>
              Suscríbete y recibe lanzamientos, colecciones privadas y acceso anticipado.
            </p>
          </div>
          <div className="flex w-full md:w-auto">
            <input
              type="email"
              placeholder="tu@email.com"
              className="font-raleway text-xs tracking-wider px-5 py-3.5 focus:outline-none w-full md:w-64 transition-colors"
              style={{ background: '#0d0d0d', border: '1px solid #2a2416', borderRight: 'none', color: '#f0ead6' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#c9a96e40'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#2a2416'; }}
            />
            <button
              className="font-raleway text-xs tracking-[0.25em] uppercase px-6 py-3.5 whitespace-nowrap transition-colors"
              style={{ background: '#c9a96e', color: '#080808' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#b8945a'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#c9a96e'; }}
            >
              Suscribir
            </button>
          </div>
        </div>

        <GoldDivider />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8">
          <p className="font-raleway text-xs tracking-wider" style={{ color: '#3a3228' }}>
            © 2025 Imperial — Todos los derechos reservados
          </p>
          <div className="flex items-center gap-6">
            {['Privacidad', 'Términos', 'Cookies'].map(item => (
              <span
                key={item}
                className="font-raleway text-xs tracking-wider cursor-default"
                style={{ color: '#3a3228' }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
