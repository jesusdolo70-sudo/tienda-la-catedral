'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { ShoppingCartIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

function getCategoryEmoji(categoria) {
  const map = { 'Camisetas': '👕', 'Pantalones': '👖', 'Vestidos': '👗', 'Chaquetas': '🧥', 'Sudaderas': '🧸', 'Camisas': '👔' };
  return map[categoria] || '🛍️';
}

export default function ProductoPage() {
  const { id } = useParams();
  const router = useRouter();
  const { agregar } = useCart();
  const { formatPrecio } = useCurrency();

  const [producto, setProducto] = useState(null);
  const [tallaSeleccionada, setTallaSeleccionada] = useState('');
  const [colorSeleccionado, setColorSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    fetch(`/api/productos/${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data || data.error) return;
        const tallas = typeof data.tallas === 'string' ? JSON.parse(data.tallas) : (data.tallas || []);
        const colores = typeof data.colores === 'string' ? JSON.parse(data.colores) : (data.colores || []);
        setProducto({ ...data, tallas, colores });
        if (tallas.length > 0) setTallaSeleccionada(tallas[0]);
        if (colores.length > 0) setColorSeleccionado(colores[0]);
      });
  }, [id]);

  function handleAgregar() {
    if (!tallaSeleccionada || !colorSeleccionado) return;
    agregar(producto, tallaSeleccionada, colorSeleccionado, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2500);
  }

  if (!producto) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#c9a96e', borderTopColor: 'transparent' }} />
    </div>
  );

  const hasImage = producto.imagen && producto.imagen.startsWith('http');

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 font-raleway text-xs tracking-widest uppercase mb-10 transition-colors"
        style={{ color: '#7a6a54' }}
        onMouseEnter={e => e.currentTarget.style.color = '#c9a96e'}
        onMouseLeave={e => e.currentTarget.style.color = '#4a3f2e'}
      >
        <ArrowLeftIcon className="w-4 h-4" /> Volver
      </button>

      <div className="grid md:grid-cols-2 gap-0 overflow-hidden" style={{ border: '1px solid #1a1a1a' }}>
        {/* Imagen */}
        <div
          className="relative flex items-center justify-center overflow-hidden"
          style={{ background: '#0a0a0a', minHeight: '480px' }}
        >
          <div
            className="absolute inset-0 z-10"
            style={{ background: 'radial-gradient(ellipse at center, transparent 55%, #080808 100%)' }}
          />
          {hasImage ? (
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          ) : (
            <span className="text-9xl relative z-10">{getCategoryEmoji(producto.categoria)}</span>
          )}
          {producto.exclusivo ? (
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
              <span className="font-raleway text-xs tracking-[0.35em] uppercase px-3 py-1.5"
                style={{ background: '#080604', border: '1px solid #c9a96e70', color: '#c9a96e' }}>
                ◆ Solo Imperial
              </span>
            </div>
          ) : producto.stock < 5 && producto.stock > 0 && (
            <span className="absolute top-4 left-4 z-20 font-raleway text-xs tracking-[0.3em] uppercase px-3 py-1.5"
              style={{ background: '#c9a96e', color: '#050505', fontWeight: '600' }}>
              Últimas unidades
            </span>
          )}
        </div>

        {/* Detalle */}
        <div
          className="p-10 flex flex-col"
          style={{ background: '#0d0d0d', borderLeft: '1px solid #1a1a1a' }}
        >
          <span className="font-raleway text-xs tracking-[0.35em] uppercase" style={{ color: '#7a6a54' }}>
            {producto.categoria}
          </span>
          <h1 className="font-cormorant text-4xl font-light mt-2 leading-tight" style={{ color: '#f0ead6' }}>
            {producto.nombre}
          </h1>
          <p className="font-raleway text-sm leading-relaxed mt-4" style={{ color: '#7a6a54' }}>
            {producto.descripcion}
          </p>

          {/* Bloque exclusividad */}
          {!!producto.exclusivo && (
            <div className="mt-6 p-4" style={{ border: '1px solid #2a1f0e', background: '#080604' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-px" style={{ background: '#c9a96e' }} />
                <span className="font-raleway text-xs tracking-[0.35em] uppercase" style={{ color: '#c9a96e' }}>
                  Pieza Exclusiva Imperial
                </span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {[
                  `Solo ${producto.stock} unidades en existencia — nunca será reimpresa`,
                  'Número de serie bordado en hilo de seda en el interior del cuello',
                  'Certificado de autenticidad Imperial incluido',
                  'Solo disponible en esta tienda — no se distribuye en ningún otro canal',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span style={{ color: '#c9a96e50', marginTop: '2px' }}>◆</span>
                    <span className="font-raleway text-xs leading-relaxed" style={{ color: '#6b5f3a' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6" style={{ borderTop: '1px solid #1a1a1a', paddingTop: '1.5rem' }}>
            <span className="font-cormorant text-4xl font-light" style={{ color: '#c9a96e' }}>
              {formatPrecio(producto.precio)}
            </span>
            <p className="font-raleway text-xs tracking-wider mt-1" style={{ color: '#3a3228' }}>
              {producto.stock} unidades disponibles
            </p>
          </div>

          {/* Tallas */}
          {producto.tallas.length > 0 && (
            <div className="mt-6">
              <p className="font-raleway text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#7a6a54' }}>Talla</p>
              <div className="flex gap-2 flex-wrap">
                {producto.tallas.map(t => (
                  <button
                    key={t}
                    onClick={() => setTallaSeleccionada(t)}
                    className="px-4 py-2 font-raleway text-xs tracking-wider transition-all"
                    style={tallaSeleccionada === t
                      ? { background: '#c9a96e', color: '#080808', border: '1px solid #c9a96e' }
                      : { background: 'transparent', color: '#6b5f4a', border: '1px solid #2a2416' }
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colores */}
          {producto.colores.length > 0 && (
            <div className="mt-5">
              <p className="font-raleway text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#7a6a54' }}>
                Color: <span style={{ color: '#c9a96e' }}>{colorSeleccionado}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {producto.colores.map(c => (
                  <button
                    key={c}
                    onClick={() => setColorSeleccionado(c)}
                    className="px-3 py-1.5 font-raleway text-xs tracking-wider transition-all"
                    style={colorSeleccionado === c
                      ? { background: '#1a140a', color: '#c9a96e', border: '1px solid #c9a96e' }
                      : { background: 'transparent', color: '#6b5f4a', border: '1px solid #2a2416' }
                    }
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cantidad */}
          <div className="mt-6 flex items-center gap-4">
            <p className="font-raleway text-xs tracking-[0.25em] uppercase" style={{ color: '#7a6a54' }}>Cantidad</p>
            <div className="flex items-center" style={{ border: '1px solid #2a2416' }}>
              <button
                onClick={() => setCantidad(q => Math.max(1, q - 1))}
                className="px-4 py-2 font-bold transition-colors"
                style={{ color: '#6b5f4a', background: '#111' }}
                onMouseEnter={e => e.currentTarget.style.color = '#c9a96e'}
                onMouseLeave={e => e.currentTarget.style.color = '#6b5f4a'}
              >−</button>
              <span className="px-5 py-2 font-raleway text-sm" style={{ color: '#f0ead6', background: '#0d0d0d' }}>{cantidad}</span>
              <button
                onClick={() => setCantidad(q => Math.min(producto.stock, q + 1))}
                className="px-4 py-2 font-bold transition-colors"
                style={{ color: '#6b5f4a', background: '#111' }}
                onMouseEnter={e => e.currentTarget.style.color = '#c9a96e'}
                onMouseLeave={e => e.currentTarget.style.color = '#6b5f4a'}
              >+</button>
            </div>
          </div>

          {/* Botón agregar */}
          <button
            onClick={handleAgregar}
            disabled={agregado || producto.stock === 0}
            className="mt-8 flex items-center justify-center gap-3 py-4 px-6 font-raleway text-xs tracking-[0.35em] uppercase transition-all disabled:opacity-50"
            style={agregado
              ? { background: '#1a2e1a', color: '#4a9a4a', border: '1px solid #2a4a2a' }
              : { background: '#c9a96e', color: '#080808', border: '1px solid #c9a96e' }
            }
            onMouseEnter={e => { if (!agregado && producto.stock > 0) e.currentTarget.style.background = '#b8945a'; }}
            onMouseLeave={e => { if (!agregado && producto.stock > 0) e.currentTarget.style.background = '#c9a96e'; }}
          >
            {agregado ? (
              <><CheckCircleIcon className="w-5 h-5" /> Agregado al carrito</>
            ) : (
              <><ShoppingCartIcon className="w-5 h-5" /> Agregar al carrito</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
