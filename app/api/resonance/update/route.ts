import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    const { 
      itemId, 
      itemType, 
      score, 
      mbtiType, 
      note, 
      forecastId 
    } = await req.json()
    // Here you would typically save the feedback to your database
    // For example:
    // await prisma.resonanceFeedback.create({
    //   data: {
    //     userId,
    //     itemId,
    //     itemType,
    //     score,
    //     mbtiType,
    //     note,
    //     forecastId
    //   }
    // })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[RESONANCE_FEEDBACK_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
