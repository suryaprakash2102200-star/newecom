import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check if the request is for the admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Get the admin token from cookies
    const adminToken = request.cookies.get('admin-token')?.value;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // If no token or token doesn't match, redirect to login
    if (!adminToken || adminToken !== adminPassword) {
      // Allow access to the admin page itself (it will show login form)
      if (request.nextUrl.pathname === '/admin') {
        return NextResponse.next();
      }
      
      // Block API routes
      if (request.nextUrl.pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
