import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and api routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/onboarding'
  ) {
    return NextResponse.next()
  }

  // Get user session (you'll need to implement this based on your auth system)
  const userId = getUserIdFromSession(request)
  
  if (!userId) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Check if user has completed onboarding
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    })

    // If no profile or missing birth date, redirect to onboarding
    if (!profile || !profile.birthDate) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

  } catch (error) {
    console.error('Middleware error:', error)
    // If database error, allow access (don't block the app)
  }

  return NextResponse.next()
}

function getUserIdFromSession(request: NextRequest): string | null {
  // Implement this based on your auth system
  // For example, if using cookies:
  const sessionCookie = request.cookies.get('session')
  return sessionCookie?.value || null
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico|onboarding).*)',
  ],
}
