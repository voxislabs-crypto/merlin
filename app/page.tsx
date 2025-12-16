"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LandingPage from './(marketing)/page'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const hasCompleted = localStorage.getItem('hasCompletedOnboarding')
    
    if (hasCompleted === 'true') {
      router.push('/dashboard')
    }
  }, [router])

  return <LandingPage />
}