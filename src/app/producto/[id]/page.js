'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { ShoppingCartIcon, ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

function getCategoryEmoji(categoria) {
  const map = { 'Camisetas': '👕', 'Pantalones': '👖', 'Vestidos': '👗', 'Chaquetas': '🧥', 'Sudaderas': '🧸', 'Camisas': '👔' };
  return map[categoria] || '🛍️';
}

/* ── Galería de imágenes ──────────────────────────────────────────────────── */
function Galeria({ imagenes, nombre }) {
  const [idx, setIdx]   = useState(0);
  const [dir, setDir]   = useState(1); // 1 = derecha, -1 = izquierda

  const ir = useCallback((nuevoIdx) => {
    setDir(nuevoIdx > idx ? 1 : -1);
    setIdx(nuevoIdx);
  }, [idx]);

  const prev = () => ir((idx - 1 + imagenes.length) % imagenes.length);
  const next = () => ir((idx + 1) % imagenes.length);

  // Navegación con teclado
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [idx]);

  const variants = {
    enter: (d) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  if (!imagenes || imagenes.length === 0) return null;

  return (
    <div className="flex gap-0 h-full">
      {/* Miniaturas verticales */}
      {imagenes.length > 1 && (
        <div className="hidden md:flex flex-col gap-2 p-3 overflow-y-auto flex-shrink-0"
          style={{ width: 80, background: '#080808', borderRight: '1px solid #1a1a1a' }}>
          {imagenes.map((src, i) => (
            <button
              key={i}
              onClick={() => ir(i)}
              className="relative flex-shrink-0 overflow-hidden transition-all duration-200"
              style={{
                width: 56, height: 70,
                border: i === idx ? '1px solid #c9a96e' : '1px solid #1e1e1e',
                opacity: i === idx ? 1 : 0.45,
              }}
              onMouseEnter={e => { if (i !== idx) e.currentTarget.style.opacity = 0.8; }}
              onMouseLeave={e => { if (i !== idx) e.currentTarget.style.opacity = 0.45; }}
            >
              <img src={src} alt={`${nombre} ${i + 1}`}
                className="w-full h-full object-cover object-top" />
              {i === idx && (
                <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 0 1px #c9a96e' }} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Imagen principal */}
      <div className="relative flex-1 overflow-hidden" style={{ background: '#0a0a0a', minHeight: 480 }}>
        {/* Gradiente de lujo */}
        <div className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 50%, #080808 100%)' }} />

        <AnimatePresence mode="wait" custom={dir}>
          <motion.img
            key={idx}
            src={imagenes[idx]}
            alt={`${nombre} — foto ${idx + 1}`}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        </AnimatePresence>

        {/* Flechas */}
        {imagenes.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center transition-all"
              style={{ background: '#08080890', border: '1px solid #2a2416' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a96e60'; e.currentTarget.style.background = '#0d0d0d'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2416'; e.currentTarget.style.background = '#08080890'; }}
            >
              <ChevronLeftIcon className="w-4 h-4" style={{ color: '#c9a96e' }} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center transition-all"
              style={{ background: '#08080890', border: '1px solid #2a2416' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a96e60'; e.currentTarget.style.background = '#0d0d0d'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2416'; e.currentTarget.style.background = '#08080890'; }}
            >
              <ChevronRightIcon className="w-4 h-4" style={{ color: '#c9a96e' }} />
            </button>
          </>
        )}

        {/* Puntos indicadores (móvil) */}
        {imagenes.length > 1 && (
          <div className="md:hidden absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
            {imagenes.map((_, i) => (
              <button
                key={i}
                onClick={() => ir(i)}
                className="transition-all duration-200"
                style={{
                  width: i === idx ? 20 : 6,
                  height: 6,
                  background: i === idx ? '#c9a96e' : '#3a3228',
                  borderRadius: 3,
                }}
              />
            ))}
          </div>
        )}

        {/* Contador */}
        {imagenes.length > 1 && (
          <div className="absolute bottom-4 right-4 z-20 font-raleway text-xs tracking-wider"
            style={{ color: '#4a3f2e' }}>
            {idx + 1} / {imagenes.length}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Página de producto ───────────────────────────────────────────────────── */
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
        const tallas   = typeof data.tallas   === 'string' ? JSON.parse(data.tallas)   : (data.tallas   || []);
        const colores  = typeof data.colores  === 'string' ? JSON.parse(data.colores)  : (data.colores  || []);
        const imagenes = Array.isArray(data.imagenes) ? data.imagenes
          : typeof data.imagenes === 'string' ? JSON.parse(data.imagenes || '[]') : [];
        setProducto({ ...data, tallas, colores, imagenes });
        if (tallas.length > 0)  setTallaSeleccionada(tallas[0]);
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
      <div className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: '#c9a96e', borderTopColor: 'transparent' }} />
    </div>
  );

  // Construir array de imágenes para la galería
  const galeriaImagenes = producto.imagenes?.length
    ? producto.imagenes
    : producto.imagen?.startsWith('http') ? [producto.imagen] : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 font-raleway text-xs tracking-widest uppercase mb-10 transition-colors"
        style={{ color: '#7a6a54' }}
        onMouseEnter={e => e.currentTarget.style.color = '#c9a96e'}
        onMouseLeave={e => e.currentTarget.style.color = '#7a6a54'}
      >
        <ArrowLeftIcon className="w-4 h-4" /> Volver
      </button>

      <div className="grid md:grid-cols-2 gap-0 overflow-hidden" style={{ border: '1px solid #1a1a1a' }}>

        {/* ── Galería ── */}
        <div className="relative overflow-hidden" style={{ minHeight: 480 }}>
          {galeriaImagenes.length > 0 ? (
            <Galeria imagenes={galeriaImagenes} nombre={producto.nombre} />
          ) : (
            <div className="flex items-center justify-center h-full" style={{ background: '#0a0a0a', minHeight: 480 }}>
              <span className="text-9xl">{getCategoryEmoji(producto.categoria)}</span>
            </div>
          )}

          {/* Badges */}
          {producto.exclusivo ? (
            <div className="absolute top-4 left-[84px] md:left-[88px] z-30">
              <span className="font-raleway text-xs tracking-[0.35em] uppercase px-3 py-1.5"
                style={{ background: '#080604', border: '1px solid #c9a96e70', color: '#c9a96e' }}>
                ◆ Solo Imperial
              </span>
            </div>
          ) : producto.stock < 5 && producto.stock > 0 && (
            <span className="absolute top-4 left-[84px] md:left-[88px] z-30 font-raleway text-xs tracking-[0.3em] uppercase px-3 py-1.5"
              style={{ background: '#c9a96e', color: '#050505', fontWeight: '600' }}>
              Últimas unidades
            </span>
          )}
        </div>

        {/* ── Detalle ── */}
        <div className="p-10 flex flex-col" style={{ background: '#0d0d0d', borderLeft: '1px solid #1a1a1a' }}>
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
                      : { background: 'transparent', color: '#6b5f4a', border: '1px solid #2a2416' }}
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
                      : { background: 'transparent', color: '#6b5f4a', border: '1px solid #2a2416' }}
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
              : { background: '#c9a96e', color: '#080808', border: '1px solid #c9a96e' }}
            onMouseEnter={e => { if (!agregado && producto.stock > 0) e.currentTarget.style.background = '#b8945a'; }}
            onMouseLeave={e => { if (!agregado && producto.stock > 0) e.currentTarget.style.background = '#c9a96e'; }}
          >
            {agregado
              ? <><CheckCircleIcon className="w-5 h-5" /> Agregado al carrito</>
              : <><ShoppingCartIcon className="w-5 h-5" /> Agregar al carrito</>}
          </button>
        </div>
      </div>
    </div>
  );
}
