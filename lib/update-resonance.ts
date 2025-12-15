// Resonance scoring and update utilities
export interface ResonanceScore {
  theme: string
  score: number
  feedback: number
  lastUpdated: Date
}

export interface UserResonance {
  userId: string
  resonanceScores: Record<string, ResonanceScore>
  overallAccuracy: number
}

export function updateResonanceScore(
  currentResonance: UserResonance,
  theme: string,
  feedback: number, // -1 to 1 (negative to positive)
  accuracy: number
): UserResonance {
  const newResonance = { ...currentResonance }
  
  if (!newResonance.resonanceScores[theme]) {
    newResonance.resonanceScores[theme] = {
      theme,
      score: 0.5,
      feedback: 0,
      lastUpdated: new Date()
    }
  }
  
  const currentScore = newResonance.resonanceScores[theme].score
  const adjustment = feedback * 0.1 // Small adjustment factor
  
  newResonance.resonanceScores[theme] = {
    theme,
    score: Math.max(0, Math.min(1, currentScore + adjustment)),
    feedback,
    lastUpdated: new Date()
  }
  
  newResonance.overallAccuracy = accuracy
  
  return newResonance
}

export function calculateThemeAccuracy(
  predictedThemes: string[],
  actualFeedback: Record<string, number>
): number {
  if (predictedThemes.length === 0) return 0
  
  let totalAccuracy = 0
  let count = 0
  
  for (const theme of predictedThemes) {
    if (actualFeedback[theme] !== undefined) {
      totalAccuracy += actualFeedback[theme]
      count++
    }
  }
  
  return count > 0 ? totalAccuracy / count : 0
}
