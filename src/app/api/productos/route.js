import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get('categoria');
  const buscar = searchParams.get('buscar');

  let query = 'SELECT * FROM productos WHERE 1=1';
  const params = [];

  if (categoria) {
    query += ' AND categoria = ?';
    params.push(categoria);
  }
  if (buscar) {
    query += ' AND (nombre LIKE ? OR descripcion LIKE ?)';
    params.push(`%${buscar}%`, `%${buscar}%`);
  }
  query += ' ORDER BY creado_en DESC';

  const productos = db.prepare(query).all(...params);
  return NextResponse.json(productos);
}

export async function POST(request) {
  const db = getDb();
  const body = await request.json();
  const { nombre, descripcion, precio, categoria, tallas, colores, stock, imagen } = body;

  if (!nombre || !precio || !categoria) {
    return NextResponse.json({ error: 'Nombre, precio y categoría son requeridos' }, { status: 400 });
  }

  const result = db.prepare(`
    INSERT INTO productos (nombre, descripcion, precio, categoria, tallas, colores, stock, imagen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    nombre,
    descripcion || '',
    Number(precio),
    categoria,
    JSON.stringify(tallas || []),
    JSON.stringify(colores || []),
    Number(stock) || 0,
    imagen || '/placeholder.jpg'
  );

  const nuevo = db.prepare('SELECT * FROM productos WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(nuevo, { status: 201 });
}
