import { NextResponse } from 'next/server';
import { sql, getDb } from '@/lib/db';

export async function GET(request, { params }) {
  await getDb();
  const { id } = await params;
  const [producto] = await sql`SELECT * FROM productos WHERE id = ${id}`;
  if (!producto) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(producto);
}

export async function PUT(request, { params }) {
  await getDb();
  const { id } = await params;
  const body = await request.json();
  const { nombre, descripcion, precio, categoria, tallas, colores, stock, imagen } = body;

  const [actualizado] = await sql`
    UPDATE productos SET
      nombre = ${nombre}, descripcion = ${descripcion},
      precio = ${Number(precio)}, categoria = ${categoria},
      tallas = ${JSON.stringify(tallas || [])}, colores = ${JSON.stringify(colores || [])},
      stock = ${Number(stock) || 0}, imagen = ${imagen}
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json(actualizado);
}

export async function DELETE(request, { params }) {
  await getDb();
  const { id } = await params;
  await sql`DELETE FROM productos WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
