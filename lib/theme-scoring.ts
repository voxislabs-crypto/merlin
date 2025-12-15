// Theme scoring algorithms for Merlin
export interface ThemeScore {
  theme: string
  score: number
  aspects: string[]
  resonance: number
}

export interface ScoringFactors {
  aspectStrength: number
  orbTightness: number
  userResonance: number
  housePlacement: number
}

export function calculateThemeScore(
  theme: string,
  aspects: any[],
  resonanceStats: Record<string, number>,
  housePlacements?: Record<string, number>
): ThemeScore {
  const factors: ScoringFactors = {
    aspectStrength: calculateAspectStrength(aspects),
    orbTightness: calculateOrbTightness(aspects),
    userResonance: resonanceStats[theme] || 0.5,
    housePlacement: housePlacements ? calculateHouseInfluence(theme, housePlacements) : 0
  }

  // Weighted scoring algorithm
  const baseScore = (factors.aspectStrength * 0.4) + 
                   (factors.orbTightness * 0.2) + 
                   (factors.userResonance * 0.3) + 
                   (factors.housePlacement * 0.1)

  return {
    theme,
    score: Math.max(0, Math.min(1, baseScore)),
    aspects: aspects.map(a => `${a.planets[0]}-${a.planets[1]} ${a.aspect}`),
    resonance: factors.userResonance
  }
}

function calculateAspectStrength(aspects: any[]): number {
  if (aspects.length === 0) return 0
  
  const totalStrength = aspects.reduce((sum, aspect) => {
    return sum + (aspect.strength || 0)
  }, 0)
  
  return Math.min(1, totalStrength / aspects.length)
}

function calculateOrbTightness(aspects: any[]): number {
  if (aspects.length === 0) return 0
  
  const totalOrb = aspects.reduce((sum, aspect) => {
    return sum + (aspect.orb || 10)
  }, 0)
  
  const avgOrb = totalOrb / aspects.length
  // Lower orb = higher score (inverted scale)
  return Math.max(0, 1 - (avgOrb / 10))
}

function calculateHouseInfluence(theme: string, housePlacements: Record<string, number>): number {
  // Simple house influence calculation
  const relevantHouses = getThemeRelevantHouses(theme)
  let score = 0
  
  for (const house of relevantHouses) {
    if (housePlacements[house]) {
      score += housePlacements[house] / relevantHouses.length
    }
  }
  
  return Math.min(1, score)
}

function getThemeRelevantHouses(theme: string): number[] {
  const houseMappings: Record<string, number[]> = {
    'career': [10, 6, 2],
    'relationships': [7, 5, 11],
    'innerWork': [12, 8, 4],
    'communication': [3, 9, 1],
    'finance': [2, 8, 10]
  }
  
  return houseMappings[theme] || [1, 4, 7, 10]
}

export function rankThemes(scores: ThemeScore[]): ThemeScore[] {
  return scores.sort((a, b) => b.score - a.score)
}

export function getTopThemes(scores: ThemeScore[], count: number = 3): ThemeScore[] {
  return rankThemes(scores).slice(0, count)
}
