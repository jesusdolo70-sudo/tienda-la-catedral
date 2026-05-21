import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(request) {
  const db = getDb();
  const body = await request.json();
  const { cliente_nombre, cliente_email, cliente_telefono, direccion, items, total, metodo_pago } = body;

  if (!cliente_nombre || !cliente_email || !items?.length) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  // Simulate payment processing delay
  await new Promise(r => setTimeout(r, 1200));

  // Mock payment validation — reject test cards ending in 0000
  if (metodo_pago?.tipo === 'tarjeta') {
    const numero = (metodo_pago.numero || '').replace(/\s/g, '');
    if (numero.endsWith('0000')) {
      return NextResponse.json({ error: 'Tarjeta declinada. Verifique los datos.' }, { status: 402 });
    }
  }

  const itemsJson = JSON.stringify(items);
  const result = db.prepare(`
    INSERT INTO pedidos (cliente_nombre, cliente_email, cliente_telefono, direccion, items, total, estado)
    VALUES (?, ?, ?, ?, ?, ?, 'confirmado')
  `).run(cliente_nombre, cliente_email, cliente_telefono || '', direccion || '', itemsJson, total);

  return NextResponse.json({
    ok: true,
    pedido_id: result.lastInsertRowid,
    mensaje: 'Pago procesado correctamente',
  });
}
