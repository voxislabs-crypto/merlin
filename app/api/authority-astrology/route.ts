import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { planet, date, lat, lng } = await request.json()

    // Mock response - in production, this would call the real AuthorityAstrology API
    const mockPosition = {
      longitude: Math.random() * 360,
      latitude: (Math.random() - 0.5) * 10,
      distance: 1 + Math.random() * 5,
      speed: (Math.random() - 0.5) * 2,
    }

    return NextResponse.json(mockPosition)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch position" }, { status: 500 })
  }
}
