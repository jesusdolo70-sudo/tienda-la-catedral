import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function PUT(request, { params }) {
  const db = getDb();
  const { id } = await params;
  const { estado } = await request.json();
  const estados = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];
  if (!estados.includes(estado)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  }
  db.prepare('UPDATE pedidos SET estado = ? WHERE id = ?').run(estado, id);
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(id);
  return NextResponse.json(pedido);
}

export async function DELETE(request, { params }) {
  const db = getDb();
  const { id } = await params;
  db.prepare('DELETE FROM pedidos WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}
