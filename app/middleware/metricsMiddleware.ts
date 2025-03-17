import { NextRequest, NextResponse } from 'next/server';
import { recordHttpRequest } from '../pages/api/metrics';

/**
 * Middleware for recording HTTP request metrics
 * This middleware automatically tracks request counts and durations for all API routes
 */
export async function middleware(request: NextRequest) {
  // Only instrument API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // Skip the metrics endpoint itself to avoid circular references
  if (request.nextUrl.pathname === '/api/metrics') {
    return NextResponse.next();
  }
  
  const start = performance.now();
  
  // Process the request
  const response = NextResponse.next();
  
  // Calculate request duration
  const duration = performance.now() - start;
  const durationInSeconds = duration / 1000;
  
  // Get method and path for metrics
  const method = request.method;
  const path = request.nextUrl.pathname;
  
  // Record metrics after the response is sent
  // We use setTimeout to ensure this happens after the response
  setTimeout(() => {
    try {
      // Get the status from the response
      const status = response.status || 200;
      
      // Record request metrics
      recordHttpRequest(method, path, status, durationInSeconds);
    } catch (error) {
      console.error('Error recording metrics:', error);
    }
  }, 0);
  
  return response;
}

// Configure the middleware to run only on API routes
export const config = {
  matcher: '/api/:path*',
}; 