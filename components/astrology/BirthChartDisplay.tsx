// components/astrology/BirthChartDisplay.tsx
'use client'

import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import visualization component to avoid SSR issues
const BirthChartVisualization = dynamic(
  () => import('./BirthChartVisualization').then(mod => mod.BirthChartVisualization),
  { ssr: false }
)

interface BirthChartData {
  positions: Array<{
    planet: string
    longitude: number
    latitude: number
    distance: number
    speed: number
    sign: string
    degree: number
    minute: number
    second: number
    house: number
    meaning: Record<string, any>
  }>
  houses: Array<{
    house: number
    position: number
    sign: string
    degree: number
    minute: number
    second: number
  }>
  aspects: Array<{
    planet1: { name: string; longitude: number }
    planet2: { name: string; longitude: number }
    type: string
    orb: number
    exact: boolean
    meaning: Record<string, any>
  }>
  birthData: {
    date: string
    location: string
    coordinates: {
      latitude: number
      longitude: number
    }
  }
}

interface BirthChartDisplayProps {
  birthData?: any
}

export function BirthChartDisplay({ birthData }: BirthChartDisplayProps) {
  const { user } = useUser()
  const { getToken } = useAuth();
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBirthChart = async () => {
    if (!birthData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const requestData = {
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime,
        birthLocation: birthData.birthLocation,
        timeUnknown: birthData.timeUnknown || false,
      };
      
      console.log('Sending birth chart request:', requestData);
      
      const token = await getToken();
      const response = await fetch('/api/birth-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to calculate birth chart: ${response.status} ${response.statusText}`);
      }

      const data = await response.json()
      setChartData(data)

      // Cache the result in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('birthChartData', JSON.stringify(data))
      }
    } catch (err) {
      console.error('Error fetching birth chart:', err)
      setError(err instanceof Error ? err.message : 'Failed to load birth chart. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load cached data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem('birthChartData')
      if (cachedData) {
        setChartData(JSON.parse(cachedData))
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
        <Button onClick={fetchBirthChart} className="mt-2">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Birth Chart</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData ? (
          <div className="space-y-6">
            <BirthChartVisualization data={chartData} />
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Planetary Positions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {chartData.planets?.map((planet: any) => {
                  // Convert longitude to degrees, minutes, seconds
                  const degrees = Math.floor(planet.longitude);
                  const minutes = Math.floor((planet.longitude - degrees) * 60);
                  const seconds = Math.floor((((planet.longitude - degrees) * 60) - minutes) * 60);
                  
                  return (
                    <div key={planet.name} className="p-3 border rounded-lg">
                      <div className="font-medium">{planet.name}</div>
                      <div>{planet.sign} {degrees}° {minutes}' {seconds}"</div>
                      <div className="text-sm text-muted-foreground">
                        House {planet.house}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <p className="mb-4">No birth chart data available</p>
            <Button onClick={fetchBirthChart} disabled={!user && !birthData}>
              Calculate Birth Chart
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}