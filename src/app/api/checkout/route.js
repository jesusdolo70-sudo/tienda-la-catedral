import { NextResponse } from 'next/server';
import { sql, getDb } from '@/lib/db';
import { enviarConfirmacionPedido } from '@/lib/email';

export async function POST(request) {
  await getDb();
  const body = await request.json();
  const { cliente_nombre, cliente_email, cliente_telefono, direccion, items, total, metodo_pago } = body;

  if (!cliente_nombre || !cliente_email || !items?.length) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  await new Promise(r => setTimeout(r, 1200));

  if (metodo_pago?.tipo === 'tarjeta') {
    const numero = (metodo_pago.numero || '').replace(/\s/g, '');
    if (numero.endsWith('0000')) {
      return NextResponse.json({ error: 'Tarjeta declinada. Verifique los datos.' }, { status: 402 });
    }
  }

  const [pedido] = await sql`
    INSERT INTO pedidos (cliente_nombre, cliente_email, cliente_telefono, direccion, items, total, estado)
    VALUES (${cliente_nombre}, ${cliente_email}, ${cliente_telefono || ''},
            ${direccion || ''}, ${JSON.stringify(items)}, ${total}, 'confirmado')
    RETURNING id
  `;

  // Enviar email en background (no bloquea la respuesta)
  enviarConfirmacionPedido({
    pedidoId: pedido.id,
    clienteNombre: cliente_nombre,
    clienteEmail: cliente_email,
    items,
    total,
    direccion,
  }).catch(err => console.error('[Email]', err));

  return NextResponse.json({
    ok: true,
    pedido_id: pedido.id,
    mensaje: 'Pago procesado correctamente',
  });
}
