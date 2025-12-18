'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface NotificationPreferences {
  id: string
  userId: string
  pushEnabled: boolean
  emailEnabled: boolean
  morningTime: string
  eveningTime: string
  weeklyDay: number
  weeklyTime: string
  dailyEnabled: boolean
  weeklyEnabled: boolean
  themeEnabled: boolean
  aspectsEnabled: boolean
  mbtiEnabled: boolean
  updatedAt: string
}

const weekDays = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
]

export default function NotificationPreferences({ userId }: { userId: string }) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [userId])

  const fetchPreferences = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notifications/preferences?userId=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch preferences')
      
      const data = await response.json()
      setPreferences(data)
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
      toast.error('Failed to load notification preferences')
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!preferences) return

    try {
      setSaving(true)
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...updates
        })
      })

      if (!response.ok) throw new Error('Failed to update preferences')

      const updatedData = await response.json()
      setPreferences(updatedData)
      toast.success('Notification preferences updated')
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      toast.error('Failed to update preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleTimeChange = (field: 'morningTime' | 'eveningTime' | 'weeklyTime', value: string) => {
    updatePreferences({ [field]: value })
  }

  const handleSwitchChange = (field: keyof NotificationPreferences, value: boolean) => {
    updatePreferences({ [field]: value })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Configure your cosmic notification schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Failed to load notification preferences
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Daily Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Notifications</CardTitle>
          <CardDescription>
            Receive your daily cosmic forecast and reflections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="daily-enabled">Enable Daily Notifications</Label>
            <Switch
              id="daily-enabled"
              checked={preferences.dailyEnabled}
              onCheckedChange={(checked) => handleSwitchChange('dailyEnabled', checked)}
              disabled={saving}
            />
          </div>

          {preferences.dailyEnabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="morning-time">Morning Time</Label>
                  <Input
                    id="morning-time"
                    type="time"
                    value={preferences.morningTime}
                    onChange={(e) => handleTimeChange('morningTime', e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="evening-time">Evening Time</Label>
                  <Input
                    id="evening-time"
                    type="time"
                    value={preferences.eveningTime}
                    onChange={(e) => handleTimeChange('eveningTime', e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Content Preferences</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-enabled">Daily Themes</Label>
                  <Switch
                    id="theme-enabled"
                    checked={preferences.themeEnabled}
                    onCheckedChange={(checked) => handleSwitchChange('themeEnabled', checked)}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="aspects-enabled">Planetary Aspects</Label>
                  <Switch
                    id="aspects-enabled"
                    checked={preferences.aspectsEnabled}
                    onCheckedChange={(checked) => handleSwitchChange('aspectsEnabled', checked)}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="mbti-enabled">MBTI Insights</Label>
                  <Switch
                    id="mbti-enabled"
                    checked={preferences.mbtiEnabled}
                    onCheckedChange={(checked) => handleSwitchChange('mbtiEnabled', checked)}
                    disabled={saving}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Weekly Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Notifications</CardTitle>
          <CardDescription>
            Get your comprehensive weekly cosmic report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="weekly-enabled">Enable Weekly Notifications</Label>
            <Switch
              id="weekly-enabled"
              checked={preferences.weeklyEnabled}
              onCheckedChange={(checked) => handleSwitchChange('weeklyEnabled', checked)}
              disabled={saving}
            />
          </div>

          {preferences.weeklyEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weekly-day">Day of Week</Label>
                <Select
                  value={preferences.weeklyDay.toString()}
                  onValueChange={(value) => handleSwitchChange('weeklyDay', parseInt(value))}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {weekDays.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="weekly-time">Time</Label>
                <Input
                  id="weekly-time"
                  type="time"
                  value={preferences.weeklyTime}
                  onChange={(e) => handleTimeChange('weeklyTime', e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-enabled">Push Notifications</Label>
              <p className="text-sm text-gray-600">
                Receive notifications in your browser
              </p>
            </div>
            <Switch
              id="push-enabled"
              checked={preferences.pushEnabled}
              onCheckedChange={(checked) => handleSwitchChange('pushEnabled', checked)}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-enabled">Email Notifications</Label>
              <p className="text-sm text-gray-600">
                Receive notifications via email (coming soon)
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={preferences.emailEnabled}
              onCheckedChange={(checked) => handleSwitchChange('emailEnabled', checked)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => window.location.reload()}
          disabled={saving}
          variant="outline"
        >
          {saving ? 'Saving...' : 'Reset to Default'}
        </Button>
      </div>
    </div>
  )
}
