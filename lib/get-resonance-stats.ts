// Get resonance statistics for users
export interface ResonanceStats {
  relationships: number
  career: number
  innerWork: number
  communication: number
  finance: number
}

export interface UserResonanceData {
  userId: string
  stats: ResonanceStats
  lastUpdated: Date
  accuracy: number
}

export function getDefaultResonanceStats(): ResonanceStats {
  return {
    relationships: 0.5,
    career: 0.5,
    innerWork: 0.5,
    communication: 0.5,
    finance: 0.5
  }
}

export function getMockResonanceStats(): ResonanceStats {
  return {
    relationships: 0.8,
    career: 0.6,
    innerWork: 0.4,
    communication: 0.7,
    finance: 0.5
  }
}

export function calculateResonanceAccuracy(
  predictedThemes: string[],
  userFeedback: Record<string, number>
): number {
  if (predictedThemes.length === 0) return 0

  let totalScore = 0
  let count = 0

  for (const theme of predictedThemes) {
    if (userFeedback[theme] !== undefined) {
      totalScore += userFeedback[theme]
      count++
    }
  }

  return count > 0 ? totalScore / count : 0.5
}

export function updateResonanceStats(
  currentStats: ResonanceStats,
  theme: string,
  feedback: number
): ResonanceStats {
  const updatedStats = { ...currentStats }
  
  if (theme in updatedStats) {
    const currentValue = updatedStats[theme as keyof ResonanceStats]
    const adjustment = feedback * 0.1 // Small adjustment factor
    updatedStats[theme as keyof ResonanceStats] = Math.max(0, Math.min(1, currentValue + adjustment))
  }

  return updatedStats
}

export function getTopResonanceThemes(stats: ResonanceStats, count: number = 3): Array<{theme: string, score: number}> {
  const themes = Object.entries(stats)
    .map(([theme, score]) => ({ theme, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)

  return themes
}

export function validateResonanceStats(stats: any): stats is ResonanceStats {
  const requiredKeys: (keyof ResonanceStats)[] = [
    'relationships', 'career', 'innerWork', 'communication', 'finance'
  ]

  if (!stats || typeof stats !== 'object') return false

  for (const key of requiredKeys) {
    if (!(key in stats) || typeof stats[key] !== 'number' || stats[key] < 0 || stats[key] > 1) {
      return false
    }
  }

  return true
}
