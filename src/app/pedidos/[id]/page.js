'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowPathIcon, CheckIcon, ClockIcon, TruckIcon, MapPinIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

// ── Flujo de estados ──────────────────────────────────────────────────────────
const FLUJO = [
  {
    key:   'confirmado',
    label: 'Pago confirmado',
    desc:  'Recibimos tu pago exitosamente',
    icon:  '✦',
    color: '#4ade80',
  },
  {
    key:   'preparando',
    label: 'Preparando',
    desc:  'Estamos empacando tu pedido con cuidado',
    icon:  '◈',
    color: '#c9a96e',
  },
  {
    key:   'enviado',
    label: 'En camino',
    desc:  'Tu pedido está siendo transportado',
    icon:  '◉',
    color: '#818cf8',
  },
  {
    key:   'entregado',
    label: 'Entregado',
    desc:  'Tu pedido fue entregado con éxito',
    icon:  '★',
    color: '#c9a96e',
  },
];

const ESTADO_CONFIG = {
  confirmado: { color: '#4ade80', bg: '#001a0a', border: '#4ade8030', msg: 'Pago recibido. Comenzamos a procesar tu pedido.' },
  preparando:  { color: '#c9a96e', bg: '#0a0800', border: '#c9a96e30', msg: 'Estamos seleccionando y empacando tus prendas.' },
  enviado:     { color: '#818cf8', bg: '#0d0d1a', border: '#818cf830', msg: 'Tu pedido está en camino. Llegará pronto.' },
  entregado:   { color: '#c9a96e', bg: '#0a0800', border: '#c9a96e30', msg: '¡Tus prendas Imperial ya están contigo!' },
  cancelado:   { color: '#f87171', bg: '#1a0808', border: '#f8717130', msg: 'Este pedido fue cancelado.' },
  pendiente:   { color: '#f59e0b', bg: '#1a0e00', border: '#f59e0b30', msg: 'Tu pedido está pendiente de confirmación.' },
};

const CATEGORIA_EMOJI = {
  Camisetas: '👕', Pantalones: '👖', Vestidos: '👗',
  Chaquetas: '🧥', Sudaderas: '🧸', Camisas: '👔',
};

function formatFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatPrecio(n) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(n);
}

// ── Componentes ───────────────────────────────────────────────────────────────

function GoldDivider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #c9a96e30)' }} />
      <span style={{ color: '#c9a96e40', fontSize: '7px' }}>◆</span>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #c9a96e30, transparent)' }} />
    </div>
  );
}

function DataRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid #141414' }}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#4a3f2e' }} />
      <div className="flex-1 min-w-0">
        <p className="font-raleway text-xs tracking-[0.15em] uppercase mb-0.5" style={{ color: '#3a3228' }}>{label}</p>
        <p className="font-raleway text-sm" style={{ color: '#8a7a60' }}>{value}</p>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function SeguimientoPedido() {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    else setRefrescando(true);
    try {
      const res = await fetch(`/api/pedidos/${id}`);
      if (!res.ok) { setError('Pedido no encontrado.'); return; }
      const data = await res.json();
      const items = typeof data.items === 'string' ? JSON.parse(data.items) : (data.items || []);
      setPedido({ ...data, items });
    } catch {
      setError('No se pudo cargar el pedido.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  function copiarLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (cargando) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-5"
      >
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border border-t-transparent animate-spin"
            style={{ borderColor: '#c9a96e40', borderTopColor: '#c9a96e' }} />
          <div className="absolute inset-2 rounded-full border border-b-transparent animate-spin"
            style={{ borderColor: '#c9a96e20', borderBottomColor: '#c9a96e60', animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <div className="text-center">
          <p className="font-cormorant text-2xl font-light mb-1" style={{ color: '#f0ead6' }}>Imperial</p>
          <p className="font-raleway text-xs tracking-[0.4em] uppercase" style={{ color: '#4a3f2e' }}>
            Cargando pedido
          </p>
        </div>
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <p className="font-cormorant text-8xl mb-4" style={{ color: '#1a1a1a' }}>∅</p>
        <p className="font-cormorant text-2xl font-light mb-2" style={{ color: '#f0ead6' }}>{error}</p>
        <p className="font-raleway text-xs tracking-wider" style={{ color: '#4a3f2e' }}>
          Verifica el número de pedido e intenta de nuevo.
        </p>
      </div>
      <Link
        href="/"
        className="font-raleway text-xs tracking-[0.3em] uppercase flex items-center gap-2 transition-colors"
        style={{ color: '#c9a96e' }}
      >
        <ArrowLeftIcon className="w-4 h-4" /> Volver al inicio
      </Link>
    </div>
  );

  const cancelado = pedido.estado === 'cancelado';
  const flujoIdx  = FLUJO.findIndex(e => e.key === pedido.estado);
  const cfg       = ESTADO_CONFIG[pedido.estado] || ESTADO_CONFIG.pendiente;
  const progreso  = flujoIdx >= 0 ? (flujoIdx / (FLUJO.length - 1)) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-2xl mx-auto px-4 pt-10 pb-24"
    >
      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-raleway text-xs tracking-widest uppercase transition-colors group"
          style={{ color: '#4a3f2e' }}
          onMouseEnter={e => e.currentTarget.style.color = '#c9a96e'}
          onMouseLeave={e => e.currentTarget.style.color = '#4a3f2e'}
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Inicio
        </Link>

        <div className="flex items-center gap-3">
          {/* Copiar link */}
          <button
            onClick={copiarLink}
            className="font-raleway text-xs tracking-wider transition-colors flex items-center gap-1.5"
            style={{ color: copiado ? '#c9a96e' : '#4a3f2e' }}
          >
            {copiado ? '✓ Copiado' : 'Compartir'}
          </button>

          {/* Actualizar */}
          <button
            onClick={() => cargar(true)}
            disabled={refrescando}
            className="flex items-center gap-1.5 font-raleway text-xs tracking-wider transition-colors disabled:opacity-40 pl-3"
            style={{ color: '#4a3f2e', borderLeft: '1px solid #1e1e1e' }}
            onMouseEnter={e => { if (!refrescando) e.currentTarget.style.color = '#c9a96e'; }}
            onMouseLeave={e => e.currentTarget.style.color = '#4a3f2e'}
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 ${refrescando ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* ── Header del pedido ───────────────────────────────────────────────── */}
      <div className="mb-8">
        <p className="font-raleway text-xs tracking-[0.4em] uppercase mb-3" style={{ color: '#3a3228' }}>
          Pedido #{pedido.id}
        </p>
        <h1 className="font-cormorant font-light mb-2" style={{ fontSize: 'clamp(32px, 6vw, 52px)', color: '#f0ead6' }}>
          {cancelado ? 'Pedido cancelado' : 'Seguimiento'}
        </h1>
        <p className="font-raleway text-xs tracking-wide flex items-center gap-2" style={{ color: '#3a3228' }}>
          <ClockIcon className="w-3.5 h-3.5" />
          {formatFecha(pedido.creado_en)}
        </p>
      </div>

      {/* ── Banner de estado ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-4 px-5 py-4 mb-8"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      >
        <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: cfg.color }} />
        <div>
          <p className="font-raleway text-xs tracking-[0.3em] uppercase mb-1" style={{ color: cfg.color }}>
            {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
          </p>
          <p className="font-cormorant text-lg font-light" style={{ color: '#c0b090' }}>
            {cfg.msg}
          </p>
        </div>
      </motion.div>

      {/* ── Timeline ─────────────────────────────────────────────────────────── */}
      {!cancelado && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 overflow-hidden"
          style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}
        >
          {/* Barra de progreso superior */}
          <div className="h-0.5 w-full" style={{ background: '#1a1a1a' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progreso}%` }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
              style={{ background: 'linear-gradient(90deg, #c9a96e, #e8c97a)' }}
            />
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-raleway text-xs tracking-[0.3em] uppercase" style={{ color: '#4a3f2e' }}>
                Estado del pedido
              </h2>
              <span className="font-raleway text-xs" style={{ color: '#3a3228' }}>
                {flujoIdx + 1} / {FLUJO.length}
              </span>
            </div>

            {/* Pasos horizontales (desktop) / vertical (mobile) */}
            <div className="hidden sm:grid grid-cols-4 gap-2 mb-6">
              {FLUJO.map((paso, i) => {
                const completado = flujoIdx > i;
                const activo     = flujoIdx === i;
                return (
                  <div key={paso.key} className="flex flex-col items-center text-center gap-2">
                    {/* Círculo */}
                    <div className="relative">
                      {activo && (
                        <span className="absolute inset-0 rounded-full animate-ping"
                          style={{ background: '#c9a96e', opacity: 0.2 }} />
                      )}
                      <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-500"
                        style={
                          completado ? { background: '#c9a96e', border: '2px solid #c9a96e' }
                          : activo   ? { background: '#0d0a04', border: '2px solid #c9a96e' }
                          :            { background: '#0d0d0d', border: '2px solid #1e1e1e' }
                        }
                      >
                        {completado
                          ? <CheckIcon className="w-4 h-4" style={{ color: '#050505' }} />
                          : <span style={{ color: activo ? '#c9a96e' : '#2a2416', fontSize: '11px' }}>{paso.icon}</span>
                        }
                      </div>
                    </div>
                    {/* Texto */}
                    <div>
                      <p className="font-raleway text-xs font-medium leading-tight"
                        style={{ color: completado || activo ? '#f0ead6' : '#2a2416' }}>
                        {paso.label}
                      </p>
                      {activo && (
                        <p className="font-raleway text-xs mt-0.5" style={{ color: '#c9a96e80' }}>
                          En curso
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Conectores entre pasos (desktop) */}
            <div className="hidden sm:flex items-center mb-6 -mt-[68px] px-5">
              {FLUJO.slice(0, -1).map((_, i) => (
                <div key={i} className="flex-1 h-px mx-1 mt-[-20px]" style={{
                  background: i < flujoIdx ? '#c9a96e' : '#1e1e1e',
                  marginLeft: '40px',
                  marginRight: '40px',
                  transition: 'background 0.5s',
                }} />
              ))}
            </div>

            {/* Versión vertical (mobile) */}
            <div className="sm:hidden space-y-0">
              {FLUJO.map((paso, i) => {
                const completado = flujoIdx > i;
                const activo     = flujoIdx === i;
                const ultimo     = i === FLUJO.length - 1;
                return (
                  <div key={paso.key} className="flex gap-4">
                    {/* Columna izquierda: dot + línea */}
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        {activo && (
                          <span className="absolute inset-0 rounded-full animate-ping"
                            style={{ background: '#c9a96e', opacity: 0.2 }} />
                        )}
                        <div className="relative w-8 h-8 rounded-full flex items-center justify-center"
                          style={
                            completado ? { background: '#c9a96e', border: '2px solid #c9a96e' }
                            : activo   ? { background: '#0d0a04', border: '2px solid #c9a96e' }
                            :            { background: '#0d0d0d', border: '2px solid #1e1e1e' }
                          }
                        >
                          {completado
                            ? <CheckIcon className="w-3.5 h-3.5" style={{ color: '#050505' }} />
                            : <span style={{ color: activo ? '#c9a96e' : '#2a2416', fontSize: '10px' }}>{paso.icon}</span>
                          }
                        </div>
                      </div>
                      {!ultimo && (
                        <div className="w-px flex-1 my-1" style={{
                          background: i < flujoIdx ? '#c9a96e40' : '#1e1e1e',
                          minHeight: '24px',
                        }} />
                      )}
                    </div>
                    {/* Texto */}
                    <div className="pb-5 pt-1">
                      <p className="font-raleway text-sm font-medium"
                        style={{ color: completado || activo ? '#f0ead6' : '#2a2416' }}>
                        {paso.label}
                      </p>
                      <p className="font-raleway text-xs mt-0.5"
                        style={{ color: activo ? '#c9a96e' : completado ? '#4a3f2e' : '#1e1e1e' }}>
                        {activo ? paso.desc : completado ? 'Completado' : 'Pendiente'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mensaje estado activo (desktop) */}
            {flujoIdx >= 0 && (
              <div className="sm:block hidden mt-2 pt-4" style={{ borderTop: '1px solid #141414' }}>
                <p className="font-cormorant text-lg font-light italic text-center" style={{ color: '#7a6a54' }}>
                  {FLUJO[flujoIdx]?.desc}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Artículos ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
        style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}
      >
        {/* Cabecera */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid #141414' }}>
          <h2 className="font-raleway text-xs tracking-[0.3em] uppercase" style={{ color: '#4a3f2e' }}>
            Artículos
          </h2>
          <span className="font-raleway text-xs" style={{ color: '#3a3228' }}>
            {pedido.items.reduce((s, i) => s + (i.cantidad || 1), 0)} prendas
          </span>
        </div>

        {/* Lista */}
        <div className="px-6 py-4 space-y-4">
          {pedido.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.06 }}
              className="flex items-center gap-4"
            >
              {/* Imagen / emoji */}
              <div className="w-14 h-14 flex-shrink-0 relative overflow-hidden"
                style={{ background: '#111', border: '1px solid #1a1a1a' }}>
                {item.imagen && item.imagen.startsWith('http') ? (
                  <img src={item.imagen} alt={item.nombre}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    {CATEGORIA_EMOJI[item.categoria] || '🛍️'}
                  </div>
                )}
              </div>

              {/* Detalles */}
              <div className="flex-1 min-w-0">
                <p className="font-cormorant text-lg font-light leading-tight mb-0.5 truncate"
                  style={{ color: '#f0ead6' }}>
                  {item.nombre}
                </p>
                <p className="font-raleway text-xs" style={{ color: '#4a3f2e' }}>
                  {[item.talla && `Talla ${item.talla}`, item.color].filter(Boolean).join(' · ')}
                  {(item.cantidad || 1) > 1 && ` · ×${item.cantidad}`}
                </p>
              </div>

              {/* Precio */}
              <div className="text-right flex-shrink-0">
                <p className="font-cormorant text-xl font-light" style={{ color: '#c9a96e' }}>
                  {formatPrecio(item.precio * (item.cantidad || 1))}
                </p>
                {(item.cantidad || 1) > 1 && (
                  <p className="font-raleway text-xs" style={{ color: '#3a3228' }}>
                    {formatPrecio(item.precio)} c/u
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderTop: '1px solid #141414' }}>
          <span className="font-raleway text-xs tracking-[0.25em] uppercase" style={{ color: '#6b5f4a' }}>
            Total pagado
          </span>
          <span className="font-cormorant text-3xl font-light" style={{ color: '#c9a96e' }}>
            {formatPrecio(pedido.total)}
          </span>
        </div>
      </motion.div>

      {/* ── Datos de entrega ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}
      >
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #141414' }}>
          <h2 className="font-raleway text-xs tracking-[0.3em] uppercase" style={{ color: '#4a3f2e' }}>
            Datos de entrega
          </h2>
        </div>
        <div className="px-6 pb-2">
          <DataRow icon={({ ...p }) => <span {...p} style={{ ...p.style, fontSize: 14 }}>◈</span>}
            label="Nombre" value={pedido.cliente_nombre} />
          <DataRow icon={EnvelopeIcon} label="Correo" value={pedido.cliente_email} />
          <DataRow icon={PhoneIcon}    label="Teléfono" value={pedido.cliente_telefono} />
          <DataRow icon={MapPinIcon}   label="Dirección" value={pedido.direccion} />
        </div>
      </motion.div>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center mt-12"
      >
        <GoldDivider />
        <p className="font-cormorant text-lg italic mb-5" style={{ color: '#4a3f2e' }}>
          ¿Tienes preguntas sobre tu pedido?
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-raleway text-xs tracking-[0.3em] uppercase px-8 py-3 transition-all"
          style={{ border: '1px solid #2a2416', color: '#6b5f4a' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a96e50'; e.currentTarget.style.color = '#c9a96e'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2416'; e.currentTarget.style.color = '#6b5f4a'; }}
        >
          Seguir comprando
        </Link>
      </motion.div>
    </motion.div>
  );
}
