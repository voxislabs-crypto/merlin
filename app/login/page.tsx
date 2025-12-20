"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

export default function LoginPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useAuth()

  // Redirect to sign-in page or dashboard if already signed in
  useEffect(() => {
    if (!isLoaded) return
    
    if (isSignedIn) {
      router.push('/dashboard')
    } else {
      // Redirect to Clerk's sign-in page with a redirect back to dashboard
      window.location.href = '/sign-in?redirect_url=' + encodeURIComponent('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  // Show a simple loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Redirecting to login...</p>
      </div>
    </div>
  )
}