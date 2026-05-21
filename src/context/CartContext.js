'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('carrito');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items));
  }, [items]);

  function agregar(producto, talla, color, cantidad = 1) {
    setItems(prev => {
      const key = `${producto.id}-${talla}-${color}`;
      const existe = prev.find(i => i.key === key);
      if (existe) {
        return prev.map(i => i.key === key ? { ...i, cantidad: i.cantidad + cantidad } : i);
      }
      return [...prev, { ...producto, talla, color, cantidad, key }];
    });
  }

  function quitar(key) {
    setItems(prev => prev.filter(i => i.key !== key));
  }

  function actualizar(key, cantidad) {
    if (cantidad <= 0) return quitar(key);
    setItems(prev => prev.map(i => i.key === key ? { ...i, cantidad } : i));
  }

  function vaciar() {
    setItems([]);
  }

  const total = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  const cantidad = items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, agregar, quitar, actualizar, vaciar, total, cantidad }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
