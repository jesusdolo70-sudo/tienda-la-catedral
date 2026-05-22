'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIAS = ['Camisetas', 'Pantalones', 'Vestidos', 'Chaquetas', 'Sudaderas', 'Camisas', 'Zapatos', 'Accesorios'];
const ESTADOS = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];

const ESTADO_STYLES = {
  pendiente:   { bg: '#2a1a00', text: '#f59e0b', border: '#f59e0b30' },
  confirmado:  { bg: '#001a2a', text: '#38bdf8', border: '#38bdf830' },
  enviado:     { bg: '#0d1a2a', text: '#818cf8', border: '#818cf830' },
  entregado:   { bg: '#001a0a', text: '#4ade80', border: '#4ade8030' },
  cancelado:   { bg: '#1a0000', text: '#f87171', border: '#f8717130' },
};

const PRODUCTO_VACIO = {
  nombre: '', descripcion: '', precio: '', categoria: 'Camisetas',
  tallas: '', colores: '', stock: '', imagen: '', exclusivo: 0,
};

function GoldDivider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #c9a96e30)' }} />
      <span style={{ color: '#c9a96e40', fontSize: '8px' }}>◆</span>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #c9a96e30, transparent)' }} />
    </div>
  );
}

function StatCard({ label, value, sub, color = '#c9a96e' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-5 overflow-hidden"
      style={{ background: '#0d0d0d', border: '1px solid #1e1e1e' }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }} />
      <p className="font-raleway text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#4a3f2e' }}>{label}</p>
      <p className="font-cormorant text-4xl font-light" style={{ color }}>{value}</p>
      {sub && <p className="font-raleway text-xs mt-1" style={{ color: '#3a3228' }}>{sub}</p>}
    </motion.div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState('dashboard');
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(PRODUCTO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function cerrarSesion() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  }

  useEffect(() => {
    cargarProductos();
    cargarPedidos();
  }, []);

  async function cargarProductos() {
    const data = await fetch('/api/productos').then(r => r.json());
    setProductos(data);
  }

  async function cargarPedidos() {
    const data = await fetch('/api/pedidos').then(r => r.json());
    setPedidos(data);
  }

  function abrirModal(producto = null) {
    if (producto) {
      const tallas = typeof producto.tallas === 'string' ? JSON.parse(producto.tallas) : producto.tallas;
      const colores = typeof producto.colores === 'string' ? JSON.parse(producto.colores) : producto.colores;
      setForm({ ...producto, tallas: tallas.join(', '), colores: colores.join(', '), exclusivo: producto.exclusivo ?? 0 });
      setEditando(producto.id);
    } else {
      setForm(PRODUCTO_VACIO);
      setEditando(null);
    }
    setModal(true);
  }

  async function guardarProducto(e) {
    e.preventDefault();
    setGuardando(true);
    const body = {
      ...form,
      precio: Number(form.precio),
      stock: Number(form.stock),
      exclusivo: form.exclusivo ? 1 : 0,
      tallas: form.tallas.split(',').map(s => s.trim()).filter(Boolean),
      colores: form.colores.split(',').map(s => s.trim()).filter(Boolean),
    };
    const url = editando ? `/api/productos/${editando}` : '/api/productos';
    const method = editando ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setModal(false);
    setGuardando(false);
    cargarProductos();
  }

  async function eliminarProducto(id) {
    await fetch(`/api/productos/${id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    cargarProductos();
  }

  async function cambiarEstado(pedidoId, estado) {
    await fetch(`/api/pedidos/${pedidoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    cargarPedidos();
  }

  async function eliminarPedido(id) {
    await fetch(`/api/pedidos/${id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    cargarPedidos();
  }

  // Métricas
  const totalIngresos = pedidos.filter(p => p.estado !== 'cancelado').reduce((s, p) => s + Number(p.total), 0);
  const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;
  const stockBajo = productos.filter(p => p.stock <= 5).length;

  const TABS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'productos', label: 'Productos' },
    {
      id: 'pedidos', label: 'Pedidos',
      badge: pendientes > 0 ? pendientes : null,
    },
  ];

  return (
    <div style={{ minHeight: '60vh' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <div className="w-6 h-px" style={{ background: '#c9a96e' }} />
            <h1 className="font-cormorant text-3xl font-light tracking-wide" style={{ color: '#f0ead6' }}>
              Panel de Administración
            </h1>
          </div>
          <p className="font-raleway text-xs tracking-[0.25em] uppercase ml-10" style={{ color: '#4a3f2e' }}>
            Imperial · Gestión interna
          </p>
        </div>
        <button
          onClick={cerrarSesion}
          className="font-raleway text-xs tracking-[0.2em] uppercase px-4 py-2 transition-colors"
          style={{ border: '1px solid #1e1e1e', color: '#3a3228' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#f8717130'; e.currentTarget.style.color = '#f87171'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = '#3a3228'; }}
        >
          Salir →
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-8" style={{ borderBottom: '1px solid #1e1e1e' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative flex items-center gap-2 px-6 py-3 font-raleway text-xs tracking-[0.2em] uppercase transition-colors"
            style={{ color: tab === t.id ? '#c9a96e' : '#4a3f2e' }}
          >
            {t.label}
            {t.badge && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"
                style={{ background: '#c9a96e', color: '#050505' }}>
                {t.badge}
              </span>
            )}
            {tab === t.id && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: '#c9a96e' }} />
            )}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ─────────────────────────────────────────────────────────── */}
      {tab === 'dashboard' && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <StatCard label="Productos" value={productos.length} sub="en catálogo" />
            <StatCard label="Pedidos" value={pedidos.length} sub="totales" />
            <StatCard
              label="Ingresos"
              value={`$${Math.round(totalIngresos / 1000)}k`}
              sub="pedidos no cancelados"
              color="#4ade80"
            />
            <StatCard
              label="Pendientes"
              value={pendientes}
              sub="por confirmar"
              color={pendientes > 0 ? '#f59e0b' : '#4a3f2e'}
            />
          </div>

          {stockBajo > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-3 px-5 py-4 mb-6"
              style={{ background: '#1a0a00', border: '1px solid #f59e0b20' }}>
              <div className="w-1 h-6 flex-shrink-0" style={{ background: '#f59e0b' }} />
              <p className="font-raleway text-xs tracking-wide" style={{ color: '#f59e0b' }}>
                {stockBajo} producto{stockBajo > 1 ? 's' : ''} con stock bajo (≤ 5 unidades)
              </p>
              <button onClick={() => setTab('productos')}
                className="ml-auto font-raleway text-xs tracking-widest uppercase"
                style={{ color: '#f59e0b80' }}>
                ver →
              </button>
            </motion.div>
          )}

          <GoldDivider />

          {/* Últimos pedidos */}
          <div className="mb-3 flex items-center gap-4">
            <div className="w-4 h-px" style={{ background: '#c9a96e' }} />
            <h2 className="font-cormorant text-2xl font-light" style={{ color: '#f0ead6' }}>Últimos pedidos</h2>
          </div>
          {pedidos.slice(0, 5).map(pedido => {
            const s = ESTADO_STYLES[pedido.estado] || ESTADO_STYLES.pendiente;
            return (
              <div key={pedido.id} className="flex items-center justify-between px-5 py-4 mb-2"
                style={{ background: '#0d0d0d', border: '1px solid #1e1e1e' }}>
                <div>
                  <p className="font-raleway text-sm" style={{ color: '#c9a96e60' }}>#{pedido.id}</p>
                  <p className="font-raleway text-xs" style={{ color: '#6b5f4a' }}>{pedido.cliente_nombre}</p>
                </div>
                <div className="text-right">
                  <p className="font-cormorant text-lg font-light" style={{ color: '#f0ead6' }}>
                    ${Number(pedido.total).toLocaleString('es-CO')}
                  </p>
                  <span className="font-raleway text-xs px-2 py-0.5"
                    style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
                    {pedido.estado}
                  </span>
                </div>
              </div>
            );
          })}
          {pedidos.length > 5 && (
            <button onClick={() => setTab('pedidos')}
              className="w-full py-3 font-raleway text-xs tracking-widest uppercase mt-2"
              style={{ color: '#4a3f2e', border: '1px solid #1a1a1a' }}>
              ver todos los pedidos →
            </button>
          )}
        </div>
      )}

      {/* ── PRODUCTOS ─────────────────────────────────────────────────────────── */}
      {tab === 'productos' && (
        <div>
          <div className="flex justify-end mb-5">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => abrirModal()}
              className="flex items-center gap-2 px-5 py-2.5 font-raleway text-xs tracking-[0.2em] uppercase"
              style={{ background: '#c9a96e', color: '#050505', fontWeight: '600' }}>
              <PlusIcon className="w-4 h-4" /> Nuevo producto
            </motion.button>
          </div>

          <div style={{ border: '1px solid #1e1e1e' }}>
            {/* Cabecera tabla */}
            <div className="grid font-raleway text-xs tracking-[0.15em] uppercase px-4 py-3"
              style={{ color: '#4a3f2e', borderBottom: '1px solid #1e1e1e', background: '#080808',
                gridTemplateColumns: '56px 1fr 100px 80px 70px 70px 80px' }}>
              <span></span>
              <span>Producto</span>
              <span>Categoría</span>
              <span className="text-right">Precio</span>
              <span className="text-right">Stock</span>
              <span className="text-center">Excl.</span>
              <span className="text-center">Acciones</span>
            </div>

            {productos.map((p, i) => {
              const stockLow = p.stock <= 5;
              return (
                <motion.div key={p.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="grid items-center px-4 py-3"
                  style={{ borderBottom: '1px solid #141414', background: i % 2 === 0 ? '#0a0a0a' : '#080808',
                    gridTemplateColumns: '56px 1fr 100px 80px 70px 70px 80px' }}>

                  {/* Thumbnail */}
                  <div className="w-10 h-10 overflow-hidden flex-shrink-0"
                    style={{ border: '1px solid #1e1e1e' }}>
                    {p.imagen ? (
                      <img src={p.imagen} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" style={{ background: '#1a1a1a' }} />
                    )}
                  </div>

                  {/* Nombre */}
                  <div>
                    <p className="font-raleway text-sm" style={{ color: '#f0ead6' }}>{p.nombre}</p>
                    <p className="font-raleway text-xs truncate max-w-xs" style={{ color: '#3a3228' }}>{p.categoria}</p>
                  </div>

                  {/* Categoría */}
                  <p className="font-raleway text-xs" style={{ color: '#6b5f4a' }}>{p.categoria}</p>

                  {/* Precio */}
                  <p className="text-right font-cormorant text-lg font-light" style={{ color: '#c9a96e' }}>
                    ${Number(p.precio).toLocaleString('es-CO')}
                  </p>

                  {/* Stock */}
                  <p className="text-right font-raleway text-sm" style={{ color: stockLow ? '#f59e0b' : '#6b5f4a' }}>
                    {p.stock}
                  </p>

                  {/* Exclusivo */}
                  <div className="flex justify-center">
                    {p.exclusivo ? (
                      <span className="font-raleway text-xs px-2 py-0.5" style={{ background: '#1a0d00', color: '#c9a96e', border: '1px solid #c9a96e30' }}>✦</span>
                    ) : (
                      <span style={{ color: '#2a2520' }}>—</span>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex justify-center gap-1">
                    <button onClick={() => abrirModal(p)}
                      className="p-1.5 transition-colors"
                      style={{ color: '#4a3f2e' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#c9a96e'}
                      onMouseLeave={e => e.currentTarget.style.color = '#4a3f2e'}>
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmDelete({ tipo: 'producto', id: p.id, nombre: p.nombre })}
                      className="p-1.5 transition-colors"
                      style={{ color: '#4a3f2e' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                      onMouseLeave={e => e.currentTarget.style.color = '#4a3f2e'}>
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {productos.length === 0 && (
              <div className="py-16 text-center">
                <p className="font-cormorant text-4xl mb-2" style={{ color: '#2a2520' }}>∅</p>
                <p className="font-raleway text-xs tracking-widest uppercase" style={{ color: '#3a3228' }}>Sin productos</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PEDIDOS ───────────────────────────────────────────────────────────── */}
      {tab === 'pedidos' && (
        <div className="space-y-3">
          {pedidos.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-cormorant text-4xl mb-2" style={{ color: '#2a2520' }}>∅</p>
              <p className="font-raleway text-xs tracking-widest uppercase" style={{ color: '#3a3228' }}>No hay pedidos aún</p>
            </div>
          ) : pedidos.map(pedido => {
            const items = typeof pedido.items === 'string' ? JSON.parse(pedido.items) : pedido.items;
            const s = ESTADO_STYLES[pedido.estado] || ESTADO_STYLES.pendiente;
            return (
              <motion.div key={pedido.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: '#0d0d0d', border: '1px solid #1e1e1e' }}>

                {/* Encabezado pedido */}
                <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4"
                  style={{ borderBottom: '1px solid #161616' }}>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-cormorant text-xl font-light" style={{ color: '#f0ead6' }}>
                        Pedido <span style={{ color: '#c9a96e' }}>#{pedido.id}</span>
                      </p>
                      <span className="font-raleway text-xs px-2 py-0.5"
                        style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
                        {pedido.estado}
                      </span>
                    </div>
                    <p className="font-raleway text-xs" style={{ color: '#6b5f4a' }}>
                      {pedido.cliente_nombre} · {pedido.cliente_email}
                    </p>
                    {pedido.cliente_telefono && (
                      <p className="font-raleway text-xs" style={{ color: '#4a3f2e' }}>{pedido.cliente_telefono}</p>
                    )}
                    {pedido.direccion && (
                      <p className="font-raleway text-xs" style={{ color: '#4a3f2e' }}>{pedido.direccion}</p>
                    )}
                    <p className="font-raleway text-xs mt-1" style={{ color: '#3a3228' }}>
                      {new Date(pedido.creado_en).toLocaleString('es-CO')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Selector de estado */}
                    <select
                      value={pedido.estado}
                      onChange={e => cambiarEstado(pedido.id, e.target.value)}
                      className="font-raleway text-xs px-3 py-1.5 focus:outline-none"
                      style={{ background: '#1a1a1a', color: '#c9a96e', border: '1px solid #2a2520' }}>
                      {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <button onClick={() => setConfirmDelete({ tipo: 'pedido', id: pedido.id, nombre: `Pedido #${pedido.id}` })}
                      className="p-1.5 transition-colors" style={{ color: '#3a3228' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                      onMouseLeave={e => e.currentTarget.style.color = '#3a3228'}>
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Items del pedido */}
                <div className="px-5 py-4 space-y-1.5">
                  {items.map((item, i) => (
                    <div key={i} className="flex justify-between font-raleway text-xs"
                      style={{ color: '#6b5f4a' }}>
                      <span>{item.nombre} <span style={{ color: '#3a3228' }}>({item.talla}, {item.color}) ×{item.cantidad}</span></span>
                      <span style={{ color: '#c9a96e60' }}>${(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3" style={{ borderTop: '1px solid #1a1a1a' }}>
                    <span className="font-raleway text-xs tracking-widest uppercase" style={{ color: '#4a3f2e' }}>Total</span>
                    <span className="font-cormorant text-xl font-light" style={{ color: '#c9a96e' }}>
                      ${Number(pedido.total).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── MODAL PRODUCTO ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            onClick={e => e.target === e.currentTarget && setModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
              style={{ background: '#0d0d0d', border: '1px solid #2a2520' }}>

              {/* Header modal */}
              <div className="flex justify-between items-center px-6 py-5"
                style={{ borderBottom: '1px solid #1a1a1a' }}>
                <div>
                  <p className="font-raleway text-xs tracking-[0.3em] uppercase mb-0.5" style={{ color: '#4a3f2e' }}>
                    {editando ? 'Editar' : 'Crear'}
                  </p>
                  <h2 className="font-cormorant text-2xl font-light" style={{ color: '#f0ead6' }}>
                    {editando ? 'Modificar producto' : 'Nuevo producto'}
                  </h2>
                </div>
                <button onClick={() => setModal(false)} style={{ color: '#4a3f2e' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#c9a96e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#4a3f2e'}>
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={guardarProducto} className="px-6 py-5 space-y-4">
                {/* Nombre */}
                <FormField label="Nombre" required>
                  <input type="text" required value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="ej. Camiseta Oversized Blanca" />
                </FormField>

                {/* Descripción */}
                <FormField label="Descripción">
                  <textarea rows={3} value={form.descripcion}
                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                    placeholder="Descripción de la prenda..." />
                </FormField>

                {/* Precio y Stock */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Precio (COP)" required>
                    <input type="number" required min="0" value={form.precio}
                      onChange={e => setForm(f => ({ ...f, precio: e.target.value }))}
                      placeholder="89900" />
                  </FormField>
                  <FormField label="Stock">
                    <input type="number" min="0" value={form.stock}
                      onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                      placeholder="0" />
                  </FormField>
                </div>

                {/* Categoría */}
                <FormField label="Categoría">
                  <select value={form.categoria}
                    onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                    {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </FormField>

                {/* Tallas */}
                <FormField label="Tallas (separadas por coma)">
                  <input type="text" value={form.tallas}
                    onChange={e => setForm(f => ({ ...f, tallas: e.target.value }))}
                    placeholder="XS, S, M, L, XL" />
                </FormField>

                {/* Colores */}
                <FormField label="Colores (separados por coma)">
                  <input type="text" value={form.colores}
                    onChange={e => setForm(f => ({ ...f, colores: e.target.value }))}
                    placeholder="Negro, Blanco, Gris" />
                </FormField>

                {/* Imagen URL */}
                <FormField label="URL de imagen">
                  <input type="text" value={form.imagen}
                    onChange={e => setForm(f => ({ ...f, imagen: e.target.value }))}
                    placeholder="https://..." />
                </FormField>

                {/* Preview imagen */}
                {form.imagen && (
                  <div className="w-full h-32 overflow-hidden" style={{ border: '1px solid #1e1e1e' }}>
                    <img src={form.imagen} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Exclusivo toggle */}
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ background: '#080808', border: '1px solid #1a1a1a' }}>
                  <div>
                    <p className="font-raleway text-xs tracking-[0.2em] uppercase" style={{ color: '#6b5f4a' }}>Pieza Única / Exclusivo</p>
                    <p className="font-raleway text-xs mt-0.5" style={{ color: '#3a3228' }}>Aparecerá en la sección "Piezas Únicas"</p>
                  </div>
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, exclusivo: f.exclusivo ? 0 : 1 }))}
                    className="w-12 h-6 relative flex-shrink-0 transition-colors"
                    style={{
                      background: form.exclusivo ? '#c9a96e' : '#1a1a1a',
                      border: `1px solid ${form.exclusivo ? '#c9a96e' : '#2a2520'}`,
                    }}>
                    <span className="absolute top-0.5 transition-all"
                      style={{
                        width: 20, height: 20, background: form.exclusivo ? '#050505' : '#3a3228',
                        left: form.exclusivo ? 'calc(100% - 22px)' : 2,
                      }} />
                  </button>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)}
                    className="flex-1 py-3 font-raleway text-xs tracking-[0.2em] uppercase transition-colors"
                    style={{ border: '1px solid #2a2520', color: '#4a3f2e' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a96e40'; e.currentTarget.style.color = '#c9a96e'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2520'; e.currentTarget.style.color = '#4a3f2e'; }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={guardando}
                    className="flex-1 py-3 font-raleway text-xs tracking-[0.2em] uppercase font-semibold disabled:opacity-40"
                    style={{ background: '#c9a96e', color: '#050505' }}>
                    {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear producto'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL CONFIRMAR ELIMINACIÓN ───────────────────────────────────────── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,0.85)' }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-sm p-6"
              style={{ background: '#0d0d0d', border: '1px solid #3a1a1a' }}>
              <div className="w-1 h-8 mb-5" style={{ background: '#f87171' }} />
              <p className="font-cormorant text-2xl font-light mb-1" style={{ color: '#f0ead6' }}>¿Eliminar?</p>
              <p className="font-raleway text-xs mb-6" style={{ color: '#6b5f4a' }}>{confirmDelete.nombre}</p>
              <p className="font-raleway text-xs mb-6" style={{ color: '#4a3028' }}>Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 font-raleway text-xs tracking-[0.2em] uppercase"
                  style={{ border: '1px solid #2a2520', color: '#4a3f2e' }}>
                  Cancelar
                </button>
                <button
                  onClick={() => confirmDelete.tipo === 'producto'
                    ? eliminarProducto(confirmDelete.id)
                    : eliminarPedido(confirmDelete.id)}
                  className="flex-1 py-3 font-raleway text-xs tracking-[0.2em] uppercase font-semibold"
                  style={{ background: '#3a0a0a', color: '#f87171', border: '1px solid #f8717130' }}>
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Campo de formulario estilizado
function FormField({ label, required, children }) {
  const inputStyle = {
    background: '#080808',
    border: '1px solid #1e1e1e',
    color: '#f0ead6',
    width: '100%',
    padding: '10px 12px',
    fontSize: '13px',
    fontFamily: 'var(--font-raleway)',
    outline: 'none',
    resize: 'vertical',
  };

  return (
    <div>
      <label className="font-raleway text-xs tracking-[0.15em] uppercase block mb-1.5" style={{ color: '#4a3f2e' }}>
        {label}{required && <span style={{ color: '#c9a96e' }}> *</span>}
      </label>
      {typeof children === 'object'
        ? React.cloneElement(children, {
            style: { ...inputStyle, ...(children.props.style || {}) },
            onFocus: e => { e.target.style.borderColor = '#c9a96e40'; },
            onBlur: e => { e.target.style.borderColor = '#1e1e1e'; },
          })
        : children}
    </div>
  );
}
