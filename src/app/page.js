'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import CategoryScreen from '@/components/CategoryScreen';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIAS = [
  { nombre: 'Camisetas',  emoji: '👕', sub: 'Básicos de autor' },
  { nombre: 'Pantalones', emoji: '👖', sub: 'Siluetas de precisión' },
  { nombre: 'Vestidos',   emoji: '👗', sub: 'Elegancia sin límites' },
  { nombre: 'Chaquetas',  emoji: '🧥', sub: 'Capas con carácter' },
  { nombre: 'Sudaderas',  emoji: '🧸', sub: 'Confort de autor' },
  { nombre: 'Camisas',    emoji: '👔', sub: 'Formalidad redefinida' },
];

// Divisor ornamental dorado
function GoldDivider({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #c9a96e40)' }} />
      <span style={{ color: '#c9a96e50', fontSize: '8px' }}>◆</span>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #c9a96e40, transparent)' }} />
    </div>
  );
}

function Catalogo() {
  const searchParams = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [cargando, setCargando] = useState(true);
  const [categoriaAbierta, setCategoriaAbierta] = useState(null);

  useEffect(() => {
    const cat = searchParams.get('categoria');
    if (cat) setCategoriaAbierta(cat);
  }, [searchParams]);

  useEffect(() => {
    setCargando(true);
    const params = new URLSearchParams();
    if (buscar) params.set('buscar', buscar);
    fetch(`/api/productos?${params}`)
      .then(r => r.json())
      .then(data => { setProductos(data); setCargando(false); });
  }, [buscar]);

  return (
    <>
      <AnimatePresence>
        {categoriaAbierta && (
          <CategoryScreen categoria={categoriaAbierta} onClose={() => setCategoriaAbierta(null)} />
        )}
      </AnimatePresence>

      {/* ══ HERO ══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden mb-20" style={{ minHeight: '88vh' }}>
        {/* Fondo con viñeta */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #1a1208 0%, #050505 70%)',
        }} />
        {/* Líneas de perspectiva decorativas */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #c9a96e 0px, transparent 1px, transparent 80px)',
        }} />

        {/* Texto watermark enorme */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-cormorant font-bold" style={{
            fontSize: 'clamp(200px, 35vw, 500px)',
            color: '#c9a96e',
            opacity: 0.025,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}>
            I
          </span>
        </div>

        {/* Contenido hero */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 min-h-[88vh]">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="w-8 h-px" style={{ background: '#c9a96e60' }} />
            <span className="font-raleway text-xs tracking-[0.45em] uppercase" style={{ color: '#c9a96e' }}>
              Nueva Colección · 2025
            </span>
            <div className="w-8 h-px" style={{ background: '#c9a96e60' }} />
          </motion.div>

          {/* Nombre principal */}
          <div className="overflow-hidden mb-4">
            <motion.h1
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              transition={{ delay: 0.18, duration: 1, ease: [0.76, 0, 0.24, 1] }}
              className="font-cormorant font-light leading-none"
              style={{ fontSize: 'clamp(64px, 12vw, 160px)', color: '#f0ead6', letterSpacing: '0.05em' }}
            >
              Imperial
            </motion.h1>
          </div>

          {/* Línea dorada animada */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.65, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 origin-center"
            style={{ height: '1px', width: '160px', background: 'linear-gradient(90deg, transparent, #c9a96e, transparent)' }}
          />

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-cormorant text-2xl md:text-3xl font-light italic mb-12 max-w-xl leading-relaxed"
            style={{ color: '#8a7a60' }}
          >
            Prendas para quienes definen<br />el lujo con su presencia.
          </motion.p>

          {/* Botones CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-wrap gap-4 justify-center mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('coleccion')?.scrollIntoView({ behavior: 'smooth' })}
              className="font-raleway text-xs tracking-[0.3em] uppercase px-10 py-4"
              style={{ background: '#c9a96e', color: '#050505', fontWeight: '600' }}
            >
              Explorar Colección
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, background: '#c9a96e10' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCategoriaAbierta('Vestidos')}
              className="font-raleway text-xs tracking-[0.3em] uppercase px-10 py-4"
              style={{ border: '1px solid #c9a96e40', color: '#c9a96e' }}
            >
              Ver Tendencias
            </motion.button>
          </motion.div>

          {/* Stats dorados */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex items-center gap-8 md:gap-14"
          >
            {[
              { num: '+200', label: 'Prendas' },
              { num: '15',   label: 'Países' },
              { num: '100%', label: 'Exclusivo' },
            ].map(({ num, label }, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="font-cormorant text-3xl font-light" style={{ color: '#c9a96e' }}>{num}</span>
                <span className="font-raleway text-xs tracking-[0.3em] uppercase" style={{ color: '#4a3f2e' }}>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Flecha de scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ delay: 1.5, duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-raleway text-xs tracking-[0.3em] uppercase" style={{ color: '#4a3f2e' }}>Descubrir</span>
          <div className="w-px h-8" style={{ background: 'linear-gradient(to bottom, #c9a96e60, transparent)' }} />
        </motion.div>
      </section>

      {/* ══ CATEGORÍAS ════════════════════════════════════════════════════════════ */}
      <section className="mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-6 mb-10"
        >
          <div className="w-6 h-px" style={{ background: '#c9a96e' }} />
          <h2 className="font-cormorant text-4xl font-light" style={{ color: '#f0ead6' }}>Categorías</h2>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #c9a96e20, transparent)' }} />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIAS.map(({ nombre, emoji, sub }, i) => (
            <motion.button
              key={nombre}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCategoriaAbierta(nombre)}
              className="group relative flex flex-col items-center gap-3 py-8 px-4 overflow-hidden"
              style={{ background: '#0d0d0d', border: '1px solid #1e1e1e' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a96e40'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; }}
            >
              {/* Brillo en hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'radial-gradient(circle at 50% 0%, #c9a96e08, transparent 70%)' }}
              />
              {/* Línea superior dorada */}
              <div className="absolute top-0 left-0 right-0 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                style={{ background: '#c9a96e' }}
              />
              <span className="text-3xl relative z-10">{emoji}</span>
              <div className="relative z-10 text-center">
                <p className="font-raleway text-xs tracking-[0.2em] uppercase font-medium transition-colors duration-300"
                  style={{ color: '#6b5f4a' }}
                >
                  {nombre}
                </p>
                <p className="font-cormorant text-xs italic mt-0.5 transition-colors duration-300"
                  style={{ color: '#3a3228' }}
                >
                  {sub}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ══ COLECCIÓN COMPLETA ════════════════════════════════════════════════════ */}
      <section id="coleccion">
        {/* Cabecera */}
        <div className="flex items-center gap-6 mb-10">
          <div className="w-6 h-px" style={{ background: '#c9a96e' }} />
          <h2 className="font-cormorant text-4xl font-light" style={{ color: '#f0ead6' }}>Toda la Colección</h2>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #c9a96e20, transparent)' }} />
        </div>

        {/* Buscador oscuro */}
        <div className="relative mb-10 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#4a3f2e' }} />
          <input
            type="text"
            placeholder="Buscar prendas..."
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
            className="w-full font-raleway text-sm tracking-wide pl-10 pr-4 py-3.5 focus:outline-none transition-colors"
            style={{
              background: '#0d0d0d',
              border: '1px solid #1e1e1e',
              color: '#f0ead6',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#c9a96e40'}
            onBlur={e => e.currentTarget.style.borderColor = '#1e1e1e'}
          />
        </div>

        {/* Grid de productos */}
        {cargando ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 animate-pulse" style={{ background: '#0d0d0d', border: '1px solid #141414' }} />
            ))}
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-cormorant text-5xl mb-3" style={{ color: '#3a3228' }}>∅</p>
            <p className="font-raleway text-xs tracking-widest uppercase" style={{ color: '#4a3f2e' }}>No se encontraron prendas</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ border: '1px solid #1a1a1a' }}>
            {productos.map((p, i) => (
              <div key={p.id} style={{ borderRight: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
                <ProductCard producto={p} index={i} />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <p className="font-raleway text-xs tracking-widest uppercase" style={{ color: '#4a3f2e' }}>Cargando...</p>
      </div>
    }>
      <Catalogo />
    </Suspense>
  );
}
