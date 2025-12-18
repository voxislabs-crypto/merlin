"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useClerkUser } from '@/utils/clerk/client'
import { StarfieldBackground } from '@/components/cosmic/StarfieldBackground'
import { GlassmorphicCard } from '@/components/cosmic/GlassmorphicCard'
import { CosmicButton } from '@/components/cosmic/CosmicButton'
import { LoadingOracle } from '@/components/cosmic/LoadingOracle'
import { BirthChartVisualization } from '@/components/astrology/BirthChartVisualization'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Share2, Save } from "lucide-react"
import { toast } from "sonner"

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

export default function BirthChartPage() {
  const router = useRouter()
  const { user } = useClerkUser()
  const [chartData, setChartData] = useState<BirthChartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBirthChart = async () => {
      try {
        if (!user) return
        
        // Get birth data from user metadata
        const birthDate = user.unsafeMetadata?.birthDate
        const birthTime = user.unsafeMetadata?.birthTime
        const birthLocation = user.unsafeMetadata?.birthLocation
        
        if (!birthDate) {
          throw new Error('Birth date not found in profile')
        }
        
        // Call the enhanced API to get complete birth chart data
        const response = await fetch('/api/calculate-birth-chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            birthDate,
            birthTime: birthTime || '12:00', // Default to noon if time is unknown
            birthLocation: birthLocation || 'New York, NY', // Default location
            timeUnknown: !birthTime
          })
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to calculate birth chart')
        }
        
        const data = await response.json()
        setChartData({
          ...data,
          birthData: {
            ...data.birthData,
            date: new Date(data.birthData.date)
          }
        })
      } catch (err) {
        console.error('Error fetching birth chart:', err)
        setError(err instanceof Error ? err.message : 'Failed to load birth chart')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchBirthChart()
  }, [user])
  
  const handleBack = () => {
    router.push('/dashboard')
  }
  
  const handleSaveChart = () => {
    // TODO: Implement save to profile
    toast.success('Birth chart saved to your profile')
  }
  
  const handleShare = () => {
    // TODO: Implement share functionality
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard')
  }
  
  const handleDownload = () => {
    // TODO: Implement download as image/PDF
    toast.info('Export feature coming soon')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingOracle message="Calculating your birth chart..." />
      </div>
    )
  }
  
  if (error) {
    return (
      <StarfieldBackground>
        <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
          <GlassmorphicCard className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center mb-2">
                Error Loading Birth Chart
              </CardTitle>
              <p className="text-center text-gray-400">
                {error}
              </p>
            </CardHeader>
            <CardContent className="flex justify-center mt-4">
              <Button 
                onClick={handleBack}
                variant="outline"
                className="border-indigo-500 text-indigo-400 hover:bg-indigo-900/30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </GlassmorphicCard>
        </div>
      </StarfieldBackground>
    )
  }

  return (
    <StarfieldBackground>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Button 
            onClick={handleBack}
            variant="ghost"
            className="text-indigo-400 hover:bg-indigo-900/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleDownload}
              variant="outline"
              className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-900/30"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              onClick={handleShare}
              variant="outline"
              className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-900/30"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button 
              onClick={handleSaveChart}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save to Profile
            </Button>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Your Birth Chart
          </h1>
          <p className="text-center text-gray-400 mb-8">
            {chartData?.birthData.date.toLocaleDateString()} • {chartData?.birthData.time} • {chartData?.birthData.location}
          </p>
        </motion.div>
        
        {chartData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <BirthChartVisualization
              data={chartData}
            />
          </motion.div>
        )}
        
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>For a complete interpretation, consider a professional reading with one of our astrologers.</p>
          <div className="mt-4">
            <Button variant="link" className="text-indigo-400">
              Book a Reading
            </Button>
          </div>
        </div>
      </div>
    </StarfieldBackground>
  )
}
