'use client';
import { useEffect, useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CATEGORIAS = ['Camisetas', 'Pantalones', 'Vestidos', 'Chaquetas', 'Sudaderas', 'Camisas', 'Zapatos', 'Accesorios'];
const ESTADOS = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];
const ESTADO_COLORS = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  confirmado: 'bg-blue-100 text-blue-700',
  enviado: 'bg-indigo-100 text-indigo-700',
  entregado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
};

const PRODUCTO_VACIO = { nombre: '', descripcion: '', precio: '', categoria: 'Camisetas', tallas: '', colores: '', stock: '' };

export default function AdminPage() {
  const [tab, setTab] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(PRODUCTO_VACIO);
  const [guardando, setGuardando] = useState(false);

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
      setForm({ ...producto, tallas: tallas.join(', '), colores: colores.join(', ') });
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
    if (!confirm('¿Eliminar este producto?')) return;
    await fetch(`/api/productos/${id}`, { method: 'DELETE' });
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
    if (!confirm('¿Eliminar este pedido?')) return;
    await fetch(`/api/pedidos/${id}`, { method: 'DELETE' });
    cargarPedidos();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {['productos', 'pedidos'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 font-medium capitalize transition border-b-2 -mb-px ${
              tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t} {t === 'pedidos' && pedidos.filter(p => p.estado === 'pendiente').length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                {pedidos.filter(p => p.estado === 'pendiente').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Productos */}
      {tab === 'productos' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => abrirModal()} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition">
              <PlusIcon className="w-5 h-5" /> Nuevo producto
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Producto</th>
                  <th className="px-4 py-3 text-left">Categoría</th>
                  <th className="px-4 py-3 text-right">Precio</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {productos.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.nombre}</td>
                    <td className="px-4 py-3 text-gray-500">{p.categoria}</td>
                    <td className="px-4 py-3 text-right text-indigo-600 font-semibold">${Number(p.precio).toLocaleString('es-CO')}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{p.stock}</td>
                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                      <button onClick={() => abrirModal(p)} className="text-blue-500 hover:text-blue-700 p-1 transition">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => eliminarProducto(p.id)} className="text-red-400 hover:text-red-600 p-1 transition">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Pedidos */}
      {tab === 'pedidos' && (
        <div className="space-y-4">
          {pedidos.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No hay pedidos aún</p>
          ) : pedidos.map(pedido => {
            const items = typeof pedido.items === 'string' ? JSON.parse(pedido.items) : pedido.items;
            return (
              <div key={pedido.id} className="bg-white rounded-2xl shadow p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-gray-800">Pedido #{pedido.id}</p>
                    <p className="text-sm text-gray-500">{pedido.cliente_nombre} · {pedido.cliente_email}</p>
                    {pedido.cliente_telefono && <p className="text-sm text-gray-400">{pedido.cliente_telefono}</p>}
                    {pedido.direccion && <p className="text-sm text-gray-400">{pedido.direccion}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(pedido.creado_en).toLocaleString('es-CO')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ESTADO_COLORS[pedido.estado]}`}>
                      {pedido.estado}
                    </span>
                    <select
                      value={pedido.estado}
                      onChange={e => cambiarEstado(pedido.id, e.target.value)}
                      className="text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <button onClick={() => eliminarPedido(pedido.id)} className="text-red-400 hover:text-red-600">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="border-t pt-3 space-y-1">
                  {items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-gray-600">
                      <span>{item.nombre} ({item.talla}, {item.color}) x{item.cantidad}</span>
                      <span>${(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-gray-800 border-t pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-indigo-600">${Number(pedido.total).toLocaleString('es-CO')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal producto */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{editando ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button onClick={() => setModal(false)}><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={guardarProducto} className="space-y-3">
              {[
                { key: 'nombre', label: 'Nombre', type: 'text' },
                { key: 'descripcion', label: 'Descripción', type: 'text' },
                { key: 'precio', label: 'Precio (COP)', type: 'number' },
                { key: 'stock', label: 'Stock', type: 'number' },
                { key: 'tallas', label: 'Tallas (separadas por coma)', type: 'text' },
                { key: 'colores', label: 'Colores (separados por coma)', type: 'text' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
                  <input
                    type={type}
                    required={['nombre', 'precio'].includes(key)}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Categoría</label>
                <select
                  value={form.categoria}
                  onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 border rounded-xl py-2.5 font-medium text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 font-medium hover:bg-indigo-700 disabled:opacity-50">
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
