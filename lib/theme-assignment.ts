import type { DetectedAspect } from "./aspect-detection"

export interface ThemeScore {
  theme: string
  score: number
  aspects: DetectedAspect[]
}

export interface ThemeAssignment {
  primaryTheme: string
  secondaryThemes: string[]
  themeScores: Record<string, number>
  groupedAspects: Record<string, DetectedAspect[]>
}

export const themeMap: Record<string, string[]> = {
  Sun: ["identity", "ego", "vitality"],
  Moon: ["emotions", "home", "family"],
  Mercury: ["communication", "thinking", "learning"],
  Venus: ["love", "relationships", "beauty", "money"],
  Mars: ["drive", "anger", "sex", "action"],
  Jupiter: ["growth", "opportunity", "luck"],
  Saturn: ["responsibility", "authority", "limits"],
  Uranus: ["change", "innovation", "chaos"],
  Neptune: ["dreams", "illusions", "spirituality"],
  Pluto: ["power", "transformation", "intensity"],
  Node: ["destiny", "karma"],
}

// Map themes to user-friendly categories
export const themeCategories: Record<string, string> = {
  identity: "Self & Identity",
  ego: "Self & Identity",
  vitality: "Health & Energy",
  emotions: "Relationships",
  home: "Home & Family",
  family: "Home & Family",
  communication: "Communication",
  thinking: "Mental Focus",
  learning: "Mental Focus",
  love: "Relationships",
  relationships: "Relationships",
  beauty: "Creativity",
  money: "Finance",
  drive: "Action & Goals",
  anger: "Action & Goals",
  sex: "Relationships",
  action: "Action & Goals",
  growth: "Opportunities",
  opportunity: "Opportunities",
  luck: "Opportunities",
  responsibility: "Career",
  authority: "Career",
  limits: "Career",
  change: "Transformation",
  innovation: "Transformation",
  chaos: "Transformation",
  dreams: "Spirituality",
  illusions: "Spirituality",
  spirituality: "Spirituality",
  power: "Transformation",
  transformation: "Transformation",
  intensity: "Transformation",
  destiny: "Life Purpose",
  karma: "Life Purpose",
}

export function assignThemes(aspect: DetectedAspect): string[] {
  const themes1 = themeMap[aspect.planet1] || []
  const themes2 = themeMap[aspect.planet2] || []
  return [...new Set([...themes1, ...themes2])]
}

export function categorizeThemes(themes: string[]): string[] {
  const categories = themes.map((theme) => themeCategories[theme] || theme)
  return [...new Set(categories)]
}

export function calculateThemeScores(aspectsDetected: DetectedAspect[]): Record<string, number> {
  const scores: Record<string, number> = {}

  aspectsDetected.forEach((aspect) => {
    const themes = assignThemes(aspect)
    const categories = categorizeThemes(themes)
    const weight = aspect.score || 1

    categories.forEach((category) => {
      scores[category] = (scores[category] || 0) + weight
    })
  })

  return scores
}

export function getMainTheme(scores: Record<string, number>): string {
  const entries = Object.entries(scores)
  if (entries.length === 0) return "General"

  return entries.sort((a, b) => b[1] - a[1])[0][0]
}

export function groupAspectsByTheme(aspectsDetected: DetectedAspect[]): Record<string, DetectedAspect[]> {
  const grouped: Record<string, DetectedAspect[]> = {}

  aspectsDetected.forEach((aspect) => {
    const themes = assignThemes(aspect)
    const categories = categorizeThemes(themes)

    // Assign aspect to the first category (primary theme for this aspect)
    const primaryCategory = categories[0] || "General"

    if (!grouped[primaryCategory]) {
      grouped[primaryCategory] = []
    }
    grouped[primaryCategory].push(aspect)
  })

  return grouped
}

export function assignPrimaryAndSecondaryThemes(aspectsDetected: DetectedAspect[]): ThemeAssignment {
  const themeScores = calculateThemeScores(aspectsDetected)
  const groupedAspects = groupAspectsByTheme(aspectsDetected)

  const sortedThemes = Object.entries(themeScores)
    .sort((a, b) => b[1] - a[1])
    .map(([theme]) => theme)

  const primaryTheme = sortedThemes[0] || "General"
  const secondaryThemes = sortedThemes.slice(1, 3)

  return {
    primaryTheme,
    secondaryThemes,
    themeScores,
    groupedAspects,
  }
}

export function getThemeIntensity(score: number): "high" | "medium" | "low" {
  if (score > 25) return "high"
  if (score > 15) return "medium"
  return "low"
}

export function getThemeColor(intensity: "high" | "medium" | "low"): "red" | "yellow" | "green" {
  switch (intensity) {
    case "high":
      return "red"
    case "medium":
      return "yellow"
    case "low":
    default:
      return "green"
  }
}

export function formatThemeSummary(theme: string, aspects: DetectedAspect[]): string {
  const aspectCount = aspects.length
  const strongAspects = aspects.filter((a) => a.intensity === "high").length

  if (strongAspects > 0) {
    return `${theme} focus with ${strongAspects} strong influence${strongAspects > 1 ? "s" : ""}`
  }

  return `${theme} theme with ${aspectCount} aspect${aspectCount > 1 ? "s" : ""}`
}
