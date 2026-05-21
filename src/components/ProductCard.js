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
          style={{ background: '#0d0d0d' }}
        >
          {/* Zona imagen */}
          <div className="relative flex items-center justify-center overflow-hidden" style={{ height: '220px', background: '#111111' }}>
            {/* Viñeta radial */}
            <div className="absolute inset-0 z-10" style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, #0d0d0d 100%)',
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
              <motion.div
                className="text-6xl relative z-10"
                whileHover={{ scale: 1.12 }}
                transition={{ duration: 0.4 }}
              >
                {getCategoryEmoji(producto.categoria)}
              </motion.div>
            )}

            {/* Etiqueta "Últimas unidades" */}
            {producto.stock < 5 && producto.stock > 0 && (
              <span
                className="absolute top-3 left-3 font-raleway text-xs tracking-widest uppercase px-2.5 py-1"
                style={{ background: '#c9a96e', color: '#050505', fontWeight: '600' }}
              >
                Últimas
              </span>
            )}

            {/* Línea dorada en hover */}
            <div
              className="absolute bottom-0 left-0 right-0 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
              style={{ background: '#c9a96e' }}
            />
          </div>

          {/* Info */}
          <div className="p-5 flex flex-col flex-1" style={{ borderTop: '1px solid #1a1a1a' }}>
            <span className="font-raleway text-xs tracking-[0.22em] uppercase mb-1" style={{ color: '#4a3f2e' }}>
              {producto.categoria}
            </span>
            <h3 className="font-cormorant text-xl font-medium leading-snug mb-2" style={{ color: '#f0ead6' }}>
              {producto.nombre}
            </h3>
            <p className="font-raleway text-xs leading-relaxed font-light flex-1 line-clamp-2" style={{ color: '#4a3f2e' }}>
              {producto.descripcion}
            </p>

            {/* Tallas */}
            {tallas.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {tallas.slice(0, 4).map(t => (
                  <span key={t} className="font-raleway text-xs tracking-wider px-2 py-0.5"
                    style={{ border: '1px solid #2a2416', color: '#6b5f4a' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Precio */}
            <div className="mt-4 pt-4 flex items-end justify-between" style={{ borderTop: '1px solid #1a1a1a' }}>
              <span className="font-cormorant text-2xl font-light" style={{ color: '#c9a96e' }}>
                {formatPrecio(producto.precio)}
              </span>
              <span className="font-raleway text-xs tracking-wider" style={{ color: '#3a3228' }}>
                {producto.stock} uds.
              </span>
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
