import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request, { params }) {
  const db = getDb();
  const { id } = await params;
  const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
  if (!producto) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(producto);
}

export async function PUT(request, { params }) {
  const db = getDb();
  const { id } = await params;
  const body = await request.json();
  const { nombre, descripcion, precio, categoria, tallas, colores, stock, imagen } = body;

  db.prepare(`
    UPDATE productos SET nombre=?, descripcion=?, precio=?, categoria=?, tallas=?, colores=?, stock=?, imagen=?
    WHERE id=?
  `).run(
    nombre, descripcion, Number(precio), categoria,
    JSON.stringify(tallas || []), JSON.stringify(colores || []),
    Number(stock) || 0, imagen, id
  );

  const actualizado = db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
  return NextResponse.json(actualizado);
}

export async function DELETE(request, { params }) {
  const db = getDb();
  const { id } = await params;
  db.prepare('DELETE FROM productos WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}
