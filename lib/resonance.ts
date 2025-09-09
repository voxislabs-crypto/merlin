// Resonance Engine - Makes Merlin learn from user feedback
// This system adjusts forecast weightings based on user accuracy patterns

export interface ResonanceFeedback {
  userId: string
  aspect: string // e.g. "Moon square Saturn"
  date: Date
  score: number // -1 (negative), 0 (neutral), +1 (positive)
  notes?: string
  mbtiType?: string // For cluster analysis
  theme?: string // Relationships, Career, etc.
}

export interface ResonanceStats {
  personal: number // user's accuracy %
  cluster: number // MBTI/overlay group accuracy %
  global: number // overall accuracy %
  totalFeedback: number
  streakDays: number
}

export interface AspectWeighting {
  aspect: string
  baseWeight: number
  personalMultiplier: number
  clusterMultiplier: number
  confidence: number
}

export interface ResonanceRecord {
  id: string
  userId: string
  aspectId: string // transit/aspect reference
  resonanceScore: number // user feedback weighted (-1 to +1)
  globalResonanceScore: number // aggregate from all users
  clusterResonanceScore: number // MBTI/Enneagram group aggregates
  feedbackLog: {
    thumbs?: "up" | "down"
    sliders?: { emotional: number; spiritual: number }
    notes?: string
  }
  mbtiType?: string
  theme?: string
  createdAt: Date
  updatedAt: Date
}

class ResonanceDatabase {
  private readonly STORAGE_KEY = "merlin_resonance_data"
  private readonly STATS_KEY = "merlin_resonance_stats"

  private loadData(): ResonanceRecord[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data
        ? JSON.parse(data).map((record: any) => ({
            ...record,
            createdAt: new Date(record.createdAt),
            updatedAt: new Date(record.updatedAt),
          }))
        : []
    } catch {
      return []
    }
  }

  private saveData(records: ResonanceRecord[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records))
    } catch (error) {
      console.warn("[Resonance DB] Failed to save to localStorage:", error)
    }
  }

  async insertFeedback(feedback: ResonanceFeedback): Promise<void> {
    const records = this.loadData()
    const newRecord: ResonanceRecord = {
      id: `resonance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: feedback.userId,
      aspectId: feedback.aspect,
      resonanceScore: feedback.score,
      globalResonanceScore: 0, // Will be calculated
      clusterResonanceScore: 0, // Will be calculated
      feedbackLog: {
        thumbs: feedback.score > 0 ? "up" : feedback.score < 0 ? "down" : undefined,
        notes: feedback.notes,
      },
      mbtiType: feedback.mbtiType,
      theme: feedback.theme,
      createdAt: new Date(feedback.date),
      updatedAt: new Date(),
    }

    records.push(newRecord)
    this.saveData(records)

    // Update aggregate scores
    await this.updateAggregateScores()
  }

  async getUserFeedback(userId: string, limit = 10): Promise<ResonanceRecord[]> {
    const records = this.loadData()
    return records
      .filter((record) => record.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  }

  async getClusterFeedback(mbtiType: string): Promise<ResonanceRecord[]> {
    const records = this.loadData()
    return records.filter((record) => record.mbtiType === mbtiType)
  }

  async getAllFeedback(): Promise<ResonanceRecord[]> {
    return this.loadData()
  }

  private async updateAggregateScores(): Promise<void> {
    const records = this.loadData()

    // Calculate global resonance scores
    const aspectGroups = new Map<string, ResonanceRecord[]>()
    records.forEach((record) => {
      if (!aspectGroups.has(record.aspectId)) {
        aspectGroups.set(record.aspectId, [])
      }
      aspectGroups.get(record.aspectId)!.push(record)
    })

    // Update global scores
    aspectGroups.forEach((aspectRecords, aspectId) => {
      const totalScore = aspectRecords.reduce((sum, record) => sum + record.resonanceScore, 0)
      const globalScore = aspectRecords.length > 0 ? totalScore / aspectRecords.length : 0

      aspectRecords.forEach((record) => {
        record.globalResonanceScore = globalScore
        record.updatedAt = new Date()
      })
    })

    // Calculate cluster scores by MBTI type
    const mbtiGroups = new Map<string, Map<string, ResonanceRecord[]>>()
    records.forEach((record) => {
      if (record.mbtiType) {
        if (!mbtiGroups.has(record.mbtiType)) {
          mbtiGroups.set(record.mbtiType, new Map())
        }
        const mbtiAspects = mbtiGroups.get(record.mbtiType)!
        if (!mbtiAspects.has(record.aspectId)) {
          mbtiAspects.set(record.aspectId, [])
        }
        mbtiAspects.get(record.aspectId)!.push(record)
      }
    })

    // Update cluster scores
    mbtiGroups.forEach((aspectMap, mbtiType) => {
      aspectMap.forEach((aspectRecords, aspectId) => {
        const totalScore = aspectRecords.reduce((sum, record) => sum + record.resonanceScore, 0)
        const clusterScore = aspectRecords.length > 0 ? totalScore / aspectRecords.length : 0

        aspectRecords.forEach((record) => {
          record.clusterResonanceScore = clusterScore
          record.updatedAt = new Date()
        })
      })
    })

    this.saveData(records)
  }

  async calculatePersonalResonance(userId: string): Promise<number> {
    const userRecords = await this.getUserFeedback(userId, 100)
    if (userRecords.length === 0) return 0.75 // Default

    const positiveCount = userRecords.filter((record) => record.resonanceScore > 0).length
    return positiveCount / userRecords.length
  }

  async calculateClusterResonance(mbtiType: string): Promise<number> {
    const clusterRecords = await this.getClusterFeedback(mbtiType)
    if (clusterRecords.length === 0) return 0.7 // Default

    const positiveCount = clusterRecords.filter((record) => record.resonanceScore > 0).length
    return positiveCount / clusterRecords.length
  }

  async calculateGlobalResonance(): Promise<number> {
    const allRecords = await this.getAllFeedback()
    if (allRecords.length === 0) return 0.75 // Default

    const positiveCount = allRecords.filter((record) => record.resonanceScore > 0).length
    return positiveCount / allRecords.length
  }
}

const resonanceDB = new ResonanceDatabase()

const feedbackStore: ResonanceFeedback[] = []
const aspectWeightings: Map<string, AspectWeighting> = new Map()

// Initialize default aspect weights
const defaultAspects = [
  "Moon square Saturn",
  "Sun trine Jupiter",
  "Venus sextile Mars",
  "Mercury conjunct Venus",
  "Mars opposition Pluto",
  "Jupiter square Neptune",
]

defaultAspects.forEach((aspect) => {
  aspectWeightings.set(aspect, {
    aspect,
    baseWeight: 1.0,
    personalMultiplier: 1.0,
    clusterMultiplier: 1.0,
    confidence: 0.75,
  })
})

export async function saveFeedback(feedback: ResonanceFeedback): Promise<void> {
  try {
    // Save to database
    await resonanceDB.insertFeedback(feedback)

    // Also save to in-memory store for backward compatibility
    feedbackStore.push({
      ...feedback,
      date: new Date(feedback.date),
    })

    // Update aspect weighting
    updateAspectWeighting(feedback)

    console.log(`[Resonance] Saved feedback to DB for ${feedback.aspect}: ${feedback.score}`)
  } catch (error) {
    console.error("[Resonance] Failed to save feedback:", error)
    // Fallback to in-memory storage
    feedbackStore.push({
      ...feedback,
      date: new Date(feedback.date),
    })
    updateAspectWeighting(feedback)
  }
}

export async function calculateResonance(userId: string, mbtiType?: string): Promise<ResonanceStats> {
  try {
    // Get data from database
    const personal = await resonanceDB.calculatePersonalResonance(userId)
    const cluster = mbtiType ? await resonanceDB.calculateClusterResonance(mbtiType) : 0.7
    const global = await resonanceDB.calculateGlobalResonance()

    const userRecords = await resonanceDB.getUserFeedback(userId, 100)

    // Calculate streak days
    const recentRecords = userRecords.slice(0, 7) // Last 7 entries
    let streakDays = 0
    for (const record of recentRecords) {
      if (record.resonanceScore > 0) {
        streakDays++
      } else {
        break
      }
    }

    return {
      personal: Math.round(personal * 100) / 100,
      cluster: Math.round(cluster * 100) / 100,
      global: Math.round(global * 100) / 100,
      totalFeedback: userRecords.length,
      streakDays,
    }
  } catch (error) {
    console.error("[Resonance] Failed to calculate from DB, using fallback:", error)
    // Fallback to original in-memory calculation
    return calculateResonanceFromMemory(userId, mbtiType)
  }
}

function calculateResonanceFromMemory(userId: string, mbtiType?: string): ResonanceStats {
  const userFeedback = feedbackStore.filter((f) => f.userId === userId)
  const allFeedback = feedbackStore

  const personalPositive = userFeedback.filter((f) => f.score > 0).length
  const personal = userFeedback.length > 0 ? personalPositive / userFeedback.length : 0

  const clusterFeedback = mbtiType ? allFeedback.filter((f) => f.mbtiType === mbtiType) : []
  const clusterPositive = clusterFeedback.filter((f) => f.score > 0).length
  const cluster = clusterFeedback.length > 0 ? clusterPositive / clusterFeedback.length : 0.7

  const globalPositive = allFeedback.filter((f) => f.score > 0).length
  const global = allFeedback.length > 0 ? globalPositive / allFeedback.length : 0.75

  const recentFeedback = userFeedback.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 7)
  let streakDays = 0
  for (const feedback of recentFeedback) {
    if (feedback.score > 0) {
      streakDays++
    } else {
      break
    }
  }

  return {
    personal: Math.round(personal * 100) / 100,
    cluster: Math.round(cluster * 100) / 100,
    global: Math.round(global * 100) / 100,
    totalFeedback: userFeedback.length,
    streakDays,
  }
}

export function adjustAspectWeight(aspect: string, stats: ResonanceStats): number {
  const weighting = aspectWeightings.get(aspect)
  if (!weighting) return 1.0

  let multiplier = weighting.baseWeight

  // Personal performance adjustment
  if (stats.personal > stats.global + 0.1) {
    multiplier *= 1.3 // Boost aspects that work well for this user
  } else if (stats.personal < stats.global - 0.1) {
    multiplier *= 0.7 // Reduce aspects that don't resonate
  }

  // Cluster performance adjustment
  if (stats.cluster > stats.global + 0.05) {
    multiplier *= 1.1 // Slight boost for cluster patterns
  } else if (stats.cluster < stats.global - 0.05) {
    multiplier *= 0.9 // Slight reduction for cluster patterns
  }

  // Confidence boost for users with more feedback
  if (stats.totalFeedback > 10) {
    multiplier *= 1.05 // More confident predictions for experienced users
  }

  // Streak bonus
  if (stats.streakDays >= 3) {
    multiplier *= 1.1 // Reward consistent accuracy
  }

  // Clamp between reasonable bounds
  return Math.max(0.5, Math.min(1.5, multiplier))
}

function updateAspectWeighting(feedback: ResonanceFeedback): void {
  const current = aspectWeightings.get(feedback.aspect)
  if (!current) return

  // Adjust personal multiplier based on feedback
  const adjustment = feedback.score * 0.1 // Small incremental changes
  const newPersonalMultiplier = Math.max(0.5, Math.min(1.5, current.personalMultiplier + adjustment))

  aspectWeightings.set(feedback.aspect, {
    ...current,
    personalMultiplier: newPersonalMultiplier,
    confidence: Math.min(0.95, current.confidence + Math.abs(adjustment) * 0.05),
  })
}

export function getAspectWeighting(aspect: string): AspectWeighting | null {
  return aspectWeightings.get(aspect) || null
}

export function getAllAspectWeightings(): AspectWeighting[] {
  return Array.from(aspectWeightings.values())
}

export async function getUserFeedbackHistory(userId: string, limit = 10): Promise<ResonanceFeedback[]> {
  try {
    const records = await resonanceDB.getUserFeedback(userId, limit)
    return records.map((record) => ({
      userId: record.userId,
      aspect: record.aspectId,
      date: record.createdAt,
      score: record.resonanceScore,
      notes: record.feedbackLog.notes,
      mbtiType: record.mbtiType,
      theme: record.theme,
    }))
  } catch (error) {
    console.error("[Resonance] Failed to get history from DB, using fallback:", error)
    return feedbackStore
      .filter((f) => f.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit)
  }
}

export async function persistResonanceData(): Promise<void> {
  console.log("[Resonance] Data persisted to localStorage database")
}

export async function loadResonanceData(): Promise<void> {
  console.log("[Resonance] Data loaded from localStorage database")
}

export async function getResonanceStats(userId: string, mbtiType?: string): Promise<ResonanceStats> {
  return await calculateResonance(userId, mbtiType)
}

export async function demoResonance(): Promise<void> {
  console.log("[Resonance] Demo mode - generating sample feedback with DB persistence")

  const sampleFeedback: ResonanceFeedback[] = [
    {
      userId: "demo-user",
      aspect: "Moon square Saturn",
      date: new Date(),
      score: 1,
      notes: "Very accurate for relationship challenges",
      mbtiType: "INFJ",
      theme: "Relationships",
    },
    {
      userId: "demo-user",
      aspect: "Sun trine Jupiter",
      date: new Date(Date.now() - 86400000),
      score: 0,
      notes: "Didn't feel this one",
      mbtiType: "INFJ",
      theme: "Career",
    },
    {
      userId: "demo-user",
      aspect: "Venus sextile Mars",
      date: new Date(Date.now() - 172800000),
      score: 1,
      notes: "Great for creative projects",
      mbtiType: "INFJ",
      theme: "Creativity",
    },
  ]

  for (const feedback of sampleFeedback) {
    await saveFeedback(feedback)
  }

  const stats = await calculateResonance("demo-user", "INFJ")
  console.log("[Resonance] Demo stats from DB:", stats)
}
