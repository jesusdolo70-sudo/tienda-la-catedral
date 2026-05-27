import { NextResponse } from 'next/server';

const COOKIE = 'imperial_admin';
const SECRET = process.env.ADMIN_PASSWORD || 'imperial2025';

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Solo protege rutas /admin, excepto /admin/login y la API de login
  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login') || pathname.startsWith('/api/admin/login')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE)?.value;
  if (token === SECRET) return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/admin/login';
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
