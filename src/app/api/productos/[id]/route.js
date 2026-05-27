import { NextResponse } from 'next/server';
import { sql, getDb } from '@/lib/db';

function parseProducto(p) {
  return {
    ...p,
    imagenes: typeof p.imagenes === 'string' ? JSON.parse(p.imagenes || '[]') : (p.imagenes || []),
  };
}

export async function GET(request, { params }) {
  await getDb();
  const { id } = await params;
  const [producto] = await sql`SELECT * FROM productos WHERE id = ${id}`;
  if (!producto) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(parseProducto(producto));
}

export async function PUT(request, { params }) {
  await getDb();
  const { id } = await params;
  const body = await request.json();
  const { nombre, descripcion, precio, categoria, tallas, colores, stock, imagen, imagenes, exclusivo } = body;

  const todasImagenes = imagenes?.length ? imagenes : (imagen ? [imagen] : []);

  const [actualizado] = await sql`
    UPDATE productos SET
      nombre = ${nombre}, descripcion = ${descripcion},
      precio = ${Number(precio)}, categoria = ${categoria},
      tallas = ${JSON.stringify(tallas || [])}, colores = ${JSON.stringify(colores || [])},
      stock = ${Number(stock) || 0}, imagen = ${imagen},
      imagenes = ${JSON.stringify(todasImagenes)},
      exclusivo = ${exclusivo ? 1 : 0}
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json(parseProducto(actualizado));
}

export async function DELETE(request, { params }) {
  await getDb();
  const { id } = await params;
  await sql`DELETE FROM productos WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
