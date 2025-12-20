'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Moon,
  Sun,
  TrendingUp,
  Calendar,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ArrowRight,
  Clock
} from 'lucide-react'
import { ResonanceFeedback } from '@/components/ui/ResonanceFeedback'

interface PlanetPosition {
  name: string
  longitude: number
  sign: string
  house: number
}

interface Transit {
  transitingPlanet: string
  natalPlanet: string
  aspect: string
  orb: number
  applying: boolean
  strength: number
  interpretation: string
}

interface TransitData {
  currentDate: string
  transitingPlanets: PlanetPosition[]
  natalPlanets: PlanetPosition[]
  activeTransits: Transit[]
  summary: string
  mood: string
  advice: string
}

export default function TransitsPage() {
  const [transitData, setTransitData] = useState<TransitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTransit, setSelectedTransit] = useState<Transit | null>(null)

  useEffect(() => {
    fetchTransits()
  }, [])

  const fetchTransits = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/transits')

      if (!response.ok) {
        throw new Error('Failed to fetch transits')
      }

      const data = await response.json()
      setTransitData(data)
    } catch (error) {
      console.error('Error fetching transits:', error)
      toast.error('Failed to load transit data')
    } finally {
      setLoading(false)
    }
  }

  const handleResonanceFeedback = async (transit: Transit, score: number) => {
    try {
      await fetch('/api/resonance/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transitId: `${transit.transitingPlanet}-${transit.aspect}-${transit.natalPlanet}`,
          score,
          date: new Date().toISOString()
        })
      })
      toast.success('Feedback recorded')
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Failed to submit feedback')
    }
  }

  const getMoonPhase = (): string => {
    const phases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘']
    const dayOfMonth = new Date().getDate()
    return phases[Math.floor((dayOfMonth / 30) * 8) % 8]
  }

  const getAspectSymbol = (aspect: string): string => {
    const symbols = {
      'conjunction': '☌',
      'opposition': '☍',
      'square': '□',
      'trine': '△',
      'sextile': '⚹'
    }
    return symbols[aspect as keyof typeof symbols] || '•'
  }

  const getAspectColor = (aspect: string): string => {
    const colors = {
      'conjunction': 'text-purple-600',
      'opposition': 'text-red-600',
      'square': 'text-orange-600',
      'trine': 'text-green-600',
      'sextile': 'text-blue-600'
    }
    return colors[aspect as keyof typeof colors] || 'text-gray-600'
  }

  const getStrengthColor = (strength: number): string => {
    if (strength > 0.8) return 'bg-red-500'
    if (strength > 0.6) return 'bg-orange-500'
    if (strength > 0.4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-950 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading cosmic transits...</p>
        </div>
      </div>
    )
  }

  if (!transitData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-950 via-purple-900 to-pink-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">Failed to load transit data</p>
            <Button onClick={fetchTransits}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-950 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center space-x-4">
            <Sun className="h-12 w-12 text-yellow-400 animate-pulse" />
            <h1 className="text-5xl font-bold text-white">Current Transits</h1>
            <Moon className="h-12 w-12 text-blue-300 animate-pulse" />
          </div>
          <div className="flex items-center justify-center space-x-3">
            <p className="text-2xl text-purple-200">{formatDate(transitData.currentDate)}</p>
            <span className="text-4xl">{getMoonPhase()}</span>
          </div>
          <Badge className="bg-purple-600 text-white text-lg px-6 py-2">
            Mood: {transitData.mood}
          </Badge>
        </div>

        {/* Today's Summary Card */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-yellow-400" />
              <span>Today's Cosmic Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-linear-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-lg">
              <p className="text-white text-lg leading-relaxed">{transitData.summary}</p>
            </div>
            <div className="bg-linear-to-r from-blue-500/20 to-green-500/20 p-6 rounded-lg">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-6 w-6 text-green-400 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-2">Cosmic Advice</h3>
                  <p className="text-purple-100">{transitData.advice}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Transits Section */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Active Transits</CardTitle>
            <CardDescription className="text-purple-200">
              Current planetary aspects influencing your natal chart
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {transitData.activeTransits.length === 0 ? (
                  <div className="text-center py-12 text-purple-200">
                    <Moon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No major transits active today</p>
                    <p className="text-sm mt-2">A quiet day for cosmic reflection</p>
                  </div>
                ) : (
                  transitData.activeTransits.map((transit, index) => (
                    <Card
                      key={index}
                      className="bg-linear-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer"
                      onClick={() => setSelectedTransit(transit)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className={`text-4xl ${getAspectColor(transit.aspect)}`}>
                              {getAspectSymbol(transit.aspect)}
                            </span>
                            <div>
                              <h3 className="text-white font-semibold text-lg">
                                {transit.transitingPlanet} {transit.aspect} {transit.natalPlanet}
                              </h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  Orb: {transit.orb.toFixed(2)}°
                                </Badge>
                                <Badge
                                  variant={transit.applying ? 'default' : 'outline'}
                                  className="text-xs"
                                >
                                  {transit.applying ? 'Applying' : 'Separating'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getStrengthColor(transit.strength)} transition-all`}
                                style={{ width: `${transit.strength * 100}%` }}
                              />
                            </div>
                            <span className="text-white text-sm">
                              {Math.round(transit.strength * 100)}%
                            </span>
                          </div>
                        </div>

                        <p className="text-purple-100 italic leading-relaxed mb-4">
                          {transit.interpretation}
                        </p>

                        <Separator className="my-4 bg-purple-500/30" />

                        <div className="flex items-center justify-between">
                          <span className="text-purple-200 text-sm">
                            How does this resonate with you?
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-500/20 hover:bg-green-500/40 border-green-500/50"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleResonanceFeedback(transit, 1)
                              }}
                            >
                              <ThumbsUp className="h-4 w-4 text-green-400" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-red-500/20 hover:bg-red-500/40 border-red-500/50"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleResonanceFeedback(transit, -1)
                              }}
                            >
                              <ThumbsDown className="h-4 w-4 text-red-400" />
                            </Button>
                            <ResonanceFeedback
                              itemId={`${transit.transitingPlanet}-${transit.aspect}-${transit.natalPlanet}`}
                              itemType="aspect"
                              className="justify-end mt-2"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Transit Calendar - Next 7 Days */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-purple-400" />
              <span>Upcoming Transit Highlights</span>
            </CardTitle>
            <CardDescription className="text-purple-200">
              Key transits for the next 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {[...Array(7)].map((_, index) => {
                const date = new Date()
                date.setDate(date.getDate() + index)

                return (
                  <Card
                    key={index}
                    className="bg-linear-to-br from-purple-800/30 to-pink-800/30 border-purple-500/30"
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-white font-semibold mb-2">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-purple-200 text-sm mb-3">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="space-y-1">
                        {index === 0 ? (
                          <Badge className="bg-purple-600 text-white text-xs">
                            {transitData.activeTransits.length} active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-purple-300 text-xs">
                            TBD
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <Button
            onClick={fetchTransits}
            className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg"
          >
            <Clock className="h-5 w-5 mr-2" />
            Refresh Transits
          </Button>
        </div>
      </div>
    </div>
  )
}
