import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { notificationService } from '@/lib/notifications/notification-service'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status') || 'all'
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const whereClause: any = { userId }
    if (status !== 'all') {
      whereClause.status = status
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { scheduledAt: 'desc' },
      take: limit,
      include: {
        // Note: We'll need to add relationship to UserProfile in schema
      }
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('[API] Error getting notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, type, title, scheduledAt, timezone = 'UTC' } = body

    if (!userId || !type || !title) {
      return NextResponse.json(
        { error: 'User ID, type, and title are required' },
        { status: 400 }
      )
    }

    if (!['morning', 'evening', 'weekly'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be morning, evening, or weekly' },
        { status: 400 }
      )
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        content: {} as any, // Will be populated when sent
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        timezone,
        status: 'scheduled'
      }
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('[API] Error creating notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, status, readAt } = body

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (status) {
      if (!['scheduled', 'sent', 'read', 'failed'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        )
      }
      updateData.status = status
    }

    if (readAt) {
      updateData.readAt = new Date(readAt)
    }

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: updateData
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('[API] Error updating notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
