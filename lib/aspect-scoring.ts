// Aspect scoring algorithms for Merlin
import { Aspect } from './aspects'

export interface AspectScore {
  aspect: Aspect
  score: number
  weight: number
  significance: string
}

export interface ScoringWeights {
  strength: number
  orb: number
  planetImportance: number
  housePlacement: number
}

export function calculateAspectScore(
  aspect: Aspect,
  weights: Partial<ScoringWeights> = {}
): AspectScore {
  const defaultWeights: ScoringWeights = {
    strength: 0.4,
    orb: 0.3,
    planetImportance: 0.2,
    housePlacement: 0.1
  }

  const finalWeights = { ...defaultWeights, ...weights }

  // Calculate individual components
  const strengthScore = getStrengthScore(aspect.strength)
  const orbScore = getOrbScore(aspect.orb)
  const planetScore = getPlanetImportanceScore(aspect.planets)
  const houseScore = 0.5 // Default house score (would be calculated from actual placements)

  // Weighted combination
  const rawScore = (strengthScore * finalWeights.strength) +
                   (orbScore * finalWeights.orb) +
                   (planetScore * finalWeights.planetImportance) +
                   (houseScore * finalWeights.housePlacement)

  const score = Math.max(0, Math.min(1, rawScore))
  const significance = getSignificance(score)

  return {
    aspect,
    score,
    weight: calculateWeight(aspect),
    significance
  }
}

function getStrengthScore(strength: string): number {
  switch (strength) {
    case 'high': return 1.0
    case 'medium': return 0.7
    case 'low': return 0.4
    default: return 0.5
  }
}

function getOrbScore(orb: number): number {
  // Lower orb = higher score
  if (orb <= 1) return 1.0
  if (orb <= 3) return 0.8
  if (orb <= 5) return 0.6
  if (orb <= 8) return 0.4
  return 0.2
}

function getPlanetImportanceScore(planets: [string, string]): number {
  const planetWeights: Record<string, number> = {
    'SUN': 1.0,
    'MOON': 0.9,
    'MERCURY': 0.7,
    'VENUS': 0.8,
    'MARS': 0.8,
    'JUPITER': 0.9,
    'SATURN': 0.9,
    'URANUS': 0.7,
    'NEPTUNE': 0.7,
    'PLUTO': 0.6
  }

  const [planet1, planet2] = planets
  const weight1 = planetWeights[planet1] || 0.5
  const weight2 = planetWeights[planet2] || 0.5

  return (weight1 + weight2) / 2
}

function calculateWeight(aspect: Aspect): number {
  // Calculate weight based on aspect type and planets involved
  const aspectWeights: Record<string, number> = {
    'conjunction': 1.0,
    'opposition': 0.9,
    'trine': 0.8,
    'square': 0.7,
    'sextile': 0.6,
    'quincunx': 0.5,
    'semisextile': 0.4,
    'semisquare': 0.3,
    'sesquiquadrate': 0.3
  }

  const baseWeight = aspectWeights[aspect.aspect] || 0.5
  const planetMultiplier = getPlanetImportanceScore(aspect.planets)

  return baseWeight * planetMultiplier
}

function getSignificance(score: number): string {
  if (score >= 0.8) return 'major'
  if (score >= 0.6) return 'significant'
  if (score >= 0.4) return 'moderate'
  return 'minor'
}

export function rankAspectsByScore(scores: AspectScore[]): AspectScore[] {
  return scores.sort((a, b) => b.score - a.score)
}

export function getTopAspects(scores: AspectScore[], count: number = 5): AspectScore[] {
  return rankAspectsByScore(scores).slice(0, count)
}

export function filterAspectsBySignificance(
  scores: AspectScore[],
  minSignificance: string
): AspectScore[] {
  const significanceOrder = ['minor', 'moderate', 'significant', 'major']
  const minIndex = significanceOrder.indexOf(minSignificance)

  return scores.filter(score => {
    const index = significanceOrder.indexOf(score.significance)
    return index >= minIndex
  })
}
