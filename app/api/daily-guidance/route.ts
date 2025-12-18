import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { getPlanetPosition } from '@/lib/ephemeris'
import { detectAspects } from '@/lib/aspects'
import { calculateHouses } from '@/lib/astrology/calculations'
import { ZODIAC_SIGNS } from '@/lib/astrology/planetaryData'

const prisma = new PrismaClient()

// Theme assignment logic based on transits and natal houses
function assignThemes(transits: any[], natalHouses: any[], timeOfDay: string) {
  const themes = []
  
  // Analyze strongest transits
  const strongTransits = transits.filter(t => t.strength > 0.7)
  
  // House-based themes
  const activeHouses = transits.map(t => t.house).filter(Boolean)
  const emphasizedHouses = [1, 4, 7, 10] // Angular houses
  
  if (activeHouses.some(h => emphasizedHouses.includes(h))) {
    themes.push({
      name: 'karmic-alignment',
      weight: 0.8,
      description: 'Major life lessons and soul contracts are activated'
    })
  }
  
  // Planet-based themes
  const outerPlanets = transits.filter(t => 
    ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].includes(t.transitingPlanet)
  )
  
  if (outerPlanets.length > 0) {
    themes.push({
      name: 'collective-awakening',
      weight: 0.7,
      description: 'Societal shifts and collective consciousness movements'
    })
  }
  
  // Venus/Mars themes
  const venusMarsTransits = transits.filter(t => 
    ['Venus', 'Mars'].includes(t.transitingPlanet)
  )
  
  if (venusMarsTransits.length > 0) {
    themes.push({
      name: 'relationship-dynamics',
      weight: 0.6,
      description: 'Personal connections and creative expression are highlighted'
    })
  }
  
  // Mercury themes
  const mercuryTransits = transits.filter(t => t.transitingPlanet === 'Mercury')
  if (mercuryTransits.length > 0) {
    themes.push({
      name: 'communication-flow',
      weight: 0.5,
      description: 'Ideas, messages, and mental clarity are emphasized'
    })
  }
  
  return themes.sort((a, b) => b.weight - a.weight)
}

// Generate daily guidance message
function generateDailyGuidance(
  primaryTheme: any,
  transits: any[],
  timeOfDay: string,
  userMood: string,
  resonanceStats?: any
) {
  const themeTemplates = {
    'karmic-alignment': {
      morning: {
        message: "Today the universe calls you to honor your soul's contracts. Significant lessons are unfolding through your interactions. Pay attention to repeating patterns and synchronicities.",
        tip: "Before making decisions, ask: 'What is my soul teaching me now?'",
        mood: "reflective, purposeful"
      },
      afternoon: {
        message: "Karmic energies are intensifying as the day progresses. Old wounds may surface for healing. This is sacred work that liberates your soul's journey.",
        tip: "Practice forgiveness toward yourself and others who've played roles in your growth",
        mood: "transformative, healing"
      },
      evening: {
        message: "As day closes, integrate the lessons learned. Your soul chose these experiences for evolution. Honor the wisdom gained through today's challenges.",
        tip: "Journal three insights: What challenged me, what healed me, what expanded me?",
        mood: "integrative, grateful"
      }
    },
    'collective-awakening': {
      morning: {
        message: "You're being called to serve the greater good today. Your unique gifts are needed in the collective awakening. Notice how your personal journey connects to global shifts.",
        tip: "Ask: 'How can my highest service support humanity's evolution?'",
        mood: "visionary, expansive"
      },
      afternoon: {
        message: "Collective energies are building momentum. You may feel pulled toward community causes or humanitarian efforts. Your voice matters in the great conversation.",
        tip: "Share your insights with others - you're channeling collective wisdom",
        mood: "connected, activist"
      },
      evening: {
        message: "The day's collective energies settle into your field. You've participated in something larger than yourself. Rest in the knowing that your contribution rippled outward.",
        tip: "Visualize your positive impact spreading like waves across the collective consciousness",
        mood: "peaceful, fulfilled"
      }
    },
    'relationship-dynamics': {
      morning: {
        message: "Love and creative energies flow strongly today. Your heart chakra is activated for deeper connections and authentic expression. Beauty seeks you through relationships and art.",
        tip: "Lead with vulnerability - it's your superpower in connections today",
        mood: "loving, creative"
      },
      afternoon: {
        message: "Relationship energies deepen as day unfolds. Important conversations may arise. Your capacity for both intimacy and independence is being tested and strengthened.",
        tip: "Balance giving and receiving - both are forms of love",
        mood: "passionate, balanced"
      },
      evening: {
        message: "Evening brings sweet connection energies. Share quality time with loved ones or create something beautiful. Your heart's wisdom guides you perfectly.",
        tip: "Express appreciation to those who mirror your best qualities back to you",
        mood: "romantic, appreciative"
      }
    },
    'communication-flow': {
      morning: {
        message: "Your mind is crystal clear and ready for brilliant insights. Messages you've been waiting to receive are finally breaking through. Communication channels open wide.",
        tip: "Capture first thoughts upon waking - they carry today's most valuable guidance",
        mood: "articulate, inspired"
      },
      afternoon: {
        message: "Mental energies peak as day progresses. Important conversations, writing, or learning are favored. Your words carry unusual power and precision now.",
        tip: "Speak your truth even if your voice shakes - authenticity is magnetic",
        mood: "focused, expressive"
      },
      evening: {
        message: "As evening settles, integrate today's mental breakthroughs. Your mind has expanded to hold new truths. Rest in the satisfaction of clarity achieved.",
        tip: "Review today's communications - notice patterns in your evolving perspective",
        mood: "thoughtful, satisfied"
      }
    }
  }
  
  const timeKey = timeOfDay as keyof typeof themeTemplates[typeof primaryTheme.name]
  const template = themeTemplates[primaryTheme.name]?.[timeKey] || themeTemplates['karmic-alignment'].morning
  
  // Personalize based on resonance stats
  let resonanceNote = ""
  if (resonanceStats?.accuracy > 0.8) {
    resonanceNote = "This guidance resonates strongly with your proven intuitive accuracy. Trust the clarity you're experiencing."
  } else if (resonanceStats?.recentFeedback > 0.7) {
    resonanceNote = "Your recent feedback shows growing alignment with cosmic energies. Continue trusting your inner guidance."
  }
  
  return {
    ...template,
    resonanceNote
  }
}

// Detect time of day
function detectTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  return 'evening'
}

export async function GET() {
  try {
    // Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current date
    const currentDate = new Date()
    const timeOfDay = detectTimeOfDay()

    // Use mock birth chart data for now (database table issue)
    const birthChart = {
      id: 'demo',
      userId,
      birthDate: new Date('1990-01-01T12:00:00Z'),
      latitude: 40.7128,
      longitude: -74.0060,
      planets: {
        Sun: { longitude: 280.5, sign: 'Capricorn', house: 10 },
        Moon: { longitude: 120.3, sign: 'Cancer', house: 4 },
        Mercury: { longitude: 290.1, sign: 'Capricorn', house: 10 },
        Venus: { longitude: 310.7, sign: 'Aquarius', house: 11 },
        Mars: { longitude: 45.2, sign: 'Taurus', house: 2 },
        Jupiter: { longitude: 95.8, sign: 'Cancer', house: 4 },
        Saturn: { longitude: 285.4, sign: 'Capricorn', house: 10 },
        Uranus: { longitude: 275.9, sign: 'Capricorn', house: 10 },
        Neptune: { longitude: 282.3, sign: 'Capricorn', house: 10 },
        Pluto: { longitude: 225.6, sign: 'Scorpio', house: 8 }
      },
      houses: []
    }

    // Calculate current planetary positions
    const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
    const transitingPositions: Record<string, any> = {}
    
    for (const planetName of planetNames) {
      const planetData = await getPlanetPosition(
        planetName,
        currentDate,
        birthChart.latitude,
        birthChart.longitude
      )
      transitingPositions[planetName] = planetData
    }

    // Calculate natal houses
    const natalHouses = calculateHouses(
      birthChart.birthDate,
      birthChart.latitude,
      birthChart.longitude
    )

    // Detect aspects between current and natal planets
    const allPositions = {
      ...transitingPositions,
      ...(birthChart.planets || {})
    }

    const aspects = detectAspects(allPositions)
    
    // Filter for active transits only
    const activeTransits = aspects
      .filter(aspect => {
        const isTransitingPlanet = planetNames.includes(aspect.planets[0])
        const isNatalPlanet = Object.keys(birthChart.planets).includes(aspect.planets[1])
        return isTransitingPlanet && isNatalPlanet
      })
      .map(aspect => {
        const orb = aspect.orb || 0
        const strength = Math.max(0, 1 - (orb / 10)) // Simple strength calculation
        
        return {
          transitingPlanet: aspect.planets[0],
          natalPlanet: aspect.planets[1],
          aspect: aspect.aspect,
          orb: Math.abs(orb),
          strength,
          house: getHouseForLongitude(transitingPositions[aspect.planets[0]].longitude, natalHouses)
        }
      })
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 3) // Top 3 transits for UI

    // Assign themes based on transits
    const themes = assignThemes(activeTransits, natalHouses, timeOfDay)
    const primaryTheme = themes[0] || { name: 'karmic-alignment', weight: 0.5 }

    // Get user resonance stats (mock for now)
    const resonanceStats = {
      accuracy: 0.85,
      recentFeedback: 0.78,
      mood: 'receptive'
    }

    // Generate daily guidance
    const guidance = generateDailyGuidance(
      primaryTheme,
      activeTransits,
      timeOfDay,
      resonanceStats.mood,
      resonanceStats
    )

    const response = {
      date: currentDate.toISOString().split('T')[0],
      primaryTheme: primaryTheme.name,
      message: guidance.message,
      tip: guidance.tip,
      confidence: primaryTheme.weight,
      mood: guidance.mood,
      activeTransits,
      resonanceNote: guidance.resonanceNote
    }

    // Log generation
    console.log(`Daily guidance generated for user ${userId} - primary theme: ${primaryTheme.name}`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Daily Guidance API] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}

// Helper function
function getHouseForLongitude(longitude: number, houses: any[]): number {
  for (let i = 0; i < houses.length; i++) {
    const houseCusp = houses[i].position
    const nextCusp = houses[(i + 1) % houses.length].position
    if (longitude >= houseCusp && longitude < nextCusp) {
      return i + 1
    }
  }
  return 1 // Default to 1st house
}
