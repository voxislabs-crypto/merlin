import type { PlanetPositions } from "./swiss-ephemeris-core.js"
import { resonanceEngine, type Feedback as ResonanceFeedback } from './resonance/resonance.service.js';
import { getTopThemes, type Theme, type ThemeScore } from './theme-utils.js';
import { PLANET_WEIGHTS, ASPECT_STRENGTH, DEFAULT_ORBS } from './constants.js';

export interface AspectDefinition {
  name: string
  angle: number
  orb: number
}

export interface DetectedAspect {
  planet1: string
  planet2: string
  aspect: string
  orb: number
  score?: number
  intensity?: "high" | "medium" | "low"
  confidence?: number
  resonanceScore?: number; // Added resonance score
  themes?: ThemeScore[]; // Theme scores for this aspect
}

// Extended feedback interface for aspect-specific data
export interface AspectFeedback extends Omit<ResonanceFeedback, 'entityId' | 'entityType'> {
  planet1: string;
  planet2: string;
  aspect: string;
}

export const aspects: AspectDefinition[] = [
  { name: "CONJUNCTION", angle: 0, orb: DEFAULT_ORBS.CONJUNCTION },
  { name: "SEXTILE", angle: 60, orb: DEFAULT_ORBS.SEXTILE },
  { name: "SQUARE", angle: 90, orb: DEFAULT_ORBS.SQUARE },
  { name: "TRINE", angle: 120, orb: DEFAULT_ORBS.TRINE },
  { name: "OPPOSITION", angle: 180, orb: DEFAULT_ORBS.OPPOSITION },
];

// Default weights for aspects when no resonance data is available
export const defaultAspectWeights: Record<string, number> = {
  Conjunction: 0.8,
  Sextile: 0.6,
  Square: -0.4,
  Trine: 0.7,
  Opposition: -0.5
};

// Default weights for planets when no resonance data is available
export const planetWeights: Record<string, number> = {
  SUN: 1.0,
  MOON: 1.0,
  MERCURY: 0.8,
  VENUS: 0.9,
  MARS: 0.9,
  JUPITER: 0.8,
  SATURN: 0.7,
  URANUS: 0.6,
  NEPTUNE: 0.6,
  PLUTO: 0.7,
  CHIRON: 0.5,
  NORTH_NODE: 0.7,
  SOUTH_NODE: 0.7,
  VERTEX: 0.5,
  FORTUNE: 0.4
};

// Generate a unique ID for an aspect combination
function getAspectId(planet1: string, planet2: string, aspect: string): string {
  const sortedPlanets = [planet1, planet2].sort().join('_');
  return `aspect_${sortedPlanets}_${aspect.toLowerCase()}`;
}

/**
 * Record feedback for an aspect
 */
export async function recordAspectFeedback(
  feedback: Omit<AspectFeedback, 'entityId' | 'entityType'> & {
    userId?: string;
  }
): Promise<void> {
  const { planet1, planet2, aspect, userId, ...rest } = feedback;
  const entityId = getAspectId(planet1, planet2, aspect);
  
  await resonanceEngine.recordFeedback({
    ...rest,
    userId,
    entityId,
    entityType: 'aspect',
  });
}

/**
 * Get the resonance score for an aspect
 */
export async function getAspectResonance(
  planet1: string,
  planet2: string,
  aspect: string,
  userId?: string,
  clusterId?: string
): Promise<number> {
  const entityId = getAspectId(planet1, planet2, aspect);
  
  try {
    // Get the base resonance score
    const resonanceScore = await resonanceEngine.getResonanceScore({
      userId,
      clusterId,
      entityId,
      entityType: 'aspect',
    });

    // If we have a resonance score, use it
    if (resonanceScore !== 0) {
      return resonanceScore;
    }
  } catch (error) {
    console.error('Error getting resonance score:', error);
    // Fall through to default weight
  }

  // Fall back to default aspect weight if no resonance data or error
  return defaultAspectWeights[aspect] || 0;
}

// Enhanced aspect detection with resonance scoring
export async function detectAspectsWithResonance(
  positions: Record<string, { longitude: number }>,
  options: {
    userId?: string;
    clusterId?: string;
    customOrbs?: Record<string, number>;
    includeThemes?: boolean;
    themeOptions?: {
      limit?: number;
      minScore?: number;
    };
  } = {}
): Promise<DetectedAspect[]> {
  const { userId, clusterId, customOrbs = {} } = options;
  const detected: DetectedAspect[] = [];
  const planets = Object.keys(positions);

  // Check all planet pairs
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];
      const pos1 = typeof positions[planet1] === 'number' ? positions[planet1] : positions[planet1].longitude;
      const pos2 = typeof positions[planet2] === 'number' ? positions[planet2] : positions[planet2].longitude;
      
      // Check each possible aspect
      for (const aspect of aspects) {
        const orb = customOrbs[aspect.name] ?? aspect.orb;
        const angleDiff = Math.abs(pos1 - pos2);
        const distance = Math.min(angleDiff, 360 - angleDiff);
        const aspectDiff = Math.abs(distance - aspect.angle);
        
        // If within orb, it's an aspect
        if (aspectDiff <= orb) {
          // Calculate the resonance score for this aspect
          const resonanceScore = await getAspectResonance(
            planet1,
            planet2,
            aspect.name,
            userId,
            clusterId
          );
          
          // Calculate aspect strength (1.0 = exact, 0.0 = at orb edge)
          const strength = 1 - (aspectDiff / orb);
          
          // Calculate confidence based on orb
          const confidence = Math.max(0.1, 1 - (aspectDiff / (orb * 1.5)));
          
          // Determine intensity based on orb
          let intensity: 'high' | 'medium' | 'low' = 'low';
          if (aspectDiff <= orb * 0.33) intensity = 'high';
          else if (aspectDiff <= orb * 0.66) intensity = 'medium';
          
          detected.push({
            planet1,
            planet2,
            aspect: aspect.name,
            orb: parseFloat(aspectDiff.toFixed(2)),
            score: resonanceScore * strength, // Weighted by aspect strength
            intensity,
            confidence,
            resonanceScore // Store the base resonance score
          });
        }
      }
    }
  }
  
  // Sort by score (highest first)
  const sortedAspects = detected.sort((a, b) => (b.score || 0) - (a.score || 0));

  // Add theme scores if requested
  if (options.includeThemes) {
    for (const aspect of sortedAspects) {
      aspect.themes = await getTopThemes(
        [aspect],
        {
          userId: options.userId,
          clusterId: options.clusterId,
          limit: options.themeOptions?.limit,
          minScore: options.themeOptions?.minScore,
        }
      );
    }
  }

  return sortedAspects;
}

// Export theme-related types
export type { Theme, ThemeScore } from './theme-utils.js';

export interface DetectedAspectWithThemes extends DetectedAspect {
  themes?: ThemeScore[];
}

// Backward compatibility
// Aspect strength is now defined in constants.ts

export function angleDifference(pos1: number | { longitude: number }, pos2: number | { longitude: number }): number {
  const long1 = typeof pos1 === 'number' ? pos1 : pos1.longitude;
  const long2 = typeof pos2 === 'number' ? pos2 : pos2.longitude;
  let diff = Math.abs(long1 - long2);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

export function scoreAspect(aspect: DetectedAspect): number {
  const orbScore = 1 - Math.abs(aspect.orb) / 8 // Scale to 0-1
  const planetScore = (PLANET_WEIGHTS[aspect.planet1] || 1) + (PLANET_WEIGHTS[aspect.planet2] || 1)
  const aspectScore = ASPECT_STRENGTH[aspect.aspect] || 2
  return orbScore * aspectScore * planetScore
}

export function detectAspects(planets: PlanetPositions): DetectedAspect[] {
  const results: DetectedAspect[] = []
  const planetNames = Object.keys(planets)

  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const p1 = planetNames[i]
      const p2 = planetNames[j]
      const angle = angleDifference(planets[p1], planets[p2])

      aspects.forEach((aspectDef) => {
        const orbDifference = Math.abs(angle - aspectDef.angle)
        if (orbDifference <= aspectDef.orb) {
          const detectedAspect: DetectedAspect = {
            planet1: p1,
            planet2: p2,
            aspect: aspectDef.name,
            orb: angle - aspectDef.angle,
          }

          // Calculate additional properties
          detectedAspect.score = scoreAspect(detectedAspect)
          detectedAspect.confidence = 1 - orbDifference / aspectDef.orb

          // Determine intensity based on orb tightness
          if (orbDifference < 2) {
            detectedAspect.intensity = "high"
          } else if (orbDifference < 5) {
            detectedAspect.intensity = "medium"
          } else {
            detectedAspect.intensity = "low"
          }

          results.push(detectedAspect)
        }
      })
    }
  }

  // Sort by score (highest first) and return
  return results.sort((a, b) => (b.score || 0) - (a.score || 0))
}

export function prioritizeAspects(aspectsDetected: DetectedAspect[], limit = 5): DetectedAspect[] {
  return aspectsDetected.slice(0, limit)
}

export function getAspectColor(aspect: DetectedAspect): "red" | "yellow" | "green" {
  switch (aspect.intensity) {
    case "high":
      return "red"
    case "medium":
      return "yellow"
    case "low":
    default:
      return "green"
  }
}

export function formatAspect(aspect: DetectedAspect): string {
  const orbSign = aspect.orb >= 0 ? "+" : ""
  return `${aspect.planet1} ${aspect.aspect.toLowerCase()} ${aspect.planet2} (${orbSign}${aspect.orb.toFixed(2)}°)`
}
