'use client'

import { useAuth, useUser } from '@clerk/nextjs'

export function useClerkAuth() {
  const { isSignedIn, userId, sessionId } = useAuth()
  const { user } = useUser()
  
  return {
    isSignedIn,
    userId,
    sessionId,
    user,
  }
}

export function useClerkUser() {
  const { user, isLoaded } = useUser()
  
  return {
    user,
    isLoaded,
  }
}
