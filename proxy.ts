import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/plan'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
