'use client';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useRouter } from 'next/navigation';
import { TrashIcon, ArrowLeftIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

function getCategoryEmoji(categoria) {
  const map = { 'Camisetas': '👕', 'Pantalones': '👖', 'Vestidos': '👗', 'Chaquetas': '🧥', 'Sudaderas': '🧸', 'Camisas': '👔' };
  return map[categoria] || '🛍️';
}

export default function CarritoPage() {
  const { items, quitar, actualizar, total } = useCart();
  const { formatPrecio, monedaInfo } = useCurrency();
  const router = useRouter();

  if (items.length === 0) return (
    <div className="text-center py-20">
      <p className="font-cormorant text-6xl mb-6" style={{ color: '#c9a96e' }}>∅</p>
      <h2 className="font-cormorant text-3xl font-light mb-3" style={{ color: '#f0ead6' }}>Tu carrito está vacío</h2>
      <p className="font-raleway text-xs tracking-widest uppercase mb-10" style={{ color: '#7a6a54' }}>Agrega productos para continuar</p>
      <Link
        href="/"
        className="font-raleway text-xs tracking-[0.3em] uppercase px-8 py-3 transition-colors"
        style={{ border: '1px solid #c9a96e', color: '#c9a96e' }}
      >
        Ver colección
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 font-raleway text-xs tracking-widest uppercase mb-10 transition-colors"
        style={{ color: '#7a6a54' }}
        onMouseEnter={e => e.currentTarget.style.color = '#c9a96e'}
        onMouseLeave={e => e.currentTarget.style.color = '#4a3f2e'}
      >
        <ArrowLeftIcon className="w-4 h-4" /> Seguir comprando
      </button>

      <h1 className="font-cormorant text-4xl font-light tracking-wider mb-10" style={{ color: '#f0ead6' }}>
        Carrito de compras
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div
              key={item.key}
              className="flex gap-4 items-center p-4"
              style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
            >
              <div
                className="text-3xl w-14 h-14 flex items-center justify-center flex-shrink-0"
                style={{ background: '#111', border: '1px solid #1a1a1a' }}
              >
                {getCategoryEmoji(item.categoria)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-cormorant text-lg font-medium truncate" style={{ color: '#f0ead6' }}>{item.nombre}</p>
                <p className="font-raleway text-xs tracking-wider" style={{ color: '#7a6a54' }}>{item.talla} · {item.color}</p>
                <p className="font-cormorant text-lg mt-1" style={{ color: '#c9a96e' }}>{formatPrecio(item.precio)}</p>
              </div>
              <div className="flex items-center" style={{ border: '1px solid #2a2416' }}>
                <button
                  onClick={() => actualizar(item.key, item.cantidad - 1)}
                  className="px-3 py-2 font-bold transition-colors"
                  style={{ color: '#6b5f4a', background: '#111' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#c9a96e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6b5f4a'}
                >−</button>
                <span className="px-3 py-2 font-raleway text-sm" style={{ color: '#f0ead6', background: '#0d0d0d' }}>{item.cantidad}</span>
                <button
                  onClick={() => actualizar(item.key, item.cantidad + 1)}
                  className="px-3 py-2 font-bold transition-colors"
                  style={{ color: '#6b5f4a', background: '#111' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#c9a96e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6b5f4a'}
                >+</button>
              </div>
              <button
                onClick={() => quitar(item.key)}
                className="p-2 transition-colors"
                style={{ color: '#3a2a2a' }}
                onMouseEnter={e => e.currentTarget.style.color = '#c04a4a'}
                onMouseLeave={e => e.currentTarget.style.color = '#3a2a2a'}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="space-y-4">
          <div className="p-6" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-cormorant text-xl font-light" style={{ color: '#f0ead6' }}>Resumen</h3>
              <span className="font-raleway text-xs tracking-wider" style={{ color: '#7a6a54' }}>
                {monedaInfo.flag} {monedaInfo.code}
              </span>
            </div>
            {items.map(item => (
              <div key={item.key} className="flex justify-between mb-2">
                <span className="font-raleway text-xs" style={{ color: '#6b5f4a' }}>{item.nombre} ×{item.cantidad}</span>
                <span className="font-raleway text-xs" style={{ color: '#6b5f4a' }}>{formatPrecio(item.precio * item.cantidad)}</span>
              </div>
            ))}
            <div className="pt-4 mt-4 flex justify-between" style={{ borderTop: '1px solid #1a1a1a' }}>
              <span className="font-raleway text-xs tracking-[0.2em] uppercase" style={{ color: '#f0ead6' }}>Total</span>
              <span className="font-cormorant text-xl" style={{ color: '#c9a96e' }}>{formatPrecio(total)}</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="w-full py-4 font-raleway text-xs tracking-[0.35em] uppercase transition-all flex items-center justify-center gap-3"
            style={{ background: '#c9a96e', color: '#080808' }}
            onMouseEnter={e => e.currentTarget.style.background = '#b8945a'}
            onMouseLeave={e => e.currentTarget.style.background = '#c9a96e'}
          >
            <LockClosedIcon className="w-4 h-4" />
            Ir a pagar
          </button>

          <p className="text-center font-raleway text-xs tracking-wider" style={{ color: '#2a2416' }}>
            Pago 100% seguro · SSL cifrado
          </p>
        </div>
      </div>
    </div>
  );
}
