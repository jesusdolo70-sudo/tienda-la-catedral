'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import CategoryScreen from '@/components/CategoryScreen';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Datos de categorías con foto ─────────────────────────────────────────────
const CATEGORIAS = [
  { nombre: 'Camisetas',  sub: 'Básicos de autor',         img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop&q=80' },
  { nombre: 'Pantalones', sub: 'Siluetas de precisión',    img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop&q=80' },
  { nombre: 'Vestidos',   sub: 'Elegancia sin límites',    img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop&q=80' },
  { nombre: 'Chaquetas',  sub: 'Capas con carácter',       img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop&q=80' },
  { nombre: 'Sudaderas',  sub: 'Confort de autor',         img: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=800&fit=crop&q=80' },
  { nombre: 'Camisas',    sub: 'Formalidad redefinida',    img: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&h=800&fit=crop&q=80' },
];

const CATEGORIAS_FILTRO = ['Todas', 'Camisetas', 'Pantalones', 'Vestidos', 'Chaquetas', 'Sudaderas', 'Camisas'];

// ── Ticker dorado ─────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  'Moda de Autor', '✦', 'Piezas Únicas', '✦', 'Calidad Premium',
  '✦', 'Diseño Editorial', '✦', 'Solo en Imperial', '✦',
  'Nueva Colección 2025', '✦', 'Hecho a Medida', '✦',
];

function Ticker({ invertido = false }) {
  const texto = [...TICKER_ITEMS, ...TICKER_ITEMS].join('  ');
  return (
    <div className="overflow-hidden py-3" style={{
      background: invertido ? '#c9a96e' : '#0a0800',
      borderTop: `1px solid ${invertido ? 'transparent' : '#c9a96e15'}`,
      borderBottom: `1px solid ${invertido ? 'transparent' : '#c9a96e15'}`,
    }}>
      <div className="marquee-track">
        {[...Array(4)].map((_, i) => (
          <span key={i} className="font-raleway text-xs tracking-[0.35em] uppercase mr-16"
            style={{ color: invertido ? '#050505' : '#c9a96e', whiteSpace: 'nowrap' }}>
            {TICKER_ITEMS.join('   ·   ')}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Divisor ornamental ────────────────────────────────────────────────────────
function GoldDivider({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #c9a96e40)' }} />
      <span style={{ color: '#c9a96e50', fontSize: '8px' }}>◆</span>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #c9a96e40, transparent)' }} />
    </div>
  );
}

// ── Sección exclusivos ────────────────────────────────────────────────────────
function ExclusivosSection() {
  const [exclusivos, setExclusivos] = useState([]);

  useEffect(() => {
    fetch('/api/productos?exclusivo=1')
      .then(r => r.json())
      .then(data => setExclusivos(Array.isArray(data) ? data.filter(p => p.exclusivo) : []));
  }, []);

  if (!exclusivos.length) return null;

  return (
    <section className="mb-24">
      {/* Cabecera */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-14"
      >
        <p className="font-raleway text-xs tracking-[0.45em] uppercase mb-4" style={{ color: '#c9a96e' }}>
          — Exclusivo —
        </p>
        <h2 className="font-cormorant text-5xl md:text-6xl font-light mb-4" style={{ color: '#f0ead6' }}>
          Piezas Únicas
        </h2>
        <p className="font-cormorant text-xl italic" style={{ color: '#7a6a54' }}>
          Solo en Imperial. No se distribuye en ningún otro canal.
        </p>
      </motion.div>

      {/* Cards con marco dorado */}
      <div className="relative p-px" style={{
        background: 'linear-gradient(135deg, #c9a96e40, #c9a96e10 40%, transparent 60%)',
        borderRadius: 2,
      }}>
        <div className="p-8" style={{ background: '#060504' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {exclusivos.map((p, i) => (
              <ProductCard key={p.id} producto={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Catálogo + Hero principal ─────────────────────────────────────────────────
function Catalogo() {
  const searchParams = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState(null);
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
    if (categoriaFiltro) params.set('categoria', categoriaFiltro);
    fetch(`/api/productos?${params}`)
      .then(r => r.json())
      .then(data => { setProductos(data); setCargando(false); });
  }, [buscar, categoriaFiltro]);

  return (
    <>
      <AnimatePresence>
        {categoriaAbierta && (
          <CategoryScreen categoria={categoriaAbierta} onClose={() => setCategoriaAbierta(null)} />
        )}
      </AnimatePresence>

      {/* ══ HERO ══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden mb-0" style={{ minHeight: '95vh' }}>

        {/* Fondo oscuro con vignette */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 90% at 30% 50%, #140e04 0%, #050505 70%)',
        }} />

        {/* Imagen editorial a la derecha */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
          {/* Imagen */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&h=1200&fit=crop&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }} />
          {/* Gradiente sobre la imagen */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(90deg, #050505 0%, #05050580 30%, transparent 60%)',
          }} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(0deg, #050505 0%, transparent 20%, transparent 80%, #050505 100%)',
          }} />
          {/* Overlay oscuro sutil */}
          <div className="absolute inset-0" style={{ background: '#05050530' }} />
        </div>

        {/* Grain sutil */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
        }} />

        {/* Watermark I */}
        <div className="absolute inset-0 flex items-center justify-start pointer-events-none select-none overflow-hidden lg:justify-start justify-center">
          <span className="font-cormorant font-bold ml-8" style={{
            fontSize: 'clamp(180px, 28vw, 460px)',
            color: '#c9a96e',
            opacity: 0.022,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}>
            I
          </span>
        </div>

        {/* Contenido — columna izquierda */}
        <div className="relative z-10 flex flex-col justify-center px-6 md:px-12 lg:px-16 min-h-[95vh] lg:max-w-[55%]">

          {/* Número de colección */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="flex items-center gap-4 mb-10"
          >
            <div className="w-10 h-px" style={{ background: '#c9a96e' }} />
            <span className="font-raleway text-xs tracking-[0.5em] uppercase" style={{ color: '#c9a96e' }}>
              SS · 2025 · Vol. I
            </span>
          </motion.div>

          {/* Título principal */}
          <div className="overflow-hidden mb-2">
            <motion.h1
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ delay: 0.2, duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
              className="font-cinzel leading-none"
              style={{
                fontSize: 'clamp(56px, 9vw, 130px)',
                color: '#f0ead6',
                letterSpacing: '0.1em',
                fontWeight: '400',
              }}
            >
              Imperial
            </motion.h1>
          </div>

          {/* Línea dorada */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.75, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 origin-left"
            style={{ height: '1px', width: '200px', background: 'linear-gradient(90deg, #c9a96e, transparent)' }}
          />

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="font-cormorant text-2xl md:text-3xl font-light italic mb-3 leading-snug max-w-md"
            style={{ color: '#9a8a6a' }}
          >
            Prendas para quienes definen<br />el lujo con su presencia.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.7 }}
            className="font-raleway text-xs tracking-[0.25em] uppercase mb-12"
            style={{ color: '#4a3f2e' }}
          >
            Diseño colombiano · Fabricación artesanal
          </motion.p>

          {/* Botones CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-wrap gap-4 mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('coleccion')?.scrollIntoView({ behavior: 'smooth' })}
              className="font-raleway text-xs tracking-[0.35em] uppercase px-10 py-4"
              style={{ background: '#c9a96e', color: '#050505', fontWeight: '600' }}
            >
              Explorar Colección
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('categorias')?.scrollIntoView({ behavior: 'smooth' })}
              className="font-raleway text-xs tracking-[0.35em] uppercase px-10 py-4"
              style={{ border: '1px solid #c9a96e50', color: '#c9a96e', background: 'transparent' }}
            >
              Ver Categorías
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="flex items-center gap-10"
          >
            {[
              { num: '+200', label: 'Prendas' },
              { num: '6',    label: 'Categorías' },
              { num: '100%', label: 'Exclusivo' },
            ].map(({ num, label }, i) => (
              <div key={i} className="flex flex-col gap-1">
                <span className="font-cormorant text-3xl font-light" style={{ color: '#c9a96e' }}>{num}</span>
                <span className="font-raleway text-xs tracking-[0.3em] uppercase" style={{ color: '#4a3f2e' }}>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Etiqueta lateral derecha (solo desktop) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-3 z-20"
        >
          <div className="w-px h-16" style={{ background: 'linear-gradient(to bottom, transparent, #c9a96e60)' }} />
          <span className="font-raleway text-xs tracking-[0.4em] uppercase"
            style={{ color: '#c9a96e80', writingMode: 'vertical-rl', letterSpacing: '0.3em' }}>
            Nueva Temporada
          </span>
          <div className="w-px h-16" style={{ background: 'linear-gradient(to bottom, #c9a96e60, transparent)' }} />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.4] }}
          transition={{ delay: 1.8, duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-8 flex items-center gap-3 z-10"
        >
          <div className="w-px h-10" style={{ background: 'linear-gradient(to bottom, #c9a96e60, transparent)' }} />
          <span className="font-raleway text-xs tracking-[0.35em] uppercase" style={{ color: '#6b5f4a' }}>Scroll</span>
        </motion.div>
      </section>

      {/* ══ TICKER ═══════════════════════════════════════════════════════════════ */}
      <Ticker />

      {/* ══ PIEZAS ÚNICAS ════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 pt-24">
        <ExclusivosSection />
      </div>

      {/* ══ CATEGORÍAS ════════════════════════════════════════════════════════════ */}
      <section className="mb-0 py-24" id="categorias" style={{ background: '#050505' }}>
        <div className="max-w-7xl mx-auto px-4">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="font-raleway text-xs tracking-[0.45em] uppercase mb-4" style={{ color: '#c9a96e' }}>
              — Explorar —
            </p>
            <h2 className="font-cormorant text-5xl md:text-6xl font-light" style={{ color: '#f0ead6' }}>
              Categorías
            </h2>
          </motion.div>

          {/* Grid de categorías con fotos */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORIAS.map(({ nombre, sub, img }, i) => (
              <motion.button
                key={nombre}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover="hover"
                onClick={() => setCategoriaAbierta(nombre)}
                className="group relative overflow-hidden text-left"
                style={{ aspectRatio: '3/4', maxHeight: 480 }}
              >
                {/* Imagen de fondo */}
                <motion.div
                  className="absolute inset-0"
                  variants={{ hover: { scale: 1.07 } }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    backgroundImage: `url(${img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />

                {/* Overlay degradado */}
                <div className="absolute inset-0 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(0deg, #050505 0%, #05050570 40%, transparent 70%)' }}
                />
                <motion.div
                  className="absolute inset-0"
                  variants={{ hover: { opacity: 1 } }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ background: 'linear-gradient(0deg, #050505 10%, #05050560 50%, #c9a96e10 100%)' }}
                />

                {/* Borde dorado top al hacer hover */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  variants={{ hover: { scaleX: 1 } }}
                  initial={{ scaleX: 0 }}
                  style={{ background: '#c9a96e', transformOrigin: 'left' }}
                  transition={{ duration: 0.4 }}
                />

                {/* Contenido */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <motion.div
                    variants={{ hover: { y: -4 } }}
                    transition={{ duration: 0.35 }}
                  >
                    <p className="font-cormorant text-2xl md:text-3xl font-light mb-1" style={{ color: '#f0ead6' }}>
                      {nombre}
                    </p>
                    <p className="font-raleway text-xs tracking-[0.2em] uppercase" style={{ color: '#c9a96e80' }}>
                      {sub}
                    </p>
                  </motion.div>

                  {/* Ver colección — aparece en hover */}
                  <motion.div
                    variants={{ hover: { opacity: 1, y: 0 } }}
                    initial={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="flex items-center gap-2 mt-3"
                  >
                    <span className="font-raleway text-xs tracking-[0.25em] uppercase" style={{ color: '#c9a96e' }}>
                      Ver colección
                    </span>
                    <div className="flex-1 h-px" style={{ background: '#c9a96e50' }} />
                  </motion.div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TICKER INVERTIDO ═════════════════════════════════════════════════════ */}
      <Ticker invertido />

      {/* ══ MANIFIESTO ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6" style={{
        background: 'linear-gradient(180deg, #050505 0%, #0a0800 50%, #050505 100%)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="font-raleway text-xs tracking-[0.5em] uppercase mb-10" style={{ color: '#c9a96e60' }}>
            Manifiesto
          </p>
          <p className="font-cormorant leading-relaxed mb-8"
            style={{ fontSize: 'clamp(22px, 3.5vw, 38px)', color: '#c0b090', fontStyle: 'italic', fontWeight: 300 }}
          >
            "No fabricamos ropa.<br />
            Creamos piezas que cuentan la historia<br />
            de quienes las eligen."
          </p>
          <GoldDivider className="max-w-xs mx-auto mb-8" />
          <p className="font-raleway text-sm leading-loose" style={{ color: '#4a3f2e' }}>
            Cada prenda Imperial nace de la convicción de que el lujo verdadero<br />
            no grita — susurra. Materiales excepcionales, cortes que perduran,<br />
            piezas que se vuelven parte de ti.
          </p>
        </motion.div>
      </section>

      {/* ══ COLECCIÓN COMPLETA ════════════════════════════════════════════════════ */}
      <section id="coleccion" className="py-20 px-4 max-w-7xl mx-auto">

        {/* Cabecera */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="font-raleway text-xs tracking-[0.45em] uppercase mb-4" style={{ color: '#c9a96e' }}>
            — Catálogo —
          </p>
          <h2 className="font-cormorant text-5xl md:text-6xl font-light mb-4" style={{ color: '#f0ead6' }}>
            Toda la Colección
          </h2>
        </motion.div>

        {/* Filtros + buscador */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-10">
          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIAS_FILTRO.map(cat => {
              const activo = (cat === 'Todas' && !categoriaFiltro) || cat === categoriaFiltro;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoriaFiltro(cat === 'Todas' ? null : cat)}
                  className="font-raleway text-xs tracking-[0.2em] uppercase px-4 py-2 transition-all"
                  style={activo
                    ? { background: '#c9a96e', color: '#080808' }
                    : { border: '1px solid #2a2416', color: '#6b5f4a' }
                  }
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Buscador */}
          <div className="relative w-full sm:w-64">
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
            <p className="font-raleway text-xs tracking-widest uppercase" style={{ color: '#4a3f2e' }}>
              No se encontraron prendas
            </p>
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border border-t-transparent animate-spin" style={{ borderColor: '#c9a96e', borderTopColor: 'transparent' }} />
          <p className="font-raleway text-xs tracking-widest uppercase" style={{ color: '#4a3f2e' }}>Imperial</p>
        </div>
      </div>
    }>
      <Catalogo />
    </Suspense>
  );
}
