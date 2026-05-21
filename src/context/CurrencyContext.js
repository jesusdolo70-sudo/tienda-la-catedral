'use client';
import { createContext, useContext, useState, useEffect } from 'react';

export const CURRENCIES = [
  { code: 'COP', name: 'Peso Colombiano',     flag: '🇨🇴', locale: 'es-CO', decimals: 0 },
  { code: 'USD', name: 'Dólar Estadounidense', flag: '🇺🇸', locale: 'en-US', decimals: 2 },
  { code: 'EUR', name: 'Euro',                 flag: '🇪🇺', locale: 'es-ES', decimals: 2 },
  { code: 'MXN', name: 'Peso Mexicano',        flag: '🇲🇽', locale: 'es-MX', decimals: 2 },
  { code: 'ARS', name: 'Peso Argentino',       flag: '🇦🇷', locale: 'es-AR', decimals: 0 },
  { code: 'CLP', name: 'Peso Chileno',         flag: '🇨🇱', locale: 'es-CL', decimals: 0 },
  { code: 'PEN', name: 'Sol Peruano',          flag: '🇵🇪', locale: 'es-PE', decimals: 2 },
  { code: 'BRL', name: 'Real Brasileño',       flag: '🇧🇷', locale: 'pt-BR', decimals: 2 },
  { code: 'UYU', name: 'Peso Uruguayo',        flag: '🇺🇾', locale: 'es-UY', decimals: 0 },
  { code: 'BOB', name: 'Boliviano',            flag: '🇧🇴', locale: 'es-BO', decimals: 2 },
  { code: 'PYG', name: 'Guaraní Paraguayo',    flag: '🇵🇾', locale: 'es-PY', decimals: 0 },
  { code: 'GBP', name: 'Libra Esterlina',      flag: '🇬🇧', locale: 'en-GB', decimals: 2 },
  { code: 'CAD', name: 'Dólar Canadiense',     flag: '🇨🇦', locale: 'en-CA', decimals: 2 },
  { code: 'AUD', name: 'Dólar Australiano',    flag: '🇦🇺', locale: 'en-AU', decimals: 2 },
  { code: 'JPY', name: 'Yen Japonés',          flag: '🇯🇵', locale: 'ja-JP', decimals: 0 },
];

// Tasas de respaldo relativas a COP (actualizadas aprox. 2025)
const FALLBACK_RATES = {
  COP: 1,
  USD: 0.000240,
  EUR: 0.000221,
  MXN: 0.00490,
  ARS: 0.260,
  CLP: 0.260,
  PEN: 0.000889,
  BRL: 0.00133,
  UYU: 0.0100,
  BOB: 0.00166,
  PYG: 1.77,
  GBP: 0.000189,
  CAD: 0.000330,
  AUD: 0.000381,
  JPY: 0.0376,
};

const CACHE_KEY = 'imperial_fx_rates';
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [moneda, setMoneda] = useState('COP');
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [cargandoRates, setCargandoRates] = useState(false);

  // Cargar moneda guardada y tasas al inicio
  useEffect(() => {
    const savedMoneda = localStorage.getItem('imperial_moneda');
    if (savedMoneda && CURRENCIES.find(c => c.code === savedMoneda)) {
      setMoneda(savedMoneda);
    }
    cargarTasas();
  }, []);

  async function cargarTasas() {
    // Revisar caché
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { ts, data } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) {
          setRates(data);
          return;
        }
      }
    } catch {}

    setCargandoRates(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/COP', { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const json = await res.json();
        if (json.rates) {
          const nuevas = { COP: 1, ...json.rates };
          setRates(nuevas);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: nuevas }));
        }
      }
    } catch {
      // Silencioso — usa FALLBACK_RATES ya cargado
    } finally {
      setCargandoRates(false);
    }
  }

  function cambiarMoneda(code) {
    setMoneda(code);
    localStorage.setItem('imperial_moneda', code);
  }

  function formatPrecio(precioCOP) {
    const info = CURRENCIES.find(c => c.code === moneda) || CURRENCIES[0];
    const rate = rates[moneda] ?? FALLBACK_RATES[moneda] ?? 1;
    const convertido = precioCOP * rate;
    try {
      return new Intl.NumberFormat(info.locale, {
        style: 'currency',
        currency: moneda,
        maximumFractionDigits: info.decimals,
        minimumFractionDigits: info.decimals,
      }).format(convertido);
    } catch {
      return `${moneda} ${convertido.toFixed(info.decimals)}`;
    }
  }

  const monedaInfo = CURRENCIES.find(c => c.code === moneda) || CURRENCIES[0];

  return (
    <CurrencyContext.Provider value={{ moneda, monedaInfo, cambiarMoneda, formatPrecio, cargandoRates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
