import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

interface DailyGuidance {
  date: string
  primaryTheme: string
  message: string
  tip: string
  confidence: number
  mood: string
  activeTransits: Array<{
    transitingPlanet: string
    natalPlanet: string
    aspect: string
    orb: number
    strength: number
    house: number
  }>
  resonanceNote?: string
}

export function useDailyGuidance() {
  const { isLoaded, user } = useUser()
  const [guidance, setGuidance] = useState<DailyGuidance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false)
      return
    }

    const fetchDailyGuidance = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/daily-guidance')
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch daily guidance')
        }
        
        setGuidance(data)
      } catch (err) {
        console.error('Error fetching daily guidance:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchDailyGuidance()
  }, [isLoaded, user])

  return { guidance, loading, error }
}
