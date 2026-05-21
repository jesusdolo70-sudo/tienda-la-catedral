import { NextResponse } from 'next/server';
import { sql, getDb } from '@/lib/db';

export async function GET() {
  await getDb();
  const pedidos = await sql`SELECT * FROM pedidos ORDER BY creado_en DESC`;
  return NextResponse.json(pedidos);
}

export async function POST(request) {
  await getDb();
  const body = await request.json();
  const { cliente_nombre, cliente_email, cliente_telefono, direccion, items, total } = body;

  if (!cliente_nombre || !cliente_email || !items || !total) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  const [pedido] = await sql`
    INSERT INTO pedidos (cliente_nombre, cliente_email, cliente_telefono, direccion, items, total)
    VALUES (${cliente_nombre}, ${cliente_email}, ${cliente_telefono || ''},
            ${direccion || ''}, ${JSON.stringify(items)}, ${Number(total)})
    RETURNING *
  `;
  return NextResponse.json(pedido, { status: 201 });
}
