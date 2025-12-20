import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { notificationService } from '@/lib/notifications/notification-service'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId }
    })

    if (!preferences) {
      // Create default preferences for new user
      const defaultPreferences = await prisma.notificationPreference.create({
        data: {
          userId,
          pushEnabled: true,
          emailEnabled: false,
          morningTime: '08:00',
          eveningTime: '20:00',
          weeklyDay: 0, // Sunday
          weeklyTime: '10:00',
          dailyEnabled: true,
          weeklyEnabled: true,
          themeEnabled: true,
          aspectsEnabled: true,
          mbtiEnabled: true
        }
      })

      return NextResponse.json(defaultPreferences)
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('[API] Error getting notification preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...preferences } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate time formats
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (preferences.morningTime && !timeRegex.test(preferences.morningTime)) {
      return NextResponse.json(
        { error: 'Invalid morning time format. Use HH:MM' },
        { status: 400 }
      )
    }

    if (preferences.eveningTime && !timeRegex.test(preferences.eveningTime)) {
      return NextResponse.json(
        { error: 'Invalid evening time format. Use HH:MM' },
        { status: 400 }
      )
    }

    if (preferences.weeklyTime && !timeRegex.test(preferences.weeklyTime)) {
      return NextResponse.json(
        { error: 'Invalid weekly time format. Use HH:MM' },
        { status: 400 }
      )
    }

    // Validate weekly day
    if (preferences.weeklyDay !== undefined && (preferences.weeklyDay < 0 || preferences.weeklyDay > 6)) {
      return NextResponse.json(
        { error: 'Weekly day must be between 0 (Sunday) and 6 (Saturday)' },
        { status: 400 }
      )
    }

    const updatedPreferences = await prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        ...preferences,
        updatedAt: new Date()
      },
      create: {
        userId,
        ...preferences
      }
    })

    // Reschedule notifications based on new preferences
    if (preferences.dailyEnabled !== false) {
      await notificationService.scheduleDailyNotifications(userId)
    }
    if (preferences.weeklyEnabled !== false) {
      await notificationService.scheduleWeeklyNotifications(userId)
    }

    return NextResponse.json(updatedPreferences)
  } catch (error) {
    console.error('[API] Error updating notification preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
