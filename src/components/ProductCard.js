'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Card3D from '@/components/Card3D';
import { useCurrency } from '@/context/CurrencyContext';

export const cardVariants = {
  hidden:  { opacity: 0, y: 30, rotateX: 8, scale: 0.96 },
  visible: (i) => ({
    opacity: 1, y: 0, rotateX: 0, scale: 1,
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ProductCard({ producto, index = 0 }) {
  const { formatPrecio } = useCurrency();
  const tallas = typeof producto.tallas === 'string' ? JSON.parse(producto.tallas) : producto.tallas;
  const esExclusivo = !!producto.exclusivo;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      style={{ perspective: '900px' }}
    >
      <Card3D intensity={8}>
        <Link
          href={`/producto/${producto.id}`}
          className="group block h-full flex flex-col overflow-hidden"
          style={{
            background: esExclusivo ? '#0a0806' : '#0d0d0d',
            boxShadow: esExclusivo ? 'inset 0 0 0 1px #c9a96e30' : undefined,
          }}
        >
          {/* Zona imagen */}
          <div className="relative flex items-center justify-center overflow-hidden" style={{ height: '220px', background: esExclusivo ? '#0d0a06' : '#111111' }}>
            <div className="absolute inset-0 z-10" style={{
              background: `radial-gradient(ellipse at center, transparent 40%, ${esExclusivo ? '#0a0806' : '#0d0d0d'} 100%)`,
            }} />
            {producto.imagen && producto.imagen.startsWith('http') ? (
              <motion.img
                src={producto.imagen}
                alt={producto.nombre}
                className="absolute inset-0 w-full h-full object-cover object-top"
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.5 }}
              />
            ) : (
              <motion.div className="text-6xl relative z-10" whileHover={{ scale: 1.12 }} transition={{ duration: 0.4 }}>
                {getCategoryEmoji(producto.categoria)}
              </motion.div>
            )}

            {/* Badge exclusivo */}
            {esExclusivo && (
              <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-3">
                <span
                  className="font-raleway text-xs tracking-[0.35em] uppercase px-3 py-1"
                  style={{ background: '#0a0806', border: '1px solid #c9a96e60', color: '#c9a96e', letterSpacing: '0.3em' }}
                >
                  ◆ Solo Imperial
                </span>
              </div>
            )}

            {/* Últimas unidades */}
            {!esExclusivo && producto.stock < 5 && producto.stock > 0 && (
              <span className="absolute top-3 left-3 z-20 font-raleway text-xs tracking-widest uppercase px-2.5 py-1"
                style={{ background: '#c9a96e', color: '#050505', fontWeight: '600' }}>
                Últimas
              </span>
            )}

            {/* Unidades exclusivas restantes */}
            {esExclusivo && (
              <span className="absolute bottom-3 right-3 z-20 font-raleway text-xs tracking-wider"
                style={{ color: '#c9a96e80' }}>
                {producto.stock} / 8 restantes
              </span>
            )}

            {/* Línea dorada en hover */}
            <div className="absolute bottom-0 left-0 right-0 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
              style={{ background: '#c9a96e' }} />
          </div>

          {/* Info */}
          <div className="p-5 flex flex-col flex-1" style={{ borderTop: `1px solid ${esExclusivo ? '#2a1f0e' : '#1a1a1a'}` }}>
            <span className="font-raleway text-xs tracking-[0.22em] uppercase mb-1" style={{ color: esExclusivo ? '#7a5f32' : '#7a6a54' }}>
              {producto.categoria}
            </span>
            <h3 className="font-cormorant text-xl font-medium leading-snug mb-2" style={{ color: '#f0ead6' }}>
              {producto.nombre}
            </h3>
            <p className="font-raleway text-xs leading-relaxed font-light flex-1 line-clamp-2" style={{ color: '#8a7860' }}>
              {producto.descripcion}
            </p>

            {tallas.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {tallas.slice(0, 4).map(t => (
                  <span key={t} className="font-raleway text-xs tracking-wider px-2 py-0.5"
                    style={{ border: `1px solid ${esExclusivo ? '#3a2810' : '#2a2416'}`, color: '#6b5f4a' }}>
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 flex items-end justify-between" style={{ borderTop: `1px solid ${esExclusivo ? '#2a1f0e' : '#1a1a1a'}` }}>
              <span className="font-cormorant text-2xl font-light" style={{ color: '#c9a96e' }}>
                {formatPrecio(producto.precio)}
              </span>
              {esExclusivo ? (
                <span className="font-raleway text-xs tracking-wider" style={{ color: '#c9a96e50' }}>
                  Edición única
                </span>
              ) : (
                <span className="font-raleway text-xs tracking-wider" style={{ color: '#5a4f3a' }}>
                  {producto.stock} uds.
                </span>
              )}
            </div>
          </div>
        </Link>
      </Card3D>
    </motion.div>
  );
}

function getCategoryEmoji(categoria) {
  const map = {
    'Camisetas': '👕', 'Pantalones': '👖', 'Vestidos': '👗',
    'Chaquetas': '🧥', 'Sudaderas': '🧸', 'Camisas': '👔',
    'Zapatos': '👟', 'Accesorios': '👜',
  };
  return map[categoria] || '🛍️';
}
