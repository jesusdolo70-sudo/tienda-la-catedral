'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const FLUJO = [
  { key: 'confirmado',  label: 'Pago confirmado',  desc: 'Recibimos tu pago exitosamente' },
  { key: 'preparando',  label: 'Preparando',        desc: 'Estamos empacando tu pedido' },
  { key: 'enviado',     label: 'Enviado',            desc: 'Tu pedido está en camino' },
  { key: 'entregado',   label: 'Entregado',          desc: 'Tu pedido fue entregado' },
];

const MENSAJES = {
  confirmado: 'Recibimos tu pedido y estamos procesándolo.',
  preparando: 'Estamos preparando tu pedido con cuidado.',
  enviado:    'Tu pedido está en camino. Pronto llegará.',
  entregado:  '¡Tu pedido fue entregado! Gracias por elegir Imperial.',
  cancelado:  'Este pedido fue cancelado.',
  pendiente:  'Tu pedido está pendiente de confirmación.',
};

const CATEGORIA_EMOJI = {
  Camisetas: '👕', Pantalones: '👖', Vestidos: '👗',
  Chaquetas: '🧥', Sudaderas: '🧸', Camisas: '👔',
};

function formatFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatPrecio(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
}

function PulseRing() {
  return (
    <span className="absolute inset-0 rounded-full animate-ping" style={{ background: '#c9a96e', opacity: 0.25 }} />
  );
}

export default function SeguimientoPedido() {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

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

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (cargando) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#c9a96e', borderTopColor: 'transparent' }} />
        <p className="font-raleway text-xs tracking-[0.3em] uppercase" style={{ color: '#4a3f2e' }}>Cargando pedido</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <p className="font-cormorant text-3xl font-light" style={{ color: '#f0ead6' }}>{error}</p>
      <Link href="/" className="font-raleway text-xs tracking-[0.3em] uppercase" style={{ color: '#c9a96e' }}>
        Volver al inicio →
      </Link>
    </div>
  );

  const cancelado = pedido.estado === 'cancelado';
  const flujoIdx  = FLUJO.findIndex(e => e.key === pedido.estado);

  return (
    <div className="max-w-2xl mx-auto px-4 pb-20">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-raleway text-xs tracking-widest uppercase mb-10 transition-colors"
        style={{ color: '#4a3f2e' }}
        onMouseEnter={e => e.currentTarget.style.color = '#c9a96e'}
        onMouseLeave={e => e.currentTarget.style.color = '#4a3f2e'}
      >
        <ArrowLeftIcon className="w-4 h-4" /> Seguir comprando
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1">
          <p className="font-raleway text-xs tracking-[0.3em] uppercase" style={{ color: '#4a3f2e' }}>
            Pedido #{pedido.id}
          </p>
          <button
            onClick={() => cargar(true)}
            disabled={refrescando}
            className="flex items-center gap-1.5 font-raleway text-xs tracking-wider transition-colors disabled:opacity-40"
            style={{ color: '#4a3f2e' }}
            onMouseEnter={e => e.currentTarget.style.color = '#c9a96e'}
            onMouseLeave={e => e.currentTarget.style.color = '#4a3f2e'}
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 ${refrescando ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
        <h1 className="font-cormorant text-4xl font-light mb-1" style={{ color: '#f0ead6' }}>
          {cancelado ? 'Pedido cancelado' : 'Seguimiento de pedido'}
        </h1>
        <p className="font-raleway text-xs tracking-wider" style={{ color: '#3a3228' }}>
          {formatFecha(pedido.creado_en)}
        </p>
      </div>

      {/* Estado message */}
      <div
        className="px-5 py-4 mb-8 flex items-center gap-3"
        style={{
          background: cancelado ? '#1a0808' : '#0a0a04',
          border: `1px solid ${cancelado ? '#c04a4a30' : '#c9a96e20'}`,
        }}
      >
        <div className="w-1 h-6 flex-shrink-0" style={{ background: cancelado ? '#c04a4a' : '#c9a96e' }} />
        <p className="font-raleway text-xs tracking-wide" style={{ color: cancelado ? '#c04a4a' : '#c9a96e' }}>
          {MENSAJES[pedido.estado] || 'Estado desconocido'}
        </p>
      </div>

      {/* Timeline */}
      {!cancelado && (
        <div className="mb-10 p-6" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
          <h2 className="font-raleway text-xs tracking-[0.3em] uppercase mb-6" style={{ color: '#4a3f2e' }}>
            Estado del pedido
          </h2>
          <div className="relative">
            {/* Línea vertical */}
            <div
              className="absolute left-[15px] top-4 bottom-4 w-px"
              style={{ background: '#1e1e1e' }}
            />
            {/* Progreso dorado */}
            {flujoIdx >= 0 && (
              <div
                className="absolute left-[15px] top-4 w-px transition-all duration-700"
                style={{
                  background: 'linear-gradient(180deg, #c9a96e, #8a6832)',
                  height: `calc(${(flujoIdx / (FLUJO.length - 1)) * 100}% - 2rem)`,
                }}
              />
            )}

            <div className="space-y-8">
              {FLUJO.map((paso, i) => {
                const completado = flujoIdx > i;
                const activo     = flujoIdx === i;
                const pendiente  = flujoIdx < i;

                return (
                  <div key={paso.key} className="flex items-start gap-5 relative">
                    {/* Dot */}
                    <div className="relative flex-shrink-0 w-8 h-8 flex items-center justify-center">
                      {activo && <PulseRing />}
                      <div
                        className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                        style={
                          completado
                            ? { background: '#c9a96e', border: '2px solid #c9a96e' }
                            : activo
                            ? { background: '#1a140a', border: '2px solid #c9a96e' }
                            : { background: '#0d0d0d', border: '2px solid #1e1e1e' }
                        }
                      >
                        {completado ? (
                          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8l3.5 3.5L13 5" stroke="#080808" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : activo ? (
                          <div className="w-2 h-2 rounded-full" style={{ background: '#c9a96e' }} />
                        ) : (
                          <div className="w-2 h-2 rounded-full" style={{ background: '#2a2416' }} />
                        )}
                      </div>
                    </div>

                    {/* Texto */}
                    <div className="pt-1">
                      <p
                        className="font-raleway text-sm font-medium tracking-wide"
                        style={{ color: completado || activo ? '#f0ead6' : '#3a3228' }}
                      >
                        {paso.label}
                      </p>
                      <p
                        className="font-raleway text-xs mt-0.5"
                        style={{ color: activo ? '#c9a96e' : completado ? '#6b5f4a' : '#2a2416' }}
                      >
                        {activo ? paso.desc : completado ? 'Completado' : 'Pendiente'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Productos */}
      <div className="mb-8 p-6" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
        <h2 className="font-raleway text-xs tracking-[0.3em] uppercase mb-5" style={{ color: '#4a3f2e' }}>
          Artículos
        </h2>
        <div className="space-y-4">
          {pedido.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div
                className="w-10 h-10 flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: '#111', border: '1px solid #1a1a1a' }}
              >
                {CATEGORIA_EMOJI[item.categoria] || '🛍️'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-raleway text-sm truncate" style={{ color: '#c9a96e' }}>{item.nombre}</p>
                <p className="font-raleway text-xs" style={{ color: '#3a3228' }}>
                  {[item.talla, item.color].filter(Boolean).join(' · ')}
                  {item.cantidad > 1 && ` · ×${item.cantidad}`}
                </p>
              </div>
              <span className="font-raleway text-sm flex-shrink-0" style={{ color: '#6b5f4a' }}>
                {formatPrecio(item.precio * item.cantidad)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 flex justify-between" style={{ borderTop: '1px solid #1a1a1a' }}>
          <span className="font-raleway text-xs tracking-[0.2em] uppercase" style={{ color: '#f0ead6' }}>Total</span>
          <span className="font-cormorant text-2xl" style={{ color: '#c9a96e' }}>{formatPrecio(pedido.total)}</span>
        </div>
      </div>

      {/* Datos de entrega */}
      <div className="p-6" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
        <h2 className="font-raleway text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#4a3f2e' }}>
          Datos de entrega
        </h2>
        <div className="space-y-2">
          {[
            { label: 'Nombre',    value: pedido.cliente_nombre },
            { label: 'Correo',    value: pedido.cliente_email },
            { label: 'Teléfono',  value: pedido.cliente_telefono },
            { label: 'Dirección', value: pedido.direccion },
          ].filter(r => r.value).map(row => (
            <div key={row.label} className="flex gap-4">
              <span className="font-raleway text-xs w-20 flex-shrink-0" style={{ color: '#4a3f2e' }}>{row.label}</span>
              <span className="font-raleway text-xs" style={{ color: '#6b5f4a' }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
