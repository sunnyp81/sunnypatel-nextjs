import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/Services' || request.nextUrl.pathname === '/Services/') {
    const destination = request.nextUrl.clone();
    destination.pathname = '/services/';
    return NextResponse.redirect(destination, 308);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/Services', '/Services/'] };
