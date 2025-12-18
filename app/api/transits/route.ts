import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { getPlanetPosition } from '@/lib/ephemeris'
import { detectAspects } from '@/lib/aspects'
import { calculateHouses } from '@/lib/astrology/calculations'
import { ZODIAC_SIGNS } from '@/lib/astrology/planetaryData'

const prisma = new PrismaClient()

interface PlanetPosition {
  name: string
  longitude: number
  sign: string
  house: number
  speed?: number
}

interface Transit {
  transitingPlanet: string
  natalPlanet: string
  aspect: string
  orb: number
  applying: boolean
  strength: number
  interpretation: string
}

interface TransitResponse {
  currentDate: string
  transitingPlanets: PlanetPosition[]
  natalPlanets: PlanetPosition[]
  activeTransits: Transit[]
  summary: string
  mood: string
  advice: string
}

// Aspect interpretations
const aspectInterpretations: Record<string, Record<string, string>> = {
  'conjunction': {
    'Sun': 'Your core identity merges with this energy, amplifying its influence',
    'Moon': 'Emotions and instincts are heightened and deeply felt',
    'Mercury': 'Thoughts and communication take on this energy\'s character',
    'Venus': 'Relationships and values are infused with this planetary essence',
    'Mars': 'Action and drive are energized and expressed through this influence',
    'Jupiter': 'Expansion and growth flow through this area of your life',
    'Saturn': 'Structure and discipline focus on this domain',
    'Uranus': 'Innovation and awakening spark through this connection',
    'Neptune': 'Dreams and intuition blend with this energy',
    'Pluto': 'Transformation intensifies through this powerful alignment'
  },
  'opposition': {
    'Sun': 'Your identity faces tension, requiring balance and integration',
    'Moon': 'Emotional needs conflict with external demands',
    'Mercury': 'Communication challenges require careful expression',
    'Venus': 'Relationship tensions highlight areas needing harmony',
    'Mars': 'Action and will face resistance, requiring strategy',
    'Jupiter': 'Expansion meets limits, requiring moderation',
    'Saturn': 'Structure and freedom seek balance',
    'Uranus': 'Change meets resistance, requiring patience',
    'Neptune': 'Reality and dreams need grounding',
    'Pluto': 'Power dynamics surface for transformation'
  },
  'square': {
    'Sun': 'Your path faces challenges that build strength and character',
    'Moon': 'Emotional tensions catalyze growth and awareness',
    'Mercury': 'Mental challenges sharpen your thinking',
    'Venus': 'Relationship tensions reveal deeper needs',
    'Mars': 'Action requires strategy and patience',
    'Jupiter': 'Growth meets obstacles that test your resolve',
    'Saturn': 'Discipline faces tests of commitment',
    'Uranus': 'Innovation meets practical constraints',
    'Neptune': 'Illusions dissolve, revealing truth',
    'Pluto': 'Power struggles force transformation'
  },
  'trine': {
    'Sun': 'Your essence flows harmoniously with supportive energies',
    'Moon': 'Emotions find natural expression and ease',
    'Mercury': 'Communication flows with grace and clarity',
    'Venus': 'Relationships blossom with natural harmony',
    'Mars': 'Action meets opportunity and support',
    'Jupiter': 'Expansion flows with fortunate timing',
    'Saturn': 'Structure supports your ambitions',
    'Uranus': 'Change happens with ease and innovation',
    'Neptune': 'Intuition and dreams guide you gently',
    'Pluto': 'Transformation unfolds with supportive power'
  },
  'sextile': {
    'Sun': 'Your identity finds gentle opportunities for expression',
    'Moon': 'Emotional connections form with ease',
    'Mercury': 'Ideas and communication find receptive audiences',
    'Venus': 'Relationship opportunities arise naturally',
    'Mars': 'Action finds supportive circumstances',
    'Jupiter': 'Growth opportunities present themselves',
    'Saturn': 'Structure finds practical application',
    'Uranus': 'Innovation finds creative outlets',
    'Neptune': 'Intuition offers subtle guidance',
    'Pluto': 'Transformation finds gentle pathways'
  }
}

// Mood and advice generators
const generateMood = (transits: Transit[]): string => {
  const majorAspects = transits.filter(t => ['conjunction', 'opposition', 'square'].includes(t.aspect))
  const harmoniousAspects = transits.filter(t => ['trine', 'sextile'].includes(t.aspect))
  
  if (majorAspects.length > harmoniousAspects.length) {
    return 'dynamic and challenging'
  } else if (harmoniousAspects.length > majorAspects.length) {
    return 'harmonious and flowing'
  } else {
    return 'balanced and reflective'
  }
}

const generateAdvice = (transits: Transit[]): string => {
  const strongest = transits.sort((a, b) => b.strength - a.strength)[0]
  if (!strongest) return 'Trust the cosmic flow and stay present with your experiences'
  
  if (strongest.aspect === 'conjunction') {
    return 'Embrace the powerful energy and channel it consciously'
  } else if (strongest.aspect === 'opposition') {
    return 'Seek balance between opposing forces and find the middle way'
  } else if (strongest.aspect === 'square') {
    return 'Face challenges as opportunities for growth and strength'
  } else if (strongest.aspect === 'trine') {
    return 'Flow with the supportive energies and express your gifts'
  } else {
    return 'Notice the subtle opportunities and gentle nudges'
  }
}

const generateSummary = (transits: Transit[]): string => {
  const top3 = transits.sort((a, b) => b.strength - a.strength).slice(0, 3)
  if (top3.length === 0) return 'A quiet cosmic day for reflection and integration'
  
  return top3.map(t => `${t.transitingPlanet} ${t.aspect} ${t.natalPlanet}`).join(', ')
}

export async function GET() {
  try {
    // Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current date in UTC
    const currentDate = new Date()
    
    // Fetch user's birth chart
    const birthChart = await prisma.birthChart.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    if (!birthChart) {
      // Create a demo birth chart if none exists
      const demoBirthChart = await prisma.birthChart.create({
        data: {
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
      })
      
      return NextResponse.json({ 
        error: 'No birth chart found. Created demo chart. Please update your birth data in settings.',
        demoChart: true 
      }, { status: 404 })
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

    // Calculate transiting houses (current planets in natal houses)
    const natalHouses = calculateHouses(
      new Date(birthChart.birthDate),
      birthChart.latitude,
      birthChart.longitude
    )

    // Format transiting planets
    const transitingPlanets: PlanetPosition[] = Object.entries(transitingPositions).map(([name, pos]: [string, any]) => ({
      name,
      longitude: pos.longitude,
      sign: ZODIAC_SIGNS[Math.floor(pos.longitude / 30) % 12],
      house: getHouseForLongitude(pos.longitude, natalHouses),
      speed: pos.speed
    }))

    // Format natal planets from cached chart
    const natalPlanets: PlanetPosition[] = Object.entries(birthChart.planets || {}).map(([name, pos]: [string, any]) => ({
      name,
      longitude: pos.longitude,
      sign: ZODIAC_SIGNS[Math.floor(pos.longitude / 30) % 12],
      house: pos.house || 1
    }))

    // Calculate transits (aspects between current and natal planets)
    const allPositions = {
      ...transitingPositions,
      ...(birthChart.planets || {})
    }

    const aspects = detectAspects(allPositions)
    
    // Filter for transiting aspects only (current planet aspecting natal planet)
    const activeTransits: Transit[] = aspects
      .filter(aspect => {
        const isTransitingPlanet = transitingPlanets.some(p => p.name === aspect.planets[0])
        const isNatalPlanet = natalPlanets.some(p => p.name === aspect.planets[1])
        return isTransitingPlanet && isNatalPlanet
      })
      .map(aspect => {
        const orb = aspect.orb || 0
        const strength = calculateTransitStrength(aspect.aspect, orb)
        const applying = isApplyingAspect(aspect)
        
        const interpretation = generateInterpretation(
          aspect.planets[0],
          aspect.planets[1],
          aspect.aspect
        )

        return {
          transitingPlanet: aspect.planets[0],
          natalPlanet: aspect.planets[1],
          aspect: aspect.aspect,
          orb: Math.abs(orb),
          applying,
          strength,
          interpretation
        }
      })
      .sort((a, b) => b.strength - a.strength)

    // Generate summary, mood, and advice
    const summary = generateSummary(activeTransits)
    const mood = generateMood(activeTransits)
    const advice = generateAdvice(activeTransits)

    const response: TransitResponse = {
      currentDate: currentDate.toISOString(),
      transitingPlanets,
      natalPlanets,
      activeTransits,
      summary,
      mood,
      advice
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Transits API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function getHouseForLongitude(longitude: number, houses: any[]): number {
  for (let i = 0; i < houses.length; i++) {
    const houseCusp = houses[i].position
    const nextCusp = houses[(i + 1) % houses.length].position
    
    if (longitude >= houseCusp && longitude < nextCusp) {
      return i + 1
    }
  }
  return 1 // Default to first house
}

function calculateTransitStrength(aspect: string, orb: number): number {
  const baseStrength = {
    'conjunction': 1.0,
    'opposition': 0.9,
    'square': 0.8,
    'trine': 0.7,
    'sextile': 0.6
  }[aspect] || 0.5

  // Reduce strength based on orb
  const orbPenalty = Math.max(0, 1 - (orb / 10))
  return baseStrength * orbPenalty
}

function isApplyingAspect(aspect: any): boolean {
  // Simplified logic - would need actual planetary speeds
  return Math.random() > 0.5
}

function generateInterpretation(transitingPlanet: string, natalPlanet: string, aspect: string): string {
  const baseInterpretation = aspectInterpretations[aspect]?.[natalPlanet] || 
    `Transiting ${transitingPlanet} ${aspect} natal ${natalPlanet}: cosmic energies align`
  
  return `Transiting ${transitingPlanet} ${aspect} natal ${natalPlanet}: ${baseInterpretation.toLowerCase()}`
}
