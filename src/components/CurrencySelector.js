'use client';
import { useState, useRef, useEffect } from 'react';
import { useCurrency, CURRENCIES } from '@/context/CurrencyContext';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function CurrencySelector() {
  const { moneda, monedaInfo, cambiarMoneda, cargandoRates } = useCurrency();
  const [open, setOpen] = useState(false);
  const [buscar, setBuscar] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const latam = ['COP', 'USD', 'MXN', 'ARS', 'CLP', 'PEN', 'BRL', 'UYU', 'BOB', 'PYG'];

  const filtradas = CURRENCIES.filter(c =>
    c.name.toLowerCase().includes(buscar.toLowerCase()) ||
    c.code.toLowerCase().includes(buscar.toLowerCase())
  );

  const ordenadas = [
    ...filtradas.filter(c => latam.includes(c.code)),
    ...filtradas.filter(c => !latam.includes(c.code)),
  ];

  return (
    <div ref={ref} className="relative">
      {/* Botón trigger */}
      <button
        onClick={() => { setOpen(v => !v); setBuscar(''); }}
        className="flex items-center gap-1.5 px-3 py-1.5 font-raleway text-xs tracking-wider uppercase transition-colors"
        style={{
          border: '1px solid #2a2416',
          background: '#0d0d0d',
          color: '#6b5f4a',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a96e40'; e.currentTarget.style.color = '#c9a96e'; }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.borderColor = '#2a2416'; e.currentTarget.style.color = '#6b5f4a'; } }}
      >
        <GlobeAltIcon className="w-3.5 h-3.5" />
        <span>{monedaInfo.flag}</span>
        <span style={{ color: '#c9a96e' }}>{moneda}</span>
        {cargandoRates && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#c9a96e' }} />}
        <ChevronDownIcon className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 z-50 overflow-hidden"
          style={{ background: '#0d0d0d', border: '1px solid #2a2416', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
        >
          {/* Buscador */}
          <div className="p-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
            <input
              type="text"
              placeholder="Buscar moneda..."
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
              autoFocus
              className="w-full font-raleway text-xs tracking-wide px-3 py-2 focus:outline-none"
              style={{
                background: '#141414',
                border: '1px solid #2a2416',
                color: '#f0ead6',
              }}
            />
          </div>

          {/* Etiqueta grupo */}
          {!buscar && (
            <div className="px-4 pt-3 pb-1">
              <p className="font-raleway text-xs tracking-[0.3em] uppercase" style={{ color: '#4a3f2e' }}>Latinoamérica</p>
            </div>
          )}

          {/* Lista */}
          <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
            {ordenadas.length === 0 ? (
              <p className="text-center font-raleway text-xs py-6" style={{ color: '#4a3f2e' }}>Sin resultados</p>
            ) : ordenadas.map((c, idx) => {
              const esGlobal = !latam.includes(c.code);
              const anteriorEsLatam = idx > 0 && latam.includes(ordenadas[idx - 1].code);
              return (
                <div key={c.code}>
                  {!buscar && esGlobal && anteriorEsLatam && (
                    <div className="px-4 pt-3 pb-1" style={{ borderTop: '1px solid #1a1a1a' }}>
                      <p className="font-raleway text-xs tracking-[0.3em] uppercase" style={{ color: '#4a3f2e' }}>Otras monedas</p>
                    </div>
                  )}
                  <button
                    onClick={() => { cambiarMoneda(c.code); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={moneda === c.code
                      ? { background: '#1a1408', color: '#c9a96e' }
                      : { color: '#6b5f4a' }
                    }
                    onMouseEnter={e => { if (moneda !== c.code) e.currentTarget.style.background = '#141414'; }}
                    onMouseLeave={e => { if (moneda !== c.code) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span className="text-lg">{c.flag}</span>
                    <div className="flex-1 min-w-0">
                      <span className="block font-raleway text-xs font-medium tracking-wider">{c.code}</span>
                      <span className="block font-raleway text-xs truncate" style={{ color: '#3a3228' }}>{c.name}</span>
                    </div>
                    {moneda === c.code && (
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#c9a96e' }} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 text-center" style={{ borderTop: '1px solid #1a1a1a', background: '#080808' }}>
            <p className="font-raleway text-xs tracking-widest uppercase" style={{ color: '#3a3228' }}>
              {cargandoRates ? 'Actualizando...' : 'Tasas en tiempo real'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
