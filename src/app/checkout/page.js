'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, LockClosedIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// ─── Card type detection ─────────────────────────────────────────────────────
function detectCardType(num) {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6011|^64[4-9]|^65/.test(n)) return 'discover';
  return null;
}

const CARD_LOGOS = {
  visa: 'VISA',
  mastercard: 'MC',
  amex: 'AMEX',
  discover: 'DISC',
};

// ─── Colombian banks for PSE ──────────────────────────────────────────────────
const BANCOS_PSE = [
  'Bancolombia', 'Banco de Bogotá', 'Davivienda', 'BBVA', 'Banco Popular',
  'Scotiabank Colpatria', 'Banco de Occidente', 'Banco Caja Social', 'Itaú',
  'Banco Agrario', 'AV Villas', 'Nequi', 'Rappi Pay',
];

// ─── Field styling ────────────────────────────────────────────────────────────
const inputStyle = {
  background: '#0a0a0a',
  border: '1px solid #2a2416',
  color: '#f0ead6',
  outline: 'none',
};
const inputFocusStyle = { borderColor: '#c9a96e' };

function LuxInput({ label, error, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && (
        <label className="block font-raleway text-xs tracking-[0.2em] uppercase mb-2" style={{ color: focused ? '#c9a96e' : '#4a3f2e' }}>
          {label}
        </label>
      )}
      <input
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        className="w-full px-4 py-3 font-raleway text-sm transition-colors"
        style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}), ...(error ? { borderColor: '#c04a4a' } : {}) }}
      />
      {error && <p className="font-raleway text-xs mt-1" style={{ color: '#c04a4a' }}>{error}</p>}
    </div>
  );
}

function LuxSelect({ label, children, ...props }) {
  return (
    <div>
      {label && (
        <label className="block font-raleway text-xs tracking-[0.2em] uppercase mb-2" style={{ color: '#4a3f2e' }}>
          {label}
        </label>
      )}
      <select
        {...props}
        className="w-full px-4 py-3 font-raleway text-sm transition-colors appearance-none"
        style={{ ...inputStyle, cursor: 'pointer' }}
      >
        {children}
      </select>
    </div>
  );
}

// ─── Animated credit card ─────────────────────────────────────────────────────
function AnimatedCard({ numero, nombre, expiry, cvv, showBack }) {
  const tipo = detectCardType(numero);
  const displayNum = (numero || '').padEnd(19, ' ').replace(/(.{4})/g, '$1 ').trim();

  return (
    <div className="relative w-full max-w-xs mx-auto mb-6" style={{ perspective: '1000px', height: '160px' }}>
      <div
        className="w-full h-full relative transition-all duration-500"
        style={{ transformStyle: 'preserve-3d', transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #1a140a 0%, #0d0a04 50%, #1a1008 100%)',
            border: '1px solid #2a2416',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(201,169,110,0.1)',
          }}
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c9a96e 0px, #c9a96e 1px, transparent 1px, transparent 8px)' }}
          />
          <div className="flex justify-between items-start relative z-10">
            <div
              className="w-10 h-7 rounded"
              style={{ background: 'linear-gradient(135deg, #c9a96e, #8a6832)', opacity: 0.9 }}
            />
            {tipo && (
              <span className="font-raleway text-xs font-bold tracking-widest" style={{ color: '#c9a96e' }}>
                {CARD_LOGOS[tipo]}
              </span>
            )}
          </div>
          <div className="relative z-10">
            <p className="font-cormorant text-xl tracking-[0.25em]" style={{ color: '#f0ead6', letterSpacing: '0.2em' }}>
              {numero || '•••• •••• •••• ••••'}
            </p>
            <div className="flex justify-between mt-2">
              <p className="font-raleway text-xs tracking-wider uppercase" style={{ color: '#6b5f4a' }}>
                {nombre || 'NOMBRE APELLIDO'}
              </p>
              <p className="font-raleway text-xs tracking-wider" style={{ color: '#6b5f4a' }}>
                {expiry || 'MM/AA'}
              </p>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #0d0a04 0%, #1a140a 100%)',
            border: '1px solid #2a2416',
          }}
        >
          <div className="w-full h-10 mb-4" style={{ background: '#111' }} />
          <div className="px-5 flex items-center justify-end gap-3">
            <div className="flex-1 h-8" style={{ background: '#f0ead610' }} />
            <div
              className="w-14 h-8 flex items-center justify-center font-raleway text-sm font-bold"
              style={{ background: '#c9a96e', color: '#080808' }}
            >
              {cvv || '•••'}
            </div>
          </div>
          <p className="text-center font-raleway text-xs mt-3" style={{ color: '#3a3228' }}>CVV</p>
        </div>
      </div>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Envío', 'Pago', 'Confirmar'];
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-raleway text-xs font-bold transition-all duration-300"
              style={
                i < step
                  ? { background: '#c9a96e', color: '#080808' }
                  : i === step
                  ? { background: '#1a140a', border: '1px solid #c9a96e', color: '#c9a96e' }
                  : { background: '#0d0d0d', border: '1px solid #2a2416', color: '#3a3228' }
              }
            >
              {i < step ? <CheckCircleIcon className="w-4 h-4" /> : i + 1}
            </div>
            <span className="font-raleway text-xs tracking-[0.2em] uppercase mt-2" style={{ color: i <= step ? '#c9a96e' : '#3a3228' }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-20 h-px mx-2 mb-6" style={{ background: i < step ? '#c9a96e40' : '#1a1a1a' }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main checkout ────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, total, vaciar } = useCart();
  const { formatPrecio } = useCurrency();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [pedidoId, setPedidoId] = useState(null);
  const [errorPago, setErrorPago] = useState('');

  // Step 0 — shipping
  const [shipping, setShipping] = useState({ nombre: '', email: '', telefono: '', direccion: '' });
  const [shippingErrors, setShippingErrors] = useState({});

  // Step 1 — payment
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [tarjeta, setTarjeta] = useState({ numero: '', nombre: '', expiry: '', cvv: '' });
  const [cvvFocused, setCvvFocused] = useState(false);
  const [pse, setPse] = useState({ banco: BANCOS_PSE[0], tipo: 'natural', documento: '' });
  const [celular, setCelular] = useState('');
  const [emailPP, setEmailPP] = useState('');

  useEffect(() => {
    if (items.length === 0 && !pedidoId) router.push('/carrito');
  }, [items, pedidoId, router]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function formatCardNum(val) {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  }

  function formatExpiry(val) {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  }

  // ── Validation step 0 ───────────────────────────────────────────────────────
  function validateShipping() {
    const e = {};
    if (!shipping.nombre.trim()) e.nombre = 'Requerido';
    if (!shipping.email.trim() || !shipping.email.includes('@')) e.email = 'Email inválido';
    if (!shipping.telefono.trim()) e.telefono = 'Requerido';
    if (!shipping.direccion.trim()) e.direccion = 'Requerido';
    setShippingErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handlePagar() {
    setErrorPago('');
    setEnviando(true);

    const metodoPayload =
      metodoPago === 'tarjeta' ? { tipo: 'tarjeta', ...tarjeta } :
      metodoPago === 'pse' ? { tipo: 'pse', ...pse } :
      metodoPago === 'nequi' ? { tipo: 'nequi', celular } :
      metodoPago === 'daviplata' ? { tipo: 'daviplata', celular } :
      { tipo: 'paypal', email: emailPP };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_nombre: shipping.nombre,
          cliente_email: shipping.email,
          cliente_telefono: shipping.telefono,
          direccion: shipping.direccion,
          items,
          total,
          metodo_pago: metodoPayload,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorPago(data.error || 'Error al procesar el pago'); setEnviando(false); return; }
      vaciar();
      setPedidoId(data.pedido_id);
      setStep(2);
    } catch {
      setErrorPago('Error de conexión. Intente de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  // ── Confirmation screen ──────────────────────────────────────────────────────
  if (step === 2 && pedidoId) return (
    <div className="max-w-lg mx-auto text-center py-20">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8" style={{ background: '#0d0a04', border: '1px solid #c9a96e40' }}>
        <CheckCircleIcon className="w-10 h-10" style={{ color: '#c9a96e' }} />
      </div>
      <h2 className="font-cormorant text-4xl font-light mb-3" style={{ color: '#f0ead6' }}>Pago confirmado</h2>
      <p className="font-raleway text-xs tracking-[0.3em] uppercase mb-2" style={{ color: '#4a3f2e' }}>
        Pedido #{pedidoId}
      </p>
      <p className="font-raleway text-xs tracking-wider mb-10" style={{ color: '#3a3228' }}>
        Recibirás un correo en {shipping.email}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href={`/pedidos/${pedidoId}`}
          className="font-raleway text-xs tracking-[0.3em] uppercase px-10 py-3 transition-all"
          style={{ background: '#c9a96e', color: '#080808' }}
          onMouseEnter={e => e.currentTarget.style.background = '#b8945a'}
          onMouseLeave={e => e.currentTarget.style.background = '#c9a96e'}
        >
          Rastrear mi pedido →
        </Link>
        <Link
          href="/"
          className="font-raleway text-xs tracking-[0.3em] uppercase px-10 py-3 transition-all"
          style={{ border: '1px solid #2a2416', color: '#6b5f4a' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a96e40'; e.currentTarget.style.color = '#c9a96e'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2416'; e.currentTarget.style.color = '#6b5f4a'; }}
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => step === 0 ? router.push('/carrito') : setStep(s => s - 1)}
        className="flex items-center gap-2 font-raleway text-xs tracking-widest uppercase mb-10 transition-colors"
        style={{ color: '#4a3f2e' }}
        onMouseEnter={e => e.currentTarget.style.color = '#c9a96e'}
        onMouseLeave={e => e.currentTarget.style.color = '#4a3f2e'}
      >
        <ArrowLeftIcon className="w-4 h-4" />
        {step === 0 ? 'Volver al carrito' : 'Paso anterior'}
      </button>

      <StepBar step={step} />

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left panel */}
        <div className="lg:col-span-2">

          {/* ── STEP 0: Shipping ────────────────────────────────────────────── */}
          {step === 0 && (
            <div className="p-8" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
              <h2 className="font-cormorant text-3xl font-light mb-8" style={{ color: '#f0ead6' }}>
                Datos de envío
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <LuxInput
                  label="Nombre completo"
                  value={shipping.nombre}
                  onChange={e => setShipping(s => ({ ...s, nombre: e.target.value }))}
                  error={shippingErrors.nombre}
                  placeholder="Ana García"
                />
                <LuxInput
                  label="Correo electrónico"
                  type="email"
                  value={shipping.email}
                  onChange={e => setShipping(s => ({ ...s, email: e.target.value }))}
                  error={shippingErrors.email}
                  placeholder="ana@ejemplo.com"
                />
                <LuxInput
                  label="Teléfono"
                  type="tel"
                  value={shipping.telefono}
                  onChange={e => setShipping(s => ({ ...s, telefono: e.target.value }))}
                  error={shippingErrors.telefono}
                  placeholder="+57 300 000 0000"
                />
                <LuxInput
                  label="Ciudad"
                  value={shipping.ciudad}
                  onChange={e => setShipping(s => ({ ...s, ciudad: e.target.value }))}
                  placeholder="Bogotá"
                />
                <div className="sm:col-span-2">
                  <LuxInput
                    label="Dirección de envío"
                    value={shipping.direccion}
                    onChange={e => setShipping(s => ({ ...s, direccion: e.target.value }))}
                    error={shippingErrors.direccion}
                    placeholder="Calle 123 #45-67, Apto 8"
                  />
                </div>
              </div>
              <button
                onClick={() => { if (validateShipping()) setStep(1); }}
                className="mt-8 w-full py-4 font-raleway text-xs tracking-[0.35em] uppercase transition-all flex items-center justify-center gap-3"
                style={{ background: '#c9a96e', color: '#080808' }}
                onMouseEnter={e => e.currentTarget.style.background = '#b8945a'}
                onMouseLeave={e => e.currentTarget.style.background = '#c9a96e'}
              >
                Continuar al pago <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 1: Payment ─────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="p-8" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
              <h2 className="font-cormorant text-3xl font-light mb-8" style={{ color: '#f0ead6' }}>
                Método de pago
              </h2>

              {/* Method selector */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
                {[
                  { id: 'tarjeta', icon: '💳', label: 'Tarjeta' },
                  { id: 'pse', icon: '🏦', label: 'PSE' },
                  { id: 'nequi', icon: '📱', label: 'Nequi' },
                  { id: 'daviplata', icon: '💙', label: 'Daviplata' },
                  { id: 'paypal', icon: '🌍', label: 'PayPal' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMetodoPago(m.id)}
                    className="flex flex-col items-center gap-2 py-4 px-2 transition-all"
                    style={metodoPago === m.id
                      ? { background: '#1a140a', border: '1px solid #c9a96e', color: '#c9a96e' }
                      : { background: '#111', border: '1px solid #1a1a1a', color: '#4a3f2e' }
                    }
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <span className="font-raleway text-xs tracking-wider">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* ── Tarjeta ── */}
              {metodoPago === 'tarjeta' && (
                <div className="space-y-5">
                  <AnimatedCard
                    numero={tarjeta.numero}
                    nombre={tarjeta.nombre}
                    expiry={tarjeta.expiry}
                    cvv={tarjeta.cvv}
                    showBack={cvvFocused}
                  />
                  <LuxInput
                    label="Número de tarjeta"
                    value={tarjeta.numero}
                    onChange={e => setTarjeta(t => ({ ...t, numero: formatCardNum(e.target.value) }))}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                  />
                  <LuxInput
                    label="Nombre en la tarjeta"
                    value={tarjeta.nombre}
                    onChange={e => setTarjeta(t => ({ ...t, nombre: e.target.value.toUpperCase() }))}
                    placeholder="ANA GARCÍA"
                  />
                  <div className="grid grid-cols-2 gap-5">
                    <LuxInput
                      label="Vencimiento"
                      value={tarjeta.expiry}
                      onChange={e => setTarjeta(t => ({ ...t, expiry: formatExpiry(e.target.value) }))}
                      placeholder="MM/AA"
                      maxLength={5}
                    />
                    <LuxInput
                      label="CVV"
                      value={tarjeta.cvv}
                      onChange={e => setTarjeta(t => ({ ...t, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      onFocus={() => setCvvFocused(true)}
                      onBlur={() => setCvvFocused(false)}
                      placeholder="•••"
                      maxLength={4}
                      type="password"
                    />
                  </div>
                </div>
              )}

              {/* ── PSE ── */}
              {metodoPago === 'pse' && (
                <div className="space-y-5">
                  <div
                    className="p-4 flex items-center gap-3"
                    style={{ background: '#0a0a04', border: '1px solid #2a2416' }}
                  >
                    <span className="text-2xl">🏦</span>
                    <div>
                      <p className="font-raleway text-xs font-semibold tracking-wider" style={{ color: '#c9a96e' }}>PSE — Pagos Seguros en Línea</p>
                      <p className="font-raleway text-xs mt-0.5" style={{ color: '#4a3f2e' }}>Transferencia bancaria directa desde Colombia</p>
                    </div>
                  </div>
                  <LuxSelect
                    label="Banco"
                    value={pse.banco}
                    onChange={e => setPse(p => ({ ...p, banco: e.target.value }))}
                  >
                    {BANCOS_PSE.map(b => <option key={b} value={b} style={{ background: '#0d0d0d' }}>{b}</option>)}
                  </LuxSelect>
                  <LuxSelect
                    label="Tipo de persona"
                    value={pse.tipo}
                    onChange={e => setPse(p => ({ ...p, tipo: e.target.value }))}
                  >
                    <option value="natural" style={{ background: '#0d0d0d' }}>Persona Natural</option>
                    <option value="juridica" style={{ background: '#0d0d0d' }}>Persona Jurídica</option>
                  </LuxSelect>
                  <LuxInput
                    label="Número de documento"
                    value={pse.documento}
                    onChange={e => setPse(p => ({ ...p, documento: e.target.value.replace(/\D/g, '') }))}
                    placeholder="1234567890"
                  />
                </div>
              )}

              {/* ── Nequi / Daviplata ── */}
              {(metodoPago === 'nequi' || metodoPago === 'daviplata') && (
                <div className="space-y-5">
                  <div
                    className="p-4 flex items-center gap-3"
                    style={{ background: '#0a0a04', border: '1px solid #2a2416' }}
                  >
                    <span className="text-3xl">{metodoPago === 'nequi' ? '📱' : '💙'}</span>
                    <div>
                      <p className="font-raleway text-xs font-semibold tracking-wider" style={{ color: '#c9a96e' }}>
                        {metodoPago === 'nequi' ? 'Nequi' : 'Daviplata'}
                      </p>
                      <p className="font-raleway text-xs mt-0.5" style={{ color: '#4a3f2e' }}>
                        Recibirás una notificación en tu app para aprobar el pago
                      </p>
                    </div>
                  </div>
                  <LuxInput
                    label="Número de celular"
                    type="tel"
                    value={celular}
                    onChange={e => setCelular(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="3001234567"
                    maxLength={10}
                  />
                </div>
              )}

              {/* ── PayPal ── */}
              {metodoPago === 'paypal' && (
                <div className="space-y-5">
                  <div
                    className="p-4 flex items-center gap-3"
                    style={{ background: '#0a0a04', border: '1px solid #2a2416' }}
                  >
                    <span className="text-2xl">🌍</span>
                    <div>
                      <p className="font-raleway text-xs font-semibold tracking-wider" style={{ color: '#c9a96e' }}>PayPal</p>
                      <p className="font-raleway text-xs mt-0.5" style={{ color: '#4a3f2e' }}>Pago internacional seguro</p>
                    </div>
                  </div>
                  <LuxInput
                    label="Correo de PayPal"
                    type="email"
                    value={emailPP}
                    onChange={e => setEmailPP(e.target.value)}
                    placeholder="tu@paypal.com"
                  />
                </div>
              )}

              {errorPago && (
                <div className="mt-4 p-4 flex items-center gap-3" style={{ background: '#1a0808', border: '1px solid #c04a4a40' }}>
                  <span style={{ color: '#c04a4a' }}>✕</span>
                  <p className="font-raleway text-xs" style={{ color: '#c04a4a' }}>{errorPago}</p>
                </div>
              )}

              <button
                onClick={handlePagar}
                disabled={enviando}
                className="mt-8 w-full py-4 font-raleway text-xs tracking-[0.35em] uppercase transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                style={{ background: '#c9a96e', color: '#080808' }}
                onMouseEnter={e => { if (!enviando) e.currentTarget.style.background = '#b8945a'; }}
                onMouseLeave={e => { if (!enviando) e.currentTarget.style.background = '#c9a96e'; }}
              >
                {enviando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Procesando pago...
                  </>
                ) : (
                  <>
                    <LockClosedIcon className="w-4 h-4" />
                    Pagar {formatPrecio(total)}
                  </>
                )}
              </button>

              <p className="text-center font-raleway text-xs mt-4 tracking-wider" style={{ color: '#2a2416' }}>
                🔒 Transacción cifrada SSL · Los datos de tu tarjeta no son almacenados
              </p>
            </div>
          )}
        </div>

        {/* Right panel — order summary */}
        <div>
          <div className="p-6 sticky top-28" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
            <h3 className="font-cormorant text-xl font-light mb-5" style={{ color: '#f0ead6' }}>Tu pedido</h3>
            <div className="space-y-3 mb-5">
              {items.map(item => (
                <div key={item.key} className="flex items-center gap-3">
                  <div
                    className="text-xl w-10 h-10 flex items-center justify-center flex-shrink-0"
                    style={{ background: '#111', border: '1px solid #1a1a1a' }}
                  >
                    {item.categoria === 'Camisetas' ? '👕' : item.categoria === 'Pantalones' ? '👖' : item.categoria === 'Vestidos' ? '👗' : item.categoria === 'Chaquetas' ? '🧥' : '🛍️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-raleway text-xs truncate" style={{ color: '#c9a96e' }}>{item.nombre}</p>
                    <p className="font-raleway text-xs" style={{ color: '#3a3228' }}>{item.talla} · ×{item.cantidad}</p>
                  </div>
                  <span className="font-raleway text-xs flex-shrink-0" style={{ color: '#6b5f4a' }}>
                    {formatPrecio(item.precio * item.cantidad)}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="pt-4 flex justify-between"
              style={{ borderTop: '1px solid #1a1a1a' }}
            >
              <span className="font-raleway text-xs tracking-[0.2em] uppercase" style={{ color: '#f0ead6' }}>Total</span>
              <span className="font-cormorant text-xl" style={{ color: '#c9a96e' }}>{formatPrecio(total)}</span>
            </div>
            {step === 1 && shipping.nombre && (
              <div className="mt-5 pt-5" style={{ borderTop: '1px solid #1a1a1a' }}>
                <p className="font-raleway text-xs tracking-[0.2em] uppercase mb-2" style={{ color: '#4a3f2e' }}>Enviar a</p>
                <p className="font-raleway text-xs" style={{ color: '#6b5f4a' }}>{shipping.nombre}</p>
                <p className="font-raleway text-xs" style={{ color: '#3a3228' }}>{shipping.direccion}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
