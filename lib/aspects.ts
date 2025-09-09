/**
 * Aspect Detection Utility for Merlin Astrology Engine
 *
 * Detects aspects between planetary positions and calculates orb tightness.
 * Fully typed and functional with mock data - ready for production ephemeris integration.
 */

export const aspects = {
  conjunction: 0,
  opposition: 180,
  trine: 120,
  square: 90,
  sextile: 60,
} as const

export interface Aspect {
  planets: [string, string]
  aspect: keyof typeof aspects
  exact: number
  orb: number
  strength: "low" | "medium" | "high"
  confidence: number // TODO: integrate with resonance + cross-system validation
  glyph: string // Visual representation for UI
  interpretation: string // Basic meaning for display
}

// TODO: Implement planet-specific orb tolerances in production
// e.g., Sun/Moon get wider orbs, outer planets get tighter orbs
const DEFAULT_ORB_TOLERANCE = 6

/**
 * Classifies aspect strength based on orb tightness
 */
function getAspectStrength(orb: number): "low" | "medium" | "high" {
  if (orb <= 1) return "high" // Very tight orb - strongest influence
  if (orb <= 3) return "medium" // Moderate orb - clear influence
  return "low" // Wide orb - subtle influence
}

/**
 * Gets the visual glyph for an aspect
 */
function getAspectGlyph(aspectName: keyof typeof aspects): string {
  const glyphs = {
    conjunction: "☌",
    opposition: "☍",
    trine: "△",
    square: "□",
    sextile: "⚹",
  }
  return glyphs[aspectName]
}

/**
 * Gets basic interpretation for an aspect
 */
function getAspectInterpretation(aspectName: keyof typeof aspects): string {
  const interpretations = {
    conjunction: "Blending and intensification of energies",
    opposition: "Tension and awareness through contrast",
    trine: "Harmonious flow and natural talent",
    square: "Dynamic tension requiring action",
    sextile: "Opportunity through conscious effort",
  }
  return interpretations[aspectName]
}

/**
 * Calculates the angular difference between two longitude positions
 */
function calculateAngularDifference(long1: number, long2: number): number {
  let diff = Math.abs(long1 - long2)
  // Handle the 360° wrap-around (e.g., 350° to 10° = 20°, not 340°)
  if (diff > 180) {
    diff = 360 - diff
  }
  return diff
}

/**
 * Main aspect detection function
 * Analyzes all planetary pairs and identifies significant aspects
 */
export function detectAspects(positions: Record<string, { longitude: number }>): Aspect[] {
  const results: Aspect[] = []
  const planetNames = Object.keys(positions)

  // Check every pair of planets for aspects
  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const planet1 = planetNames[i]
      const planet2 = planetNames[j]
      const pos1 = positions[planet1]
      const pos2 = positions[planet2]

      const angularDiff = calculateAngularDifference(pos1.longitude, pos2.longitude)

      // Check each aspect type
      for (const [aspectName, exactAngle] of Object.entries(aspects)) {
        const orb = Math.abs(angularDiff - exactAngle)

        // Only include aspects within orb tolerance
        if (orb <= DEFAULT_ORB_TOLERANCE) {
          const strength = getAspectStrength(orb)

          // TODO: Replace with real confidence calculation based on:
          // - Resonance learning data
          // - Cross-system validation (Western/Vedic/Whole Sign)
          // - Historical accuracy for this aspect type
          // - User feedback patterns
          const baseConfidence = 0.8
          const orbPenalty = (orb / DEFAULT_ORB_TOLERANCE) * 0.2
          const confidence = Math.max(0.5, baseConfidence - orbPenalty)

          results.push({
            planets: [planet1, planet2],
            aspect: aspectName as keyof typeof aspects,
            exact: exactAngle,
            orb: Math.round(orb * 100) / 100, // Round to 2 decimal places
            strength,
            confidence: Math.round(confidence * 100) / 100,
            glyph: getAspectGlyph(aspectName as keyof typeof aspects),
            interpretation: getAspectInterpretation(aspectName as keyof typeof aspects),
          })
        }
      }
    }
  }

  // Sort by strength and orb tightness (strongest/tightest first)
  return results.sort((a, b) => {
    const strengthOrder = { high: 3, medium: 2, low: 1 }
    if (strengthOrder[a.strength] !== strengthOrder[b.strength]) {
      return strengthOrder[b.strength] - strengthOrder[a.strength]
    }
    return a.orb - b.orb // Tighter orbs first
  })
}

/**
 * Filters aspects by strength level
 */
export function filterAspectsByStrength(aspects: Aspect[], minStrength: "low" | "medium" | "high" = "low"): Aspect[] {
  const strengthOrder = { low: 1, medium: 2, high: 3 }
  const minLevel = strengthOrder[minStrength]

  return aspects.filter((aspect) => strengthOrder[aspect.strength] >= minLevel)
}

/**
 * Gets aspects involving a specific planet
 */
export function getAspectsForPlanet(aspects: Aspect[], planetName: string): Aspect[] {
  return aspects.filter((aspect) => aspect.planets[0] === planetName || aspect.planets[1] === planetName)
}

/**
 * Demo function to test aspect detection with ephemeris data
 */
export function demoAspectDetection(): void {
  console.log("[v0] Running Aspect Detection Demo...")

  // Import from ephemeris (this will work with our stubs)
  const { getAllPositions } = require("./ephemeris")

  // Get current planetary positions
  const positions = getAllPositions(new Date(), 40.7128, -74.006) // NYC coordinates

  console.log("[v0] Planetary Positions:", positions)

  // Detect aspects
  const aspects = detectAspects(positions)

  console.log(`[v0] Found ${aspects.length} aspects:`)
  aspects.forEach((aspect) => {
    console.log(
      `[v0] ${aspect.planets[0]} ${aspect.glyph} ${aspect.planets[1]} - ` +
        `Orb: ${aspect.orb}° (${aspect.strength}) - ` +
        `Confidence: ${aspect.confidence * 100}%`,
    )
  })

  // Show strongest aspects only
  const strongAspects = filterAspectsByStrength(aspects, "medium")
  console.log(`[v0] Strong Aspects (medium+): ${strongAspects.length}`)
}

// TODO: Future enhancements for production:
// 1. Planet-specific orb tolerances (Sun/Moon wider, outer planets tighter)
// 2. Aspect strength modifiers based on planet combinations
// 3. Integration with resonance learning system
// 4. Cross-system validation (Western vs Vedic aspect calculations)
// 5. Historical transit timing for more accurate predictions
// 6. User feedback integration for personalized aspect weighting
