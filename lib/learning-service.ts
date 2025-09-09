import { resonanceDB } from "./resonance-database"
import type { FeedbackData } from "./resonance-types"

export class LearningService {
  // Process batch feedback for improved learning
  async processBatchFeedback(
    feedbackBatch: Array<{
      userId: string
      aspectId: string
      theme: string
      feedback: FeedbackData
    }>,
  ): Promise<void> {
    for (const item of feedbackBatch) {
      await resonanceDB.processFeedback(item.userId, item.aspectId, item.theme, item.feedback)
    }
  }

  // Get learning recommendations for users
  async getLearningRecommendations(userId: string): Promise<{
    shouldRequestFeedback: boolean
    focusAreas: string[]
    confidenceLevel: "building" | "established" | "expert"
  }> {
    const accuracyStats = await resonanceDB.getUserAccuracyStats(userId, 30)

    const shouldRequestFeedback = accuracyStats.totalFeedbacks < 20 || accuracyStats.totalFeedbacks % 10 === 0 // Request every 10th feedback

    const focusAreas = accuracyStats.weakestResonances.slice(0, 3).map((r) => r.theme)

    let confidenceLevel: "building" | "established" | "expert" = "building"
    if (accuracyStats.totalFeedbacks > 50 && accuracyStats.overallAccuracy > 0.8) {
      confidenceLevel = "expert"
    } else if (accuracyStats.totalFeedbacks > 20 && accuracyStats.overallAccuracy > 0.6) {
      confidenceLevel = "established"
    }

    return {
      shouldRequestFeedback,
      focusAreas,
      confidenceLevel,
    }
  }

  // Generate global insights from all user data
  async getGlobalInsights(): Promise<{
    mostResonantAspects: Array<{ aspectId: string; theme: string; resonance: number }>
    personalityTrends: Array<{ personality: string; strongestThemes: string[] }>
    overallSystemAccuracy: number
  }> {
    // This would analyze aggregated data across all users
    // For now, return mock insights
    return {
      mostResonantAspects: [
        { aspectId: "moon_square_saturn", theme: "Relationships", resonance: 0.82 },
        { aspectId: "sun_opposition_saturn", theme: "Career", resonance: 0.75 },
        { aspectId: "venus_trine_jupiter", theme: "Relationships", resonance: 0.88 },
      ],
      personalityTrends: [
        { personality: "INFJ", strongestThemes: ["Relationships", "Inner Work"] },
        { personality: "ESTP", strongestThemes: ["Career", "Health"] },
      ],
      overallSystemAccuracy: 0.73,
    }
  }

  // Adaptive learning rate based on user engagement
  calculateAdaptiveLearningRate(userId: string, baseRate = 0.1): Promise<number> {
    // Could adjust learning rate based on user feedback frequency, accuracy, etc.
    // More engaged users might have higher learning rates
    return Promise.resolve(baseRate)
  }

  // Detect and handle outlier feedback
  async validateFeedback(
    userId: string,
    aspectId: string,
    theme: string,
    feedback: FeedbackData,
  ): Promise<{ isValid: boolean; confidence: number }> {
    const stats = await resonanceDB.getResonanceStats(userId, aspectId, theme)

    // Simple validation - could be much more sophisticated
    const globalConfidence = stats.global.confidence
    const feedbackDeviation = Math.abs(feedback.accuracyScore - globalConfidence)

    const isValid = feedbackDeviation < 0.5 // Not too far from global average
    const confidence = Math.max(0.1, 1 - feedbackDeviation)

    return { isValid, confidence }
  }
}

export const learningService = new LearningService()
