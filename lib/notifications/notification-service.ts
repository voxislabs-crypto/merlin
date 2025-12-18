import { PrismaClient } from '@prisma/client'
import { getDailyForecast, getWeeklyForecast } from '../forecast-engine'
import { assignPrimaryAndSecondaryThemes } from '../theme-assignment'
import { applyMBTIOverlay } from '../mbti-overlay'
import type { DetectedAspect } from '../aspect-detection'

const prisma = new PrismaClient()

export interface NotificationContent {
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

export interface ScheduledNotification {
  id: string
  userId: string
  type: 'morning' | 'evening' | 'weekly'
  title: string
  content: NotificationContent
  scheduledAt: Date
  timezone: string
}

export class NotificationService {
  /**
   * Schedule daily notifications for a user
   */
  async scheduleDailyNotifications(userId: string): Promise<void> {
    const preferences = await this.getUserPreferences(userId)
    if (!preferences?.dailyEnabled) return

    const now = new Date()
    const userTimezone = preferences.timezone || 'UTC'

    // Morning notification
    if (preferences.morningTime) {
      const morningTime = this.parseTime(preferences.morningTime)
      const scheduledMorning = this.scheduleForTimezone(
        now,
        morningTime.hour,
        morningTime.minute,
        userTimezone
      )

      await this.createNotification({
        userId,
        type: 'morning',
        title: 'Good Morning! Your Cosmic Forecast',
        scheduledAt: scheduledMorning,
        timezone: userTimezone
      })
    }

    // Evening notification
    if (preferences.eveningTime) {
      const eveningTime = this.parseTime(preferences.eveningTime)
      const scheduledEvening = this.scheduleForTimezone(
        now,
        eveningTime.hour,
        eveningTime.minute,
        userTimezone
      )

      await this.createNotification({
        userId,
        type: 'evening',
        title: 'Evening Reflection',
        scheduledAt: scheduledEvening,
        timezone: userTimezone
      })
    }
  }

  /**
   * Schedule weekly notification for a user
   */
  async scheduleWeeklyNotifications(userId: string): Promise<void> {
    const preferences = await this.getUserPreferences(userId)
    if (!preferences?.weeklyEnabled) return

    const now = new Date()
    const userTimezone = preferences.timezone || 'UTC'

    // Calculate next weekly notification day
    const weeklyTime = this.parseTime(preferences.weeklyTime || '10:00')
    const weeklyDay = preferences.weeklyDay || 0 // Sunday

    const scheduledWeekly = this.scheduleForDayOfWeek(
      now,
      weeklyDay,
      weeklyTime.hour,
      weeklyTime.minute,
      userTimezone
    )

    await this.createNotification({
      userId,
      type: 'weekly',
      title: 'Your Weekly Cosmic Report',
      scheduledAt: scheduledWeekly,
      timezone: userTimezone
    })
  }

  /**
   * Generate content for a notification
   */
  async generateNotificationContent(
    userId: string,
    type: 'morning' | 'evening' | 'weekly'
  ): Promise<NotificationContent> {
    const userProfile = await this.getUserProfile(userId)
    const location = this.parseBirthLocation(userProfile?.birthLocation)

    switch (type) {
      case 'morning':
        return this.generateMorningContent(userProfile, location)
      case 'evening':
        return this.generateEveningContent(userProfile, location)
      case 'weekly':
        return this.generateWeeklyContent(userProfile, location)
      default:
        throw new Error(`Unknown notification type: ${type}`)
    }
  }

  /**
   * Process and send pending notifications
   */
  async processPendingNotifications(): Promise<void> {
    const pendingNotifications = await prisma.notification.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          lte: new Date()
        }
      },
      include: {
        // Note: We'll need to add relationship to UserProfile in schema
      }
    })

    for (const notification of pendingNotifications) {
      try {
        await this.sendNotification(notification.id)
      } catch (error) {
        console.error(`Failed to send notification ${notification.id}:`, error)
        await this.markNotificationFailed(notification.id, error.message)
      }
    }
  }

  /**
   * Send a specific notification
   */
  async sendNotification(notificationId: string): Promise<void> {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification) {
      throw new Error(`Notification not found: ${notificationId}`)
    }

    // Generate content if not already present
    let content = notification.content as NotificationContent
    if (!content || Object.keys(content).length === 0) {
      content = await this.generateNotificationContent(
        notification.userId,
        notification.type as 'morning' | 'evening' | 'weekly'
      )

      // Update notification with generated content
      await prisma.notification.update({
        where: { id: notificationId },
        data: { content }
      })
    }

    // Send based on channel
    switch (notification.channel) {
      case 'app':
        await this.sendInAppNotification(notificationId, content)
        break
      case 'email':
        await this.sendEmailNotification(notificationId, content)
        break
      case 'push':
        await this.sendPushNotification(notificationId, content)
        break
      default:
        throw new Error(`Unknown notification channel: ${notification.channel}`)
    }

    // Mark as sent
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'sent',
        sentAt: new Date()
      }
    })
  }

  /**
   * Get user's notification preferences
   */
  private async getUserPreferences(userId: string) {
    return await prisma.notificationPreference.findUnique({
      where: { userId }
    })
  }

  /**
   * Get user's profile for personalization
   */
  private async getUserProfile(userId: string) {
    return await prisma.userProfile.findUnique({
      where: { userId }
    })
  }

  /**
   * Create a new notification
   */
  private async createNotification(data: {
    userId: string
    type: 'morning' | 'evening' | 'weekly'
    title: string
    scheduledAt: Date
    timezone: string
  }): Promise<void> {
    await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        content: {}, // Will be populated when sent
        scheduledAt: data.scheduledAt,
        timezone: data.timezone
      }
    })
  }

  /**
   * Generate morning notification content
   */
  private async generateMorningContent(
    userProfile: any,
    location: { latitude: number; longitude: number }
  ): Promise<NotificationContent> {
    const today = new Date()
    const forecast = await getDailyForecast(today, location)
    const themeAssignment = assignPrimaryAndSecondaryThemes(
      forecast.aspects || []
    )

    const content: NotificationContent = {
      theme: forecast.primaryTheme,
      aspects: forecast.aspects?.map(a => `${a.planet1} ${a.aspect} ${a.planet2}`),
      resonance: {
        personal: 0.85, // Would come from resonance engine
        cluster: 0.78,
        global: 0.82
      },
      intensity: this.calculateIntensity(forecast.aspects || [])
    }

    // Add MBTI guidance if enabled and available
    if (userProfile?.mbti) {
      content.mbtiGuidance = applyMBTIOverlay(
        forecast.primaryTheme,
        userProfile.mbti
      )
    }

    // Generate Do/Don't lists based on theme and aspects
    content.doList = this.generateDoList(forecast.primaryTheme, forecast.aspects || [])
    content.dontList = this.generateDontList(forecast.primaryTheme, forecast.aspects || [])

    return content
  }

  /**
   * Generate evening notification content
   */
  private async generateEveningContent(
    userProfile: any,
    location: { latitude: number; longitude: number }
  ): Promise<NotificationContent> {
    const today = new Date()
    const forecast = await getDailyForecast(today, location)

    return {
      theme: forecast.primaryTheme,
      aspects: forecast.aspects?.map(a => `${a.planet1} ${a.aspect} ${a.planet2}`),
      mbtiGuidance: userProfile?.mbti 
        ? applyMBTIOverlay(forecast.primaryTheme, userProfile.mbti)
        : undefined,
      doList: [
        'Reflect on today\'s cosmic influences',
        'Journal your experiences',
        'Prepare for tomorrow\'s energy'
      ],
      dontList: [
        'Make important decisions late at night',
        'Dwell on negative aspects',
        'Ignore your intuition'
      ]
    }
  }

  /**
   * Generate weekly notification content
   */
  private async generateWeeklyContent(
    userProfile: any,
    location: { latitude: number; longitude: number }
  ): Promise<NotificationContent> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - startDate.getDay()) // Start of week

    const weeklyForecast = await getWeeklyForecast(startDate, location, { days: 7 })
    
    // Analyze weekly patterns
    const themes = weeklyForecast.map(f => f.primaryTheme)
    const dominantTheme = this.getMostFrequent(themes)
    const strongAspects = this.getStrongestAspects(weeklyForecast)

    return {
      theme: dominantTheme,
      aspects: strongAspects,
      mbtiGuidance: userProfile?.mbti 
        ? applyMBTIOverlay(dominantTheme, userProfile.mbti)
        : undefined,
      resonance: {
        personal: 0.87,
        cluster: 0.79,
        global: 0.83
      },
      intensity: 'high'
    }
  }

  /**
   * Parse time string (HH:MM) to hour and minute
   */
  private parseTime(timeStr: string): { hour: number; minute: number } {
    const [hour, minute] = timeStr.split(':').map(Number)
    return { hour: hour || 8, minute: minute || 0 }
  }

  /**
   * Schedule notification for specific time in user's timezone
   */
  private scheduleForTimezone(
    date: Date,
    hour: number,
    minute: number,
    timezone: string
  ): Date {
    const scheduled = new Date(date)
    scheduled.setHours(hour, minute, 0, 0)
    
    // If time has passed today, schedule for tomorrow
    if (scheduled <= date) {
      scheduled.setDate(scheduled.getDate() + 1)
    }

    return scheduled
  }

  /**
   * Schedule notification for specific day of week
   */
  private scheduleForDayOfWeek(
    date: Date,
    dayOfWeek: number,
    hour: number,
    minute: number,
    timezone: string
  ): Date {
    const scheduled = new Date(date)
    const currentDay = scheduled.getDay()
    
    // Calculate days until target day
    let daysUntilTarget = dayOfWeek - currentDay
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7 // Next week
    }
    
    scheduled.setDate(scheduled.getDate() + daysUntilTarget)
    scheduled.setHours(hour, minute, 0, 0)
    
    return scheduled
  }

  /**
   * Parse birth location string to coordinates
   */
  private parseBirthLocation(locationStr?: string): { latitude: number; longitude: number } {
    // Default to a major city if no location provided
    if (!locationStr) {
      return { latitude: 40.7128, longitude: -74.0060 } // New York
    }

    // TODO: Implement proper geocoding
    // For now, return default coordinates
    return { latitude: 40.7128, longitude: -74.0060 }
  }

  /**
   * Calculate intensity based on aspects
   */
  private calculateIntensity(aspects: DetectedAspect[]): 'high' | 'medium' | 'low' {
    const strongAspects = aspects.filter(a => a.intensity === 'high').length
    const totalAspects = aspects.length

    if (strongAspects >= 3 || totalAspects >= 6) return 'high'
    if (strongAspects >= 1 || totalAspects >= 3) return 'medium'
    return 'low'
  }

  /**
   * Generate Do list based on theme and aspects
   */
  private generateDoList(theme: string, aspects: DetectedAspect[]): string[] {
    const doList = []

    if (theme.includes('Relationships')) {
      doList.push('Connect with loved ones', 'Practice active listening')
    }
    if (theme.includes('Career')) {
      doList.push('Focus on important tasks', 'Network with colleagues')
    }
    if (theme.includes('Transformation')) {
      doList.push('Embrace change', 'Try something new')
    }

    // Add aspect-specific guidance
    aspects.forEach(aspect => {
      if (aspect.aspect === 'trine') {
        doList.push('Flow with harmonious energy')
      } else if (aspect.aspect === 'square') {
        doList.push('Face challenges head-on')
      }
    })

    return doList.slice(0, 4) // Limit to 4 items
  }

  /**
   * Generate Don't list based on theme and aspects
   */
  private generateDontList(theme: string, aspects: DetectedAspect[]): string[] {
    const dontList = []

    if (theme.includes('Relationships')) {
      dontList.push('Avoid important conversations when stressed')
    }
    if (theme.includes('Career')) {
      dontList.push('Don\'t procrastinate on key decisions')
    }
    if (theme.includes('Transformation')) {
      dontList.push('Don\'t resist necessary changes')
    }

    return dontList.slice(0, 3) // Limit to 3 items
  }

  /**
   * Get most frequent item from array
   */
  private getMostFrequent<T>(items: T[]): T {
    const frequency = new Map<T, number>()
    items.forEach(item => {
      frequency.set(item, (frequency.get(item) || 0) + 1)
    })
    
    let maxCount = 0
    let mostFrequent = items[0]
    
    frequency.forEach((count, item) => {
      if (count > maxCount) {
        maxCount = count
        mostFrequent = item
      }
    })
    
    return mostFrequent
  }

  /**
   * Get strongest aspects from weekly forecast
   */
  private getStrongestAspects(weeklyForecast: any[]): string[] {
    const allAspects = weeklyForecast.flatMap(f => f.aspects || [])
    const strongAspects = allAspects
      .filter((a: any) => a.intensity === 'high')
      .slice(0, 5)
      .map((a: any) => `${a.planet1} ${a.aspect} ${a.planet2}`)
    
    return strongAspects
  }

  /**
   * Send in-app notification
   */
  private async sendInAppNotification(
    notificationId: string,
    content: NotificationContent
  ): Promise<void> {
    // TODO: Implement WebSocket or Server-Sent Events for real-time delivery
    console.log(`[Notification] In-app notification ${notificationId}:`, content)
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    notificationId: string,
    content: NotificationContent
  ): Promise<void> {
    // TODO: Implement email service integration
    console.log(`[Notification] Email notification ${notificationId}:`, content)
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(
    notificationId: string,
    content: NotificationContent
  ): Promise<void> {
    // TODO: Implement push notification service
    console.log(`[Notification] Push notification ${notificationId}:`, content)
  }

  /**
   * Mark notification as failed
   */
  private async markNotificationFailed(
    notificationId: string,
    errorMessage: string
  ): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'failed',
        lastError: errorMessage,
        retryCount: { increment: 1 }
      }
    })
  }
}

export const notificationService = new NotificationService()
