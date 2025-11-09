import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // In a real app, verify JWT token from cookie or header
    // For development, we'll just check a simple flag
    
    // Allow access for now (client-side will handle auth)
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};
