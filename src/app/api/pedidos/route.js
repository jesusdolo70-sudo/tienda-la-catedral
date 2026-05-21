import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  const db = getDb();
  const pedidos = db.prepare('SELECT * FROM pedidos ORDER BY creado_en DESC').all();
  return NextResponse.json(pedidos);
}

export async function POST(request) {
  const db = getDb();
  const body = await request.json();
  const { cliente_nombre, cliente_email, cliente_telefono, direccion, items, total } = body;

  if (!cliente_nombre || !cliente_email || !items || !total) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  const result = db.prepare(`
    INSERT INTO pedidos (cliente_nombre, cliente_email, cliente_telefono, direccion, items, total)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(cliente_nombre, cliente_email, cliente_telefono || '', direccion || '', JSON.stringify(items), Number(total));

  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(pedido, { status: 201 });
}
