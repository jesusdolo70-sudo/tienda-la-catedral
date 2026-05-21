'use client';
import { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

// Componente wrapper que aplica tilt 3D real siguiendo el cursor
export default function Card3D({ children, className = '', intensity = 12 }) {
  const ref = useRef(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Spring suaviza el movimiento para que se sienta fluido y premium
  const springConfig = { stiffness: 180, damping: 22, mass: 0.8 };
  const x = useSpring(rawX, springConfig);
  const y = useSpring(rawY, springConfig);

  const rotateX = useTransform(y, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-intensity, intensity]);

  // Luz especular que se mueve con el cursor para simular reflejo 3D
  const glareX = useTransform(x, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(y, [-0.5, 0.5], ['0%', '100%']);
  const glareOpacity = useSpring(0, { stiffness: 200, damping: 25 });

  function handleMouseMove(e) {
    const rect = ref.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
    glareOpacity.set(0.12);
  }

  function handleMouseLeave() {
    rawX.set(0);
    rawY.set(0);
    glareOpacity.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 900,
        willChange: 'transform',
      }}
      whileHover={{ scale: 1.02, z: 20 }}
      transition={{ scale: { duration: 0.3, ease: 'easeOut' } }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {/* Capa de reflejo/glare que simula la luz */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden"
        style={{
          background: useTransform(
            [glareX, glareY],
            ([gx, gy]) =>
              `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.18) 0%, transparent 65%)`
          ),
          opacity: glareOpacity,
        }}
      />
    </motion.div>
  );
}
