'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.replace('/admin');
      return;
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '70vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <p className="font-raleway text-xs tracking-[0.45em] uppercase mb-4" style={{ color: '#4a3f2e' }}>
            Área restringida
          </p>
          <h1 className="font-cormorant text-5xl font-light mb-2" style={{ color: '#f0ead6' }}>
            Imperial
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="w-8 h-px" style={{ background: '#c9a96e40' }} />
            <span style={{ color: '#c9a96e50', fontSize: '8px' }}>◆</span>
            <div className="w-8 h-px" style={{ background: '#c9a96e40' }} />
          </div>
          <p className="font-cormorant text-lg italic mt-3" style={{ color: '#4a3f2e' }}>
            Panel de administración
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #c9a96e30, transparent)' }} />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña"
              autoFocus
              required
              className="w-full font-raleway text-sm tracking-widest px-5 py-4 focus:outline-none"
              style={{
                background: '#0d0d0d',
                border: '1px solid #1e1e1e',
                color: '#f0ead6',
                letterSpacing: '0.2em',
              }}
              onFocus={e => e.target.style.borderColor = '#c9a96e40'}
              onBlur={e => e.target.style.borderColor = '#1e1e1e'}
            />
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-raleway text-xs tracking-wide mb-4 text-center"
              style={{ color: '#f87171' }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading || !password}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-4 font-raleway text-xs tracking-[0.3em] uppercase font-semibold disabled:opacity-40 transition-opacity"
            style={{ background: '#c9a96e', color: '#050505' }}
          >
            {loading ? 'Verificando...' : 'Acceder'}
          </motion.button>
        </form>

        <p className="text-center font-raleway text-xs mt-8" style={{ color: '#2a2520' }}>
          © 2025 Imperial
        </p>
      </motion.div>
    </div>
  );
}
