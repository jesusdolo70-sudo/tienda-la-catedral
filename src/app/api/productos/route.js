import { NextResponse } from 'next/server';
import { sql, getDb } from '@/lib/db';

function parseProducto(p) {
  return {
    ...p,
    imagenes: typeof p.imagenes === 'string' ? JSON.parse(p.imagenes || '[]') : (p.imagenes || []),
  };
}

export async function GET(request) {
  await getDb();
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get('categoria');
  const buscar = searchParams.get('buscar');

  let productos;
  if (categoria && buscar) {
    const b = `%${buscar}%`;
    productos = await sql`SELECT * FROM productos WHERE categoria = ${categoria} AND (nombre ILIKE ${b} OR descripcion ILIKE ${b}) ORDER BY creado_en DESC`;
  } else if (categoria) {
    productos = await sql`SELECT * FROM productos WHERE categoria = ${categoria} ORDER BY creado_en DESC`;
  } else if (buscar) {
    const b = `%${buscar}%`;
    productos = await sql`SELECT * FROM productos WHERE nombre ILIKE ${b} OR descripcion ILIKE ${b} ORDER BY creado_en DESC`;
  } else {
    productos = await sql`SELECT * FROM productos ORDER BY creado_en DESC`;
  }

  return NextResponse.json(productos.map(parseProducto));
}

export async function POST(request) {
  await getDb();
  const body = await request.json();
  const { nombre, descripcion, precio, categoria, tallas, colores, stock, imagen, imagenes, exclusivo } = body;

  if (!nombre || !precio || !categoria) {
    return NextResponse.json({ error: 'Nombre, precio y categoría son requeridos' }, { status: 400 });
  }

  // imagenes = [imagen principal] + extras, si no se pasa se construye con la principal
  const todasImagenes = imagenes?.length ? imagenes : (imagen ? [imagen] : []);

  const [nuevo] = await sql`
    INSERT INTO productos (nombre, descripcion, precio, categoria, tallas, colores, stock, imagen, imagenes, exclusivo)
    VALUES (${nombre}, ${descripcion || ''}, ${Number(precio)}, ${categoria},
            ${JSON.stringify(tallas || [])}, ${JSON.stringify(colores || [])},
            ${Number(stock) || 0}, ${imagen || '/placeholder.jpg'},
            ${JSON.stringify(todasImagenes)}, ${exclusivo ? 1 : 0})
    RETURNING *
  `;
  return NextResponse.json(parseProducto(nuevo), { status: 201 });
}
