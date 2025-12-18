import { ZODIAC_SIGNS, PLANET_MEANINGS, ASPECT_MEANINGS } from './planetaryData'

// Convert degrees to radians
const toRad = (deg: number): number => (deg * Math.PI) / 180

// Convert radians to degrees
const toDeg = (rad: number): number => (rad * 180) / Math.PI

// Normalize a degree to 0-360 range
const normalizeDegree = (deg: number): number => {
  let normalized = deg % 360
  return normalized < 0 ? normalized + 360 : normalized
}

// Calculate the zodiac sign from longitude
const getZodiacSign = (longitude: number): string => {
  const signIndex = Math.floor(longitude / 30)
  return ZODIAC_SIGNS[signIndex % 12]
}

// Calculate house cusps using Placidus house system
export function calculateHouses(
  date: Date,
  latitude: number,
  longitude: number
): Array<{
  position: number
  sign: string
  degree: number
  minute: number
  second: number
}> {
  // This is a simplified calculation
  // In a real implementation, you would use a proper house system calculation
  
  // Get the sidereal time (simplified)
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60
  const siderealTime = (hours * 15 + longitude + 180) % 360
  
  // Calculate house cusps (simplified)
  const houses = []
  for (let i = 0; i < 12; i++) {
    // Each house is 30 degrees apart, starting from the ascendant
    const cusp = (siderealTime + i * 30) % 360
    const sign = getZodiacSign(cusp)
    const degree = cusp % 30
    const minute = (degree % 1) * 60
    const second = (minute % 1) * 60
    
    houses.push({
      position: cusp,
      sign,
      degree: Math.floor(degree),
      minute: Math.floor(minute),
      second: Math.floor(second)
    })
  }
  
  return houses
}

// Calculate planetary positions
export function getPlanetaryPositions(
  date: Date,
  latitude: number,
  longitude: number
): Record<string, any> {
  // This is a simplified calculation
  // In a real implementation, you would use a proper ephemeris
  
  const positions: Record<string, any> = {}
  const planets = Object.keys(PLANET_MEANINGS)
  
  // Base positions (simplified - in reality, you'd use an ephemeris)
  const basePositions: Record<string, number> = {
    SUN: 120,    // 0° Leo
    MOON: 240,   // 0° Sagittarius
    MERCURY: 150, // 0° Virgo
    VENUS: 180,  // 0° Libra
    MARS: 210,   // 0° Scorpio
    JUPITER: 240, // 0° Sagittarius
    SATURN: 270,  // 0° Capricorn
    URANUS: 300,  // 0° Aquarius
    NEPTUNE: 330, // 0° Pisces
    PLUTO: 0,     // 0° Aries
    CHIRON: 60,   // 0° Gemini
    NORTH_NODE: 90, // 0° Cancer
    SOUTH_NODE: 270 // 0° Capricorn
  }
  
  // Add some variation based on the current time
  const timeFactor = (date.getTime() % 1000000) / 1000000
  
  planets.forEach(planet => {
    // Add some random variation to positions (in a real app, use actual ephemeris)
    const basePos = basePositions[planet] || 0
    const variation = Math.sin(timeFactor * Math.PI * 2) * 15 // ±15° variation
    const longitude = normalizeDegree(basePos + variation)
    const sign = getZodiacSign(longitude)
    const signDegree = longitude % 30
    
    positions[planet] = {
      longitude,
      latitude: 0, // Simplified
      speed: 1,    // Simplified
      sign,
      house: Math.floor(longitude / 30) % 12 + 1, // Simplified house calculation
      degree: Math.floor(signDegree),
      minute: Math.floor((signDegree % 1) * 60),
      second: Math.floor((((signDegree % 1) * 60) % 1) * 60)
    }
  })
  
  return positions
}

// Calculate aspects between planets
export function calculateAspects(positions: Record<string, any>): Array<{
  planet1: { name: string; longitude: number }
  planet2: { name: string; longitude: number }
  type: string
  orb: number
  exact: boolean
}> {
  const aspects: any[] = []
  const planets = Object.keys(positions)
  
  // Check aspects between all planet pairs
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i]
      const planet2 = planets[j]
      const pos1 = positions[planet1].longitude
      const pos2 = positions[planet2].longitude
      
      // Calculate the angle between the two planets
      let angle = Math.abs(pos1 - pos2) % 360
      if (angle > 180) angle = 360 - angle
      
      // Check for each aspect type
      for (const [aspectType, aspectData] of Object.entries(ASPECT_MEANINGS)) {
        const exactAspect = aspectType === 'CONJUNCTION' ? 0 :
                          aspectType === 'OPPOSITION' ? 180 :
                          aspectType === 'TRINE' ? 120 :
                          aspectType === 'SQUARE' ? 90 :
                          aspectType === 'SEXTILE' ? 60 : 0
        
        const orb = aspectData.orb || 8 // Default orb of 8 degrees
        
        if (Math.abs(angle - exactAspect) <= orb) {
          const exact = Math.abs(angle - exactAspect) < 1 // Consider exact if within 1 degree
          
          aspects.push({
            planet1: { name: planet1, longitude: pos1 },
            planet2: { name: planet2, longitude: pos2 },
            type: aspectType,
            orb: Math.abs(angle - exactAspect),
            exact
          })
        }
      }
    }
  }
  
  return aspects
}

// Calculate the ascendant (rising sign)
export function calculateAscendant(
  date: Date,
  latitude: number,
  longitude: number
): { sign: string; degree: number; minute: number; second: number } {
  // This is a simplified calculation
  // In a real implementation, you would use proper astronomical formulas
  
  // Get the sidereal time (simplified)
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60
  const siderealTime = (hours * 15 + longitude + 180) % 360
  
  // Calculate the ascendant (simplified)
  const ascendant = siderealTime
  const sign = getZodiacSign(ascendant)
  const degree = ascendant % 30
  const minute = (degree % 1) * 60
  const second = (minute % 1) * 60
  
  return {
    sign,
    degree: Math.floor(degree),
    minute: Math.floor(minute),
    second: Math.floor(second)
  }
}

// Calculate the midheaven (MC)
export function calculateMidheaven(
  date: Date,
  latitude: number,
  longitude: number
): { sign: string; degree: number; minute: number; second: number } {
  // This is a simplified calculation
  // In a real implementation, you would use proper astronomical formulas
  
  // Get the sidereal time (simplified)
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60
  const siderealTime = (hours * 15 + longitude + 180) % 360
  
  // Calculate the midheaven (simplified)
  const mc = (siderealTime + 90) % 360
  const sign = getZodiacSign(mc)
  const degree = mc % 30
  const minute = (degree % 1) * 60
  const second = (minute % 1) * 60
  
  return {
    sign,
    degree: Math.floor(degree),
    minute: Math.floor(minute),
    second: Math.floor(second)
  }
}
