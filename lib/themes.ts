export interface ThemeAssignment {
  primaryTheme: ThemeScore
  supportingThemes: ThemeScore[]
  confidence: number
}

export interface ThemeDetails {
  name: string
  color: string
  emoji: string
  description: string
}

export interface ThemeScore {
  theme: string
  score: number
  sourceAspects: string[]
  explanation: string // Why this theme was prioritized
  resonanceBoost: number // Boost from user feedback
}

// Theme mapping: connects planets, houses, and signs to life areas
const themeMap: Record<string, (string | number)[]> = {
  career: ["Sun", "Saturn", "Mars", "10th", "Capricorn", "Midheaven"],
  relationships: ["Moon", "Venus", "7th", "Libra", "Descendant"],
  innerWork: ["Pluto", "Chiron", "Neptune", "12th", "Pisces"],
  communication: ["Mercury", "3rd", "Gemini"],
  finance: ["2nd", "8th", "Jupiter", "Venus", "Taurus", "Scorpio"],
  health: ["6th", "Virgo", "Mars"],
  creativity: ["5th", "Leo", "Sun", "Venus"],
  expansion: ["9th", "Sagittarius", "Jupiter"],
  boundaries: ["Saturn", "Capricorn", "10th"],
  transformation: ["Pluto", "Scorpio", "8th", "Phoenix"],
}

// Theme details for UI display
export const themeDetails: Record<string, ThemeDetails> = {
  career: { name: "Career", color: "yellow", emoji: "🟡", description: "Professional growth and ambition" },
  relationships: {
    name: "Relationships",
    color: "red",
    emoji: "🔴",
    description: "Love, partnerships, and connections",
  },
  innerWork: { name: "Inner Work", color: "green", emoji: "🟢", description: "Spiritual growth and healing" },
  communication: { name: "Communication", color: "blue", emoji: "🔵", description: "Expression and mental clarity" },
  finance: { name: "Finance", color: "purple", emoji: "🟣", description: "Money, resources, and values" },
  health: { name: "Health", color: "orange", emoji: "🟠", description: "Physical and mental wellbeing" },
  creativity: { name: "Creativity", color: "pink", emoji: "🩷", description: "Artistic expression and joy" },
  expansion: { name: "Expansion", color: "cyan", emoji: "🔷", description: "Learning and adventure" },
  boundaries: { name: "Boundaries", color: "gray", emoji: "⚫", description: "Structure and discipline" },
  transformation: { name: "Transformation", color: "indigo", emoji: "🟣", description: "Deep change and rebirth" },
}

// Planet importance weights for more sophisticated scoring
const planetWeights: Record<string, number> = {
  Sun: 1.0, // Core identity
  Moon: 1.0, // Emotional nature
  Mercury: 0.7, // Communication
  Venus: 0.8, // Relationships/values
  Mars: 0.8, // Action/energy
  Jupiter: 0.9, // Expansion/growth
  Saturn: 0.9, // Structure/discipline
  Uranus: 0.6, // Innovation
  Neptune: 0.6, // Spirituality
  Pluto: 0.7, // Transformation
  Chiron: 0.5, // Healing
}

export function assignThemes(
  aspects: { planets: [string, string]; aspect: string; strength: number; orbTightness?: number }[],
  houses?: Record<string, number>,
  resonanceStats?: Record<string, number>, // User's resonance with each theme
): ThemeAssignment {
  const themeScores = new Map<
    string,
    {
      score: number
      sources: string[]
      orbBonus: number
      planetBonus: number
      resonanceBonus: number
      houseBonus: number
    }
  >()

  // Analyze each aspect for theme triggers
  for (const asp of aspects) {
    const aspectStr = `${asp.planets[0]} ${getAspectGlyph(asp.aspect)} ${asp.planets[1]}`
    const orbTightness = asp.orbTightness || 0.5 // Default if not provided
    const orbBonus = orbTightness * 0.3 // Tighter orbs get bonus

    for (const [theme, triggers] of Object.entries(themeMap)) {
      let matchScore = 0
      let planetBonus = 0
      let houseBonus = 0

      // Check if planets match theme triggers
      for (const planet of asp.planets) {
        if (triggers.includes(planet)) {
          const planetWeight = planetWeights[planet] || 0.5
          matchScore += asp.strength * planetWeight
          planetBonus += planetWeight * 0.2
        }
      }

      // Check house positions when houses data is available
      if (houses) {
        for (const [planet, house] of Object.entries(houses)) {
          if (asp.planets.includes(planet) && triggers.includes(house.toString())) {
            matchScore += asp.strength * 0.8
            houseBonus += 0.3
          }
        }
      }

      if (matchScore > 0) {
        // Apply resonance boost if available
        const resonanceBonus = resonanceStats?.[theme] ? (resonanceStats[theme] - 0.5) * 0.4 : 0
        const finalScore = matchScore + orbBonus + planetBonus + houseBonus + resonanceBonus

        if (!themeScores.has(theme)) {
          themeScores.set(theme, {
            score: 0,
            sources: [],
            orbBonus: 0,
            planetBonus: 0,
            resonanceBonus: 0,
            houseBonus: 0,
          })
        }
        const current = themeScores.get(theme)!
        current.score += finalScore
        current.sources.push(aspectStr)
        current.orbBonus += orbBonus
        current.planetBonus += planetBonus
        current.resonanceBonus += resonanceBonus
        current.houseBonus += houseBonus
      }
    }
  }

  // Sort themes by score
  const sortedThemes = Array.from(themeScores.entries()).sort(([, a], [, b]) => b.score - a.score)

  if (sortedThemes.length === 0) {
    // Fallback
    return {
      primaryTheme: {
        theme: "innerWork",
        score: 30,
        sourceAspects: ["No strong planetary triggers detected"],
        explanation: "Default theme - no strong aspects detected",
        resonanceBoost: 0,
      },
      supportingThemes: [],
      confidence: 30,
    }
  }

  // Create primary theme (highest scoring)
  const [primaryThemeName, primaryData] = sortedThemes[0]
  const primaryTheme: ThemeScore = {
    theme: primaryThemeName,
    score: Math.round(primaryData.score * 100),
    sourceAspects: primaryData.sources,
    explanation: generateExplanation(primaryThemeName, primaryData, true),
    resonanceBoost: Math.round(primaryData.resonanceBonus * 100),
  }

  // Create supporting themes (remaining themes with significant scores)
  const supportingThemes: ThemeScore[] = sortedThemes
    .slice(1, 4) // Take up to 3 supporting themes
    .filter(([, data]) => data.score > primaryData.score * 0.3) // Must be at least 30% of primary score
    .map(([themeName, data]) => ({
      theme: themeName,
      score: Math.round(data.score * 100),
      sourceAspects: data.sources,
      explanation: generateExplanation(themeName, data, false),
      resonanceBoost: Math.round(data.resonanceBonus * 100),
    }))

  // Calculate overall confidence
  const totalScore = sortedThemes.reduce((sum, [, data]) => sum + data.score, 0)
  const confidence = Math.min(Math.round((totalScore / aspects.length) * 100), 100)

  return { primaryTheme, supportingThemes, confidence }
}

export function assignThemesFromPlanetaryPositions(
  positions: Record<string, { longitude: number; house?: number }>,
  aspects: { planets: [string, string]; aspect: string; strength: number; orb: number }[],
  resonanceStats?: Record<string, number>
): ThemeAssignment {
  const enhancedAspects = aspects.map(asp => ({
    ...asp,
    orbTightness: Math.max(0, 1 - (asp.orb / 6)) // Convert orb to tightness score (0-1)
  }));

  const houses: Record<string, number> = {};
  for (const [planet, position] of Object.entries(positions)) {
    if (position.house) {
      houses[planet] = position.house;
    }
  }

  return assignThemes(enhancedAspects, houses, resonanceStats);
}

export function getThemeAssignmentsForForecast(
  forecastData: {
    aspects: { planets: [string, string]; aspect: string; strength: number; orb: number }[];
    positions: Record<string, { longitude: number; house?: number }>;
    userId?: string;
    mbtiType?: string;
  },
  userResonance?: Record<string, number>
): ThemeAssignment {
  // Get personalized resonance if user data available
  let resonanceStats = userResonance;
  
  if (!resonanceStats && forecastData.userId) {
    // TODO: Fetch user's historical resonance data
    // For now, use empty object
    resonanceStats = {};
  }

  return assignThemesFromPlanetaryPositions(
    forecastData.positions,
    forecastData.aspects,
    resonanceStats
  );
}

export function getThemeWeights(
  themes: string[],
  userResonance?: Record<string, number>
): Record<string, number> {
  const weights: Record<string, number> = {};
  
  for (const theme of themes) {
    let baseWeight = 1.0;
    
    // Apply resonance boost if available
    if (userResonance && userResonance[theme]) {
      const resonance = userResonance[theme];
      baseWeight *= (0.5 + resonance); // Scale from 0.5 to 1.5
    }
    
    weights[theme] = Math.max(0.3, Math.min(2.0, baseWeight));
  }
  
  return weights;
}

export function updateThemeResonance(
  userId: string,
  themeFeedback: { theme: string; score: number }[]
): void {
  // TODO: Integrate with resonance database
  console.log(`[Themes] Updating theme resonance for ${userId}:`, themeFeedback);
}

// Helper function to get aspect glyphs
function getAspectGlyph(aspect: string): string {
  const glyphs: Record<string, string> = {
    conjunction: "☌",
    opposition: "☍",
    trine: "△",
    square: "□",
    sextile: "⚹",
  }
  return glyphs[aspect.toLowerCase()] || aspect
}

// Explanation generator for theme prioritization tooltips
function generateExplanation(
  theme: string,
  data: { orbBonus: number; planetBonus: number; resonanceBonus: number; sources: string[] },
  isPrimary: boolean,
): string {
  const parts = []

  if (isPrimary) {
    parts.push("Primary focus")
  } else {
    parts.push("Supporting influence")
  }

  if (data.orbBonus > 0.1) {
    parts.push("tight orbs")
  }

  if (data.planetBonus > 0.1) {
    parts.push("major planets involved")
  }

  if (data.resonanceBonus > 0.1) {
    parts.push("high personal resonance")
  } else if (data.resonanceBonus < -0.1) {
    parts.push("learning opportunity")
  }

  const aspectCount = data.sources.length
  parts.push(`${aspectCount} aspect${aspectCount > 1 ? "s" : ""}`)

  return parts.join(" • ")
}

// Demo function for testing
export function demoThemeAssignment(): ThemeAssignment {
  const mockAspects = [
    { planets: ["Sun", "Saturn"] as [string, string], aspect: "square", strength: 0.9, orbTightness: 0.8 },
    { planets: ["Moon", "Venus"] as [string, string], aspect: "trine", strength: 0.7, orbTightness: 0.6 },
    { planets: ["Mercury", "Jupiter"] as [string, string], aspect: "sextile", strength: 0.6, orbTightness: 0.4 },
  ]

  const mockResonance = {
    career: 0.8, // High resonance with career
    relationships: 0.6, // Moderate resonance
    innerWork: 0.3, // Lower resonance
  }

  return assignThemes(mockAspects, undefined, mockResonance)
}

// TODO: Future enhancements
// - Add weighted triggers (some planets more important for certain themes)
// - Cross-system validation adjusting theme confidence
// - User feedback integration to learn theme preferences
// - Seasonal/temporal theme adjustments
// - Personality overlay integration (MBTI/Enneagram affecting theme interpretation)
