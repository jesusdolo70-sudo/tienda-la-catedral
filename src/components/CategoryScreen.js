'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ProductCard from '@/components/ProductCard';

// ─── Paleta editorial por categoría ───────────────────────────────────────────
const META = {
  Camisetas: {
    bg:       '#08080f',
    accent:   '#818cf8',          // indigo claro
    accentDim:'#3730a3',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #08080f 60%)',
    tagline:  'Básicos de autor',
    roman:    'I',
  },
  Pantalones: {
    bg:       '#0c0a06',
    accent:   '#f59e0b',          // amber
    accentDim:'#92400e',
    gradient: 'linear-gradient(135deg, #1c1003 0%, #0c0a06 60%)',
    tagline:  'Siluetas de precisión',
    roman:    'II',
  },
  Vestidos: {
    bg:       '#0f0406',
    accent:   '#fb7185',          // rose
    accentDim:'#9f1239',
    gradient: 'linear-gradient(135deg, #1f0610 0%, #0f0406 60%)',
    tagline:  'Elegancia sin compromiso',
    roman:    'III',
  },
  Chaquetas: {
    bg:       '#060c09',
    accent:   '#34d399',          // esmeralda
    accentDim:'#065f46',
    gradient: 'linear-gradient(135deg, #022c22 0%, #060c09 60%)',
    tagline:  'Capas con carácter',
    roman:    'IV',
  },
  Sudaderas: {
    bg:       '#060a10',
    accent:   '#38bdf8',          // cielo
    accentDim:'#0c4a6e',
    gradient: 'linear-gradient(135deg, #0c1a2e 0%, #060a10 60%)',
    tagline:  'Confort de autor',
    roman:    'V',
  },
  Camisas: {
    bg:       '#07090f',
    accent:   '#a78bfa',          // violeta
    accentDim:'#4c1d95',
    gradient: 'linear-gradient(135deg, #13103a 0%, #07090f 60%)',
    tagline:  'Formalidad redefinida',
    roman:    'VI',
  },
  Zapatos: {
    bg:       '#09080c',
    accent:   '#e879f9',          // fúcsia
    accentDim:'#701a75',
    gradient: 'linear-gradient(135deg, #1a0a22 0%, #09080c 60%)',
    tagline:  'Pasos con distinción',
    roman:    'VII',
  },
  Accesorios: {
    bg:       '#0c0906',
    accent:   '#fbbf24',          // dorado
    accentDim:'#78350f',
    gradient: 'linear-gradient(135deg, #1c1003 0%, #0c0906 60%)',
    tagline:  'El detalle que define',
    roman:    'VIII',
  },
};

const DEFAULT_META = {
  bg: '#080808', accent: '#e5e5e5', accentDim: '#404040',
  gradient: 'linear-gradient(135deg, #1a1a1a 0%, #080808 60%)',
  tagline: 'Colección exclusiva', roman: '∞',
};

const SORT_OPTIONS = [
  { key: 'reciente',    label: 'Recientes' },
  { key: 'precio_asc',  label: 'Precio ↑' },
  { key: 'precio_desc', label: 'Precio ↓' },
  { key: 'nombre',      label: 'A — Z' },
];

function sortProducts(products, key) {
  const arr = [...products];
  if (key === 'precio_asc')  return arr.sort((a, b) => a.precio - b.precio);
  if (key === 'precio_desc') return arr.sort((a, b) => b.precio - a.precio);
  if (key === 'nombre')      return arr.sort((a, b) => a.nombre.localeCompare(b.nombre));
  return arr;
}

export default function CategoryScreen({ categoria, onClose }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [orden, setOrden] = useState('reciente');
  const meta = META[categoria] || DEFAULT_META;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => {
    setCargando(true);
    fetch(`/api/productos?categoria=${encodeURIComponent(categoria)}`)
      .then(r => r.json())
      .then(data => { setProductos(data); setCargando(false); });
  }, [categoria]);

  const sorted = sortProducts(productos, orden);
  const inicial = categoria[0].toUpperCase();

  return (
    <motion.div
      initial={{ clipPath: 'inset(100% 0 0 0)' }}
      animate={{ clipPath: 'inset(0% 0 0 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
      style={{ background: meta.bg }}
    >
      {/* ══ SECCIÓN SUPERIOR OSCURA ══════════════════════════════════════════════ */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{ background: meta.gradient }}
      >
        {/* Grain / textura de lujo (SVG inline) */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <filter id={`noise-${categoria}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
          </filter>
          <rect width="100%" height="100%" filter={`url(#noise-${categoria})`}/>
        </svg>

        {/* Letra de agua gigante */}
        <div
          className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          <span
            className="font-cormorant font-bold leading-none"
            style={{
              fontSize: 'clamp(180px, 28vw, 420px)',
              color: meta.accent,
              opacity: 0.04,
              letterSpacing: '-0.05em',
            }}
          >
            {inicial}
          </span>
        </div>

        {/* Línea de luz horizontal sutil */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${meta.accent}60, transparent)` }}
        />

        {/* ── Barra superior ── */}
        <div className="relative z-10 flex items-center justify-between px-8 md:px-14 pt-7 pb-3">
          <div className="flex items-center gap-4">
            <span
              className="font-cormorant text-sm font-light tracking-[0.4em] uppercase"
              style={{ color: `${meta.accent}80` }}
            >
              La Catedral
            </span>
            <span style={{ color: `${meta.accent}30` }} className="text-xs">·</span>
            <span
              className="font-raleway text-xs tracking-[0.3em] uppercase"
              style={{ color: `${meta.accent}50` }}
            >
              Colección 2025
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="group flex items-center gap-2.5"
          >
            <span
              className="font-raleway text-xs tracking-[0.25em] uppercase transition-colors"
              style={{ color: `${meta.accent}60` }}
            >
              Esc
            </span>
            <div
              className="w-8 h-8 border flex items-center justify-center transition-colors"
              style={{ borderColor: `${meta.accent}30` }}
            >
              <XMarkIcon className="w-4 h-4" style={{ color: `${meta.accent}80` }} />
            </div>
          </motion.button>
        </div>

        {/* ── Número romano lateral ── */}
        <div
          className="absolute left-8 md:left-14 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden md:block"
          aria-hidden="true"
        >
          <span
            className="font-cormorant font-light"
            style={{ fontSize: '11px', color: `${meta.accent}25`, letterSpacing: '0.5em', writingMode: 'vertical-lr' }}
          >
            {meta.roman}
          </span>
        </div>

        {/* ── Contenido principal del header ── */}
        <div className="relative z-10 px-8 md:px-14 pt-8 pb-6 md:pl-24">

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 mb-5"
          >
            <div className="w-6 h-px" style={{ background: meta.accent }} />
            <span
              className="font-raleway text-xs tracking-[0.35em] uppercase font-medium"
              style={{ color: meta.accent }}
            >
              {meta.tagline}
            </span>
          </motion.div>

          {/* Nombre de categoría */}
          <div className="overflow-hidden mb-2">
            <motion.h1
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              className="font-cormorant font-light leading-none tracking-wide"
              style={{
                fontSize: 'clamp(52px, 9vw, 110px)',
                color: '#ffffff',
              }}
            >
              {categoria}
            </motion.h1>
          </div>

          {/* Sub-línea con gradiente de color */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="h-0.5 mb-6 origin-left"
            style={{ background: `linear-gradient(90deg, ${meta.accent}, transparent)`, maxWidth: '280px' }}
          />

          {/* Stats + ornamento */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="flex items-center gap-6"
          >
            <div>
              <span
                className="font-cormorant text-3xl font-light"
                style={{ color: meta.accent }}
              >
                {cargando ? '—' : productos.length}
              </span>
              <span
                className="font-raleway text-xs tracking-widest uppercase ml-2"
                style={{ color: `${meta.accent}60` }}
              >
                prendas
              </span>
            </div>
            <span style={{ color: `${meta.accent}20` }} className="text-2xl">◆</span>
            <span
              className="font-raleway text-xs tracking-[0.3em] uppercase"
              style={{ color: `${meta.accent}40` }}
            >
              Nueva temporada
            </span>
          </motion.div>
        </div>

        {/* ── Barra de orden ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.4 }}
          className="relative z-10 flex items-center gap-1 px-8 md:px-14 pb-6 md:pl-24"
        >
          <span
            className="font-raleway text-xs tracking-[0.3em] uppercase mr-4"
            style={{ color: `${meta.accent}35` }}
          >
            Ordenar
          </span>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setOrden(opt.key)}
              className="font-raleway text-xs tracking-wider uppercase px-4 py-2 transition-all duration-200"
              style={
                orden === opt.key
                  ? { background: meta.accent, color: meta.bg, fontWeight: '600' }
                  : { color: `${meta.accent}45`, border: `1px solid ${meta.accent}20` }
              }
              onMouseEnter={e => { if (orden !== opt.key) e.currentTarget.style.color = meta.accent; e.currentTarget.style.borderColor = `${meta.accent}60`; }}
              onMouseLeave={e => { if (orden !== opt.key) e.currentTarget.style.color = `${meta.accent}45`; e.currentTarget.style.borderColor = `${meta.accent}20`; }}
            >
              {opt.label}
            </button>
          ))}
        </motion.div>

        {/* Línea de luz inferior */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${meta.accent}30, transparent)` }}
        />
      </div>

      {/* ══ ZONA DE PRODUCTOS ════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto bg-[#fafafa]">
        {cargando ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="border-b border-r border-gray-100 h-80 animate-pulse bg-white" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="font-cormorant text-5xl text-gray-300 mb-3">∅</p>
            <p className="font-raleway text-xs tracking-[0.3em] uppercase text-gray-400">Sin prendas disponibles</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.055 } } }}
          >
            {sorted.map((p, i) => (
              <motion.div
                key={p.id}
                variants={{
                  hidden: { opacity: 0, y: 36 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="border-b border-r border-gray-100 bg-white"
              >
                <ProductCard producto={p} index={i} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Cierre editorial ── */}
        {!cargando && sorted.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="py-14 flex flex-col items-center gap-5 border-t border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-px bg-gray-300" />
              <span className="font-cormorant text-xl font-light text-gray-400 italic tracking-widest">
                fin de {categoria.toLowerCase()}
              </span>
              <div className="w-12 h-px bg-gray-300" />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="font-raleway text-xs tracking-[0.28em] uppercase border border-gray-300 text-gray-500 px-10 py-3.5 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300"
            >
              Volver a La Catedral
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
