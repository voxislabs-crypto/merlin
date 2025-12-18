'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Sun, 
  Moon, 
  TrendingUp, 
  AlertTriangle,
  Heart,
  Settings,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface WidgetData {
  theme: string
  doList: string[]
  dontList: string[]
  resonance: {
    personal: number
    global: number
  }
  intensity: 'high' | 'medium' | 'low'
  lastUpdated: string
}

interface CosmicWidgetProps {
  userId: string
  compact?: boolean
  showSettings?: boolean
}

export default function CosmicWidget({ 
  userId, 
  compact = false, 
  showSettings = true 
}: CosmicWidgetProps) {
  const [widgetData, setWidgetData] = useState<WidgetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchWidgetData()
    
    // Refresh every hour
    const interval = setInterval(fetchWidgetData, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [userId])

  const fetchWidgetData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notifications?userId=${userId}&status=sent&limit=1`)
      
      if (!response.ok) {
        if (response.status === 404) {
          // No notifications yet, show welcome state
          setWidgetData(null)
          return
        }
        throw new Error('Failed to fetch widget data')
      }
      
      const notifications = await response.json()
      
      if (notifications.length === 0) {
        setWidgetData(null)
        return
      }

      const latestNotification = notifications[0]
      const content = latestNotification.content

      setWidgetData({
        theme: content.theme || 'Cosmic Harmony',
        doList: content.doList || [],
        dontList: content.dontList || [],
        resonance: content.resonance || { personal: 0.75, global: 0.80 },
        intensity: content.intensity || 'medium',
        lastUpdated: latestNotification.sentAt || latestNotification.scheduledAt
      })
    } catch (error) {
      console.error('Error fetching widget data:', error)
      toast.error('Failed to load cosmic widget')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchWidgetData()
    setRefreshing(false)
  }

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 18) return 'afternoon'
    return 'evening'
  }

  const getTimeIcon = () => {
    const timeOfDay = getTimeOfDay()
    switch (timeOfDay) {
      case 'morning':
        return <Sun className="h-4 w-4 text-yellow-500" />
      case 'afternoon':
        return <Sun className="h-4 w-4 text-orange-500" />
      default:
        return <Moon className="h-4 w-4 text-blue-500" />
    }
  }

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!widgetData) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4 text-center">
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2">
              {getTimeIcon()}
              <span className="text-lg font-semibold">Welcome to Merlin</span>
            </div>
            <p className="text-sm text-gray-600">
              Your cosmic insights will appear here
            </p>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              size="sm"
              variant="outline"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getTimeIcon()}
              <div>
                <div className="font-semibold text-sm">{widgetData.theme}</div>
                <div className="text-xs text-gray-500">
                  {formatLastUpdated(widgetData.lastUpdated)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getIntensityColor(widgetData.intensity)}`} />
              {refreshing && (
                <RefreshCw className="h-3 w-3 animate-spin text-gray-400" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {getTimeIcon()}
            <div>
              <div className="font-semibold">{widgetData.theme}</div>
              <div className="text-xs text-gray-500">
                {formatLastUpdated(widgetData.lastUpdated)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getIntensityColor(widgetData.intensity)}`} />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            {showSettings && (
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Intensity Indicator */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-sm font-medium">Intensity:</span>
          <Badge variant={widgetData.intensity === 'high' ? 'destructive' : 'secondary'}>
            {widgetData.intensity}
          </Badge>
        </div>

        {/* Do/Don't Lists */}
        {(widgetData.doList.length > 0 || widgetData.dontList.length > 0) && (
          <div className="space-y-3 mb-4">
            {widgetData.doList.length > 0 && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">Do</span>
                </div>
                <ul className="text-sm space-y-1">
                  {widgetData.doList.slice(0, 2).map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {widgetData.dontList.length > 0 && (
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-sm">Don't</span>
                </div>
                <ul className="text-sm space-y-1">
                  {widgetData.dontList.slice(0, 2).map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-red-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Resonance */}
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Heart className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-sm">Resonance</span>
          </div>
          <div className="flex space-x-4 text-sm">
            <div className="text-center">
              <div className="text-xs text-gray-600">You</div>
              <div className="font-semibold text-purple-600">
                {Math.round(widgetData.resonance.personal * 100)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600">Global</div>
              <div className="font-semibold text-purple-600">
                {Math.round(widgetData.resonance.global * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => window.location.href = '/dashboard'}
          >
            View Full Forecast
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
