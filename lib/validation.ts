// Cross-System Validation for Astrology Systems
// Compares planetary positions across Western, Vedic, and Whole Sign systems

import { EphemerisResponse, PlanetPosition } from '@/types/ephemeris';
import { getAllPositionsCrossSystem } from './ephemeris';

export interface SystemValidation {
  planet: string
  western: number // longitude in Western
  vedic: number // longitude in Vedic
  wholeSign: number // longitude in Whole Sign
  agreement: boolean // true if within tolerance
  tolerance: number // degrees difference allowed
  maxDifference: number // actual maximum difference found
  confidence: number // confidence for this specific planet
}

export interface SystemComparison {
  validations: SystemValidation[]
  overallConfidence: number
  agreementCount: number
  totalCount: number
  validatedPlanets: string[]
  disagreedPlanets: string[]
  systemStatus: {
    western: boolean
    vedic: boolean
    wholeSign: boolean
  }
  systems: {
    western?: EphemerisResponse
    vedic?: EphemerisResponse
    wholeSign?: EphemerisResponse
  }
}

/**
 * Enhanced cross-system validation using real ephemeris calculations
 */
export async function validatePositionsCrossSystem(
  date: Date,
  lat: number,
  lon: number,
  systems: {
    western?: boolean;
    vedic?: boolean;
    wholeSign?: boolean;
  } = { western: true, vedic: true, wholeSign: true }
): Promise<SystemComparison> {
  try {
    // Get positions from all requested systems
    const systemResults = await getAllPositionsCrossSystem(date, lat, lon, systems);
    
    const validations: SystemValidation[] = [];
    const planets = new Set<string>();
    
    // Collect all planets from all systems
    Object.values(systemResults).forEach(result => {
      if (result && 'data' in result && result.data) {
        Object.keys(result.data).forEach(planet => planets.add(planet));
      }
    });
    
    // Validate each planet across systems
    for (const planet of Array.from(planets)) {
      const validation = validatePlanetAcrossSystems(planet, systemResults);
      if (validation) {
        validations.push(validation);
      }
    }
    
    const overallConfidence = calculateOverallConfidence(validations);
    const agreementCount = validations.filter(v => v.agreement).length;
    const validatedPlanets = validations.filter(v => v.agreement).map(v => v.planet);
    const disagreedPlanets = validations.filter(v => !v.agreement).map(v => v.planet);
    
    return {
      validations,
      overallConfidence,
      agreementCount,
      totalCount: validations.length,
      validatedPlanets,
      disagreedPlanets,
      systemStatus: {
        western: !!systemResults.western,
        vedic: !!systemResults.vedic,
        wholeSign: !!systemResults.wholeSign,
      },
      systems: systemResults
    };
  } catch (error) {
    console.error('Error in cross-system validation:', error);
    // Return fallback comparison
    return createFallbackComparison(date, lat, lon);
  }
}

/**
 * Validates a single planet across all available systems
 */
function validatePlanetAcrossSystems(
  planet: string,
  systemResults: any
): SystemValidation | null {
  const positions: { system: string; longitude: number }[] = [];
  
  // Collect positions from each available system
  if (systemResults.western && 'data' in systemResults.western && systemResults.western.data?.[planet]) {
    positions.push({ 
      system: 'western', 
      longitude: systemResults.western.data[planet].longitude 
    });
  }
  
  if (systemResults.vedic && 'data' in systemResults.vedic && systemResults.vedic.data?.[planet]) {
    positions.push({ 
      system: 'vedic', 
      longitude: systemResults.vedic.data[planet].longitude 
    });
  }
  
  if (systemResults.wholeSign && 'data' in systemResults.wholeSign && systemResults.wholeSign.data?.[planet]) {
    positions.push({ 
      system: 'wholeSign', 
      longitude: systemResults.wholeSign.data[planet].longitude 
    });
  }
  
  if (positions.length < 2) {
    return null; // Need at least 2 systems to compare
  }
  
  // Calculate differences and agreement
  const tolerance = 2; // degrees
  let maxDifference = 0;
  
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const diff = calculateAngularDifference(positions[i].longitude, positions[j].longitude);
      maxDifference = Math.max(maxDifference, diff);
    }
  }
  
  const agreement = maxDifference <= tolerance;
  const confidence = calculatePlanetConfidence(positions, maxDifference);
  
  return {
    planet,
    western: systemResults.western?.data?.[planet]?.longitude || 0,
    vedic: systemResults.vedic?.data?.[planet]?.longitude || 0,
    wholeSign: systemResults.wholeSign?.data?.[planet]?.longitude || 0,
    agreement,
    tolerance,
    maxDifference: Math.round(maxDifference * 100) / 100,
    confidence
  };
}

/**
 * Calculates angular difference between two longitudes
 */
function calculateAngularDifference(long1: number, long2: number): number {
  let diff = Math.abs(long1 - long2);
  if (diff > 180) {
    diff = 360 - diff;
  }
  return diff;
}

/**
 * Calculates confidence score for a specific planet based on system agreement
 */
function calculatePlanetConfidence(positions: { system: string; longitude: number }[], maxDifference: number): number {
  const baseConfidence = 0.8;
  const tolerance = 2;
  
  if (maxDifference === 0) {
    return 0.95; // Perfect agreement
  }
  
  const penalty = (maxDifference / tolerance) * 0.3;
  return Math.max(0.5, baseConfidence - penalty);
}

/**
 * Calculates overall confidence across all planets
 */
function calculateOverallConfidence(validations: SystemValidation[]): number {
  if (validations.length === 0) return 0;
  
  const totalConfidence = validations.reduce((sum, v) => sum + v.confidence, 0);
  return totalConfidence / validations.length;
}

/**
 * Creates fallback comparison when real systems fail
 */
function createFallbackComparison(date: Date, lat: number, lon: number): SystemComparison {
  return {
    validations: [],
    overallConfidence: 0.1,
    agreementCount: 0,
    totalCount: 0,
    validatedPlanets: [],
    disagreedPlanets: [],
    systemStatus: {
      western: false,
      vedic: false,
      wholeSign: false,
    },
    systems: {}
  };
}

/**
 * Legacy function for backward compatibility
 */
export function validatePositions(positions: Record<string, { longitude: number }>): SystemValidation[] {
  const results: SystemValidation[] = [];

  for (const [planet, data] of Object.entries(positions)) {
    const western = data.longitude;

    // Approximate Vedic (sidereal) with ayanamsa correction
    const vedic = (western - 24 + 360) % 360;

    // Whole Sign approximation
    const wholeSign = Math.floor(western / 30) * 30;

    const tolerance = 2; // degrees

    // Check agreement between Western and Vedic
    const westernVedicDiff = calculateAngularDifference(western, vedic);
    const agreement = westernVedicDiff <= tolerance;

    results.push({
      planet,
      western,
      vedic,
      wholeSign,
      agreement,
      tolerance,
      maxDifference: westernVedicDiff,
      confidence: agreement ? 0.8 : 0.4
    });
  }

  return results;
}

/**
 * Legacy function for backward compatibility
 */
export function calculateConfidence(validations: SystemValidation[]): number {
  return calculateOverallConfidence(validations);
}

/**
 * Performs comprehensive system comparison with detailed analysis
 */
export function performSystemComparison(positions: Record<string, { longitude: number }>): SystemComparison {
  const validations = validatePositions(positions);
  const overallConfidence = calculateOverallConfidence(validations);
  const agreementCount = validations.filter((v) => v.agreement).length;
  const totalCount = validations.length;
  const validatedPlanets = validations.filter(v => v.agreement).map(v => v.planet);
  const disagreedPlanets = validations.filter(v => !v.agreement).map(v => v.planet);

  return {
    validations,
    overallConfidence,
    agreementCount,
    totalCount,
    validatedPlanets,
    disagreedPlanets,
    systemStatus: {
      western: true,
      vedic: true,
      wholeSign: true,
    },
    systems: {}
  };
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
