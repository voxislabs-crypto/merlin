import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  
  // Temporarily disable auth checks for testing
  const publicPaths = ['/login', '/auth/callback', '/onboarding', '/', '/dashboard'];
  const path = req.nextUrl.pathname;

  if (publicPaths.includes(path)) return res;
  
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
