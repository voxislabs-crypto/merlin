import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import NextRequest from 'next/server'

export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and api routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/onboarding' ||
    pathname === '/login' ||
    pathname.startsWith('/auth/callback')
  ) {
    return NextResponse.next()
  }

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('userProfile')
      .select('*')
      .eq('userId', session.user.id)
      .single()

    // If no profile or missing birth date, redirect to onboarding
    if (!profile || !(profile as any).birthDate) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  } catch (error) {
    console.error('Middleware error:', error)
    // If database error, allow access (don't block the app)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - onboarding (onboarding page itself)
     * - login (login page itself)
     * - auth/callback (Supabase auth callback)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|onboarding|login|auth/callback).*)',
  ],
}
