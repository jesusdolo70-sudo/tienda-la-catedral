import { NextResponse } from 'next/server';

const COOKIE = 'imperial_admin';

export async function POST(request) {
  const { password } = await request.json();
  const correcta = process.env.ADMIN_PASSWORD || 'imperial2025';

  if (password !== correcta) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, correcta, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 horas
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
