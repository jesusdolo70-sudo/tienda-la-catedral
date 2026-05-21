import { NextResponse } from 'next/server';
import { sql, getDb } from '@/lib/db';

export async function PUT(request, { params }) {
  await getDb();
  const { id } = await params;
  const { estado } = await request.json();
  const estados = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];
  if (!estados.includes(estado)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  }
  const [pedido] = await sql`UPDATE pedidos SET estado = ${estado} WHERE id = ${id} RETURNING *`;
  return NextResponse.json(pedido);
}

export async function DELETE(request, { params }) {
  await getDb();
  const { id } = await params;
  await sql`DELETE FROM pedidos WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
