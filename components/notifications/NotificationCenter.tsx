'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Sun, 
  Moon, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Heart,
  Brain
} from 'lucide-react'

interface NotificationContent {
  theme?: string
  aspects?: string[]
  mbtiGuidance?: string
  doList?: string[]
  dontList?: string[]
  resonance?: {
    personal: number
    cluster: number
    global: number
  }
  intensity?: 'high' | 'medium' | 'low'
}

interface Notification {
  id: string
  userId: string
  type: 'morning' | 'evening' | 'weekly'
  status: 'scheduled' | 'sent' | 'read' | 'failed'
  title: string
  content: NotificationContent
  scheduledAt: string
  sentAt?: string
  readAt?: string
  channel: string
  timezone: string
}

interface NotificationCenterProps {
  userId: string
}

export default function NotificationCenter({ userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    fetchNotifications()
  }, [userId, filter])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/notifications?userId=${userId}&status=${filter}&limit=50`
      )
      if (!response.ok) throw new Error('Failed to fetch notifications')
      
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId,
          status: 'read',
          readAt: new Date().toISOString()
        })
      })

      if (!response.ok) throw new Error('Failed to mark as read')

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'read' as const, readAt: new Date().toISOString() }
            : n
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'morning':
        return <Sun className="h-5 w-5 text-yellow-500" />
      case 'evening':
        return <Moon className="h-5 w-5 text-blue-500" />
      case 'weekly':
        return <Calendar className="h-5 w-5 text-purple-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getIntensityColor = (intensity?: string) => {
    switch (intensity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'sent':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }

  const unreadCount = notifications.filter(n => n.status === 'sent').length

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notification Center</CardTitle>
              <CardDescription>
                Your cosmic updates and insights
              </CardDescription>
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === 'read' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('read')}
            >
              Read
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-gray-500">
                  {filter === 'unread' 
                    ? 'No unread notifications' 
                    : filter === 'read'
                    ? 'No read notifications'
                    : 'No notifications yet'
                  }
                </div>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  notification.status === 'sent' ? 'border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => notification.status === 'sent' && markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{notification.title}</h3>
                          {getStatusIcon(notification.status)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(notification.scheduledAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notification Content */}
                  {notification.content && (
                    <div className="mt-4 space-y-3">
                      {/* Theme */}
                      {notification.content.theme && (
                        <div>
                          <Badge className={getIntensityColor(notification.content.intensity)}>
                            {notification.content.theme}
                          </Badge>
                        </div>
                      )}

                      {/* Aspects */}
                      {notification.content.aspects && notification.content.aspects.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Key Aspects:</h4>
                          <div className="flex flex-wrap gap-1">
                            {notification.content.aspects.map((aspect, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {aspect}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* MBTI Guidance */}
                      {notification.content.mbtiGuidance && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <Brain className="h-4 w-4 text-blue-600" />
                            <h4 className="font-medium text-sm">Personal Insight</h4>
                          </div>
                          <p className="text-sm text-gray-700">
                            {notification.content.mbtiGuidance}
                          </p>
                        </div>
                      )}

                      {/* Do/Don't Lists */}
                      {(notification.content.doList || notification.content.dontList) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {notification.content.doList && (
                            <div className="bg-green-50 p-3 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <h4 className="font-medium text-sm">Do</h4>
                              </div>
                              <ul className="text-sm space-y-1">
                                {notification.content.doList.map((item, index) => (
                                  <li key={index} className="flex items-start space-x-2">
                                    <span className="text-green-600">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {notification.content.dontList && (
                            <div className="bg-red-50 p-3 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <h4 className="font-medium text-sm">Don't</h4>
                              </div>
                              <ul className="text-sm space-y-1">
                                {notification.content.dontList.map((item, index) => (
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

                      {/* Resonance Stats */}
                      {notification.content.resonance && (
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Heart className="h-4 w-4 text-purple-600" />
                            <h4 className="font-medium text-sm">Resonance</h4>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-medium">Personal</div>
                              <div className="text-purple-600">
                                {Math.round(notification.content.resonance.personal * 100)}%
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">Cluster</div>
                              <div className="text-purple-600">
                                {Math.round(notification.content.resonance.cluster * 100)}%
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">Global</div>
                              <div className="text-purple-600">
                                {Math.round(notification.content.resonance.global * 100)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Separator className="mt-4" />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
