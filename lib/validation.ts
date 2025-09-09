// Cross-System Validation for Astrology Systems
// Compares planetary positions across Western, Vedic, and Whole Sign systems

export interface SystemValidation {
  planet: string
  western: number // longitude in Western
  vedic: number // longitude in Vedic
  wholeSign: number // longitude in Whole Sign
  agreement: boolean // true if within tolerance
  tolerance: number // degrees difference allowed
}

export interface SystemComparison {
  validations: SystemValidation[]
  confidence: number
  agreementCount: number
  totalCount: number
  systemStatus: {
    western: boolean
    vedic: boolean
    wholeSign: boolean
  }
}

/**
 * Validates planetary positions across different astrology systems
 * Currently uses stub calculations - TODO: Replace with real system calculations
 */
export function validatePositions(positions: Record<string, { longitude: number }>): SystemValidation[] {
  const results: SystemValidation[] = []

  for (const [planet, data] of Object.entries(positions)) {
    const western = data.longitude

    // TODO: Replace with real ayanamsa calculation from Swiss Ephemeris
    // Current stub uses approximate 24° Lahiri ayanamsa
    const vedic = (western - 24 + 360) % 360

    // TODO: Replace with proper Whole Sign house calculation
    // Current stub snaps to nearest 30° sign boundary
    const wholeSign = Math.floor(western / 30) * 30

    const tolerance = 2 // degrees

    // Check agreement between Western and Vedic (most critical comparison)
    const westernVedicDiff = Math.min(Math.abs(western - vedic), 360 - Math.abs(western - vedic))
    const agreement = westernVedicDiff <= tolerance

    results.push({
      planet,
      western,
      vedic,
      wholeSign,
      agreement,
      tolerance,
    })
  }

  return results
}

/**
 * Calculates confidence score based on system agreement
 * Returns value between 0 and 1
 */
export function calculateConfidence(validations: SystemValidation[]): number {
  const total = validations.length
  if (total === 0) return 0

  const agreed = validations.filter((v) => v.agreement).length
  return agreed / total
}

/**
 * Performs comprehensive system comparison with detailed analysis
 */
export function performSystemComparison(positions: Record<string, { longitude: number }>): SystemComparison {
  const validations = validatePositions(positions)
  const confidence = calculateConfidence(validations)
  const agreementCount = validations.filter((v) => v.agreement).length
  const totalCount = validations.length

  // TODO: Add real system availability checks
  const systemStatus = {
    western: true, // Always available (base system)
    vedic: true, // TODO: Check if Vedic calculations are available
    wholeSign: true, // TODO: Check if Whole Sign calculations are available
  }

  return {
    validations,
    confidence,
    agreementCount,
    totalCount,
    systemStatus,
  }
}

/**
 * Gets system agreement icons for UI display
 */
export function getSystemAgreementIcons(validations: SystemValidation[]): {
  western: string
  vedic: string
  wholeSign: string
} {
  const confidence = calculateConfidence(validations)

  // TODO: Make this more sophisticated based on individual system performance
  const westernIcon = confidence > 0.8 ? "✅" : confidence > 0.5 ? "⚠️" : "❌"
  const vedicIcon = confidence > 0.7 ? "✅" : confidence > 0.4 ? "⚠️" : "❌"
  const wholeSignIcon = confidence > 0.6 ? "✅" : confidence > 0.3 ? "⚠️" : "❌"

  return {
    western: westernIcon,
    vedic: vedicIcon,
    wholeSign: wholeSignIcon,
  }
}

/**
 * Formats confidence score as percentage for UI display
 */
export function formatConfidenceScore(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}

// TODO: Future enhancements for production
// - Integrate with real Swiss Ephemeris ayanamsa calculations
// - Add support for multiple ayanamsa systems (Lahiri, Raman, etc.)
// - Implement proper Whole Sign house calculations
// - Add Hellenistic and other traditional systems
// - Include orb-based weighting for agreement calculations
// - Add system-specific confidence thresholds
