import { NextResponse } from 'next/server';
import { sql, getDb } from '@/lib/db';
import { cookies } from 'next/headers';

async function autenticado() {
  const c = await cookies();
  return !!c.get('imperial_admin')?.value;
}

export async function GET(request) {
  if (!await autenticado()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await getDb();
  const { searchParams } = new URL(request.url);
  const dias = Math.min(Number(searchParams.get('dias') || 7), 90);

  // Ventas diarias
  const ventasDiarias = await sql`
    SELECT
      DATE(creado_en) as fecha,
      COUNT(*) as pedidos,
      SUM(total) as ingresos
    FROM pedidos
    WHERE estado != 'cancelado'
      AND creado_en >= DATE('now', ${`-${dias - 1} days`})
    GROUP BY DATE(creado_en)
    ORDER BY fecha ASC
  `;

  // Llenar días sin ventas con ceros
  const hoy = new Date();
  const mapa = {};
  for (const row of ventasDiarias) mapa[row.fecha] = row;

  const datos = [];
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    datos.push({
      fecha: key,
      label,
      pedidos: Number(mapa[key]?.pedidos || 0),
      ingresos: Number(mapa[key]?.ingresos || 0),
    });
  }

  // Totales del período
  const totalPeriodo = datos.reduce((s, d) => s + d.ingresos, 0);
  const pedidosPeriodo = datos.reduce((s, d) => s + d.pedidos, 0);
  const mejorDia = datos.reduce((m, d) => d.ingresos > m.ingresos ? d : m, datos[0] || {});

  // Categorías más vendidas
  const pedidosAll = await sql`
    SELECT items FROM pedidos WHERE estado != 'cancelado'
  `;
  const catMap = {};
  for (const p of pedidosAll) {
    const items = typeof p.items === 'string' ? JSON.parse(p.items) : p.items;
    for (const item of items) {
      const cat = item.categoria || 'Otro';
      catMap[cat] = (catMap[cat] || 0) + (item.precio * item.cantidad);
    }
  }
  const categorias = Object.entries(catMap)
    .map(([nombre, total]) => ({ nombre, total: Number(total) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return NextResponse.json({ datos, totalPeriodo, pedidosPeriodo, mejorDia, categorias });
}
