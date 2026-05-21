'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

// Entrada: la página "emerge" desde atrás en el eje Z con ligera rotación en X
// Da sensación de profundidad y despliegue elegante
const variants = {
  initial: {
    opacity: 0,
    y: 32,
    rotateX: 6,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],   // ease out expo — sensación de peso y elegancia
    },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export default function PageTransition({ children }) {
  const pathname = usePathname();

  return (
    <div style={{ perspective: '1200px' }}>
      <AnimatePresence mode="wait" initial={true}>
        <motion.div
          key={pathname}
          variants={variants}
          initial="initial"
          animate="enter"
          exit="exit"
          style={{ transformStyle: 'preserve-3d', willChange: 'transform, opacity' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
