import { getPlanetaryPositions } from '../src/lib/ephemeris';
import { detectAspects } from './aspects';
import type { Aspect } from './aspects';

// Simple theme generator based on aspects
function generateThemes(aspects: any[]): { primaryTheme: string; supportingThemes: string[] } {
  if (aspects.length === 0) {
    return {
      primaryTheme: 'Neutral',
      supportingThemes: ['No significant aspects']
    };
  }

  // Count aspect types with proper type assertion
  const aspectCounts = aspects.reduce<Record<string, number>>((acc, aspect) => {
    const aspectType = (aspect as { aspect: string }).aspect;
    acc[aspectType] = (acc[aspectType] || 0) + 1;
    return acc;
  }, {});

  // Determine primary theme based on most common aspect type
  const primaryAspect = Object.entries(aspectCounts).sort((a, b) => b[1] - a[1])[0][0];
  
  const themeMap: Record<string, string> = {
    'conjunction': 'New Beginnings',
    'opposition': 'Challenges',
    'trine': 'Harmony',
    'square': 'Tension',
    'sextile': 'Opportunities'
  };

  const primaryTheme = themeMap[primaryAspect] || 'Reflection';
  
  // Generate supporting themes from other aspects
  const supportingThemes = Object.entries(aspectCounts)
    .filter(([aspect]) => aspect !== primaryAspect)
    .map(([aspect, count]) => `${themeMap[aspect] || aspect} (${count})`);

  return { primaryTheme, supportingThemes };
}

export interface ForecastOptions {
  days?: number;
}

export interface DailyForecast {
  date: Date;
  primaryTheme: string;
  supportingThemes: string[];
  aspects: any[]; // Replace with proper aspect type
  confidence: number;
  resonanceStats: {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
  };
}

/**
 * Get a single day's forecast
 */
export async function getDailyForecast(
  date: Date,
  location: { latitude: number; longitude: number }
): Promise<DailyForecast> {
  try {
    try {
    // Get planetary positions
    const ephemerisData = await getPlanetaryPositions({
      date,
      latitude: location.latitude,
      longitude: location.longitude
    });
    const positions = ephemerisData.positions;
    
    // Calculate aspects
    const aspects = detectAspects(positions);
    
    // Generate themes from aspects
    const { primaryTheme, supportingThemes } = generateThemes(aspects);
    
    // Calculate resonance stats
    const resonanceStats = {
      total: aspects.length,
      positive: aspects.filter(a => ['trine', 'sextile'].includes(a.aspect)).length,
      negative: aspects.filter(a => ['square', 'opposition'].includes(a.aspect)).length,
      neutral: aspects.filter(a => a.aspect === 'conjunction').length
    };
    
    return {
      date,
      primaryTheme,
      supportingThemes,
      aspects,
      confidence: calculateConfidence(aspects),
      resonanceStats
    };
    } catch (error) {
      console.error(`Error generating forecast for ${date.toISOString().split('T')[0]}:`, error);
      // Return a fallback forecast if there's an error
      return getFallbackForecast(date);
    }
  } catch (error) {
    console.error(`Unexpected error in getDailyForecast:`, error);
    return getFallbackForecast(date);
  }
}

/**
 * Get a weekly forecast (or any date range up to 14 days)
 */
export async function getWeeklyForecast(
  startDate: Date,
  location: { latitude: number; longitude: number },
  options: ForecastOptions = {}
): Promise<DailyForecast[]> {
  const { days = 7 } = options;
  const forecasts: DailyForecast[] = [];
  
  // Ensure we don't exceed the 14-day limit
  const numDays = Math.min(Math.max(1, days), 14);
  
  // Generate forecasts for each day in the range
  for (let i = 0; i < numDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    try {
      const forecast = await getDailyForecast(currentDate, location);
      forecasts.push(forecast);
    } catch (error) {
      console.error(`Failed to generate forecast for ${currentDate.toISOString()}:`, error);
      // Push a fallback forecast if there's an error
      forecasts.push(getFallbackForecast(currentDate));
    }
  }
  
  return forecasts;
}

/**
 * Calculate confidence score based on aspects
 */
function calculateConfidence(aspects: any[]): number {
  if (aspects.length === 0) return 0.5; // Neutral confidence if no aspects
  
  // Calculate confidence based on aspect types and counts
  const aspectWeights = {
    conjunction: 1.0,
    opposition: 0.9,
    square: 0.8,
    trine: 0.7,
    sextile: 0.6
  };
  
  const totalWeight = aspects.reduce((sum, aspect) => {
    return sum + (aspectWeights[aspect.aspect as keyof typeof aspectWeights] || 0.5);
  }, 0);
  
  // Normalize to 0-1 range
  const normalized = totalWeight / (aspects.length * 1.0);
  
  // Ensure within bounds
  return Math.min(Math.max(normalized, 0), 1);
}

/**
 * Generate a fallback forecast in case of errors
 */
function getFallbackForecast(date: Date): DailyForecast {
  console.warn(`Using fallback forecast for ${date.toISOString().split('T')[0]}`);
  
  return {
    date,
    primaryTheme: 'Uncertain Times',
    supportingThemes: ['Data Unavailable'],
    aspects: [],
    confidence: 0,
    resonanceStats: {
      total: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
    },
  };
}

// Missing functions needed by weekly-forecast API
function generateMood(aspects: any[]): string {
  if (aspects.length === 0) return 'Neutral';
  
  // Count aspect types
  const aspectCounts = aspects.reduce((acc, aspect) => {
    acc[aspect.aspect] = (acc[aspect.aspect] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Determine mood based on dominant aspect type
  if (aspectCounts['square'] || aspectCounts['opposition']) {
    return 'Challenged';
  } else if (aspectCounts['trine'] || aspectCounts['sextile']) {
    return 'Harmonious';
  } else if (aspectCounts['conjunction']) {
    return 'Energetic';
  }
  
  return 'Balanced';
}

function generateAdvice(primaryTheme: string, aspects: any[]): string {
  // Simple advice based on primary theme
  const adviceMap: Record<string, string> = {
    'New Beginnings': 'A great day to start new projects or set intentions.',
    'Challenges': 'Practice patience and flexibility today.',
    'Harmony': 'A good day for collaboration and social activities.',
    'Tension': 'Take time to reflect before making important decisions.',
    'Opportunities': 'Be open to new possibilities and connections.',
    'Reflection': 'A good day for introspection and planning.',
  };
  
  return adviceMap[primaryTheme] || 'Trust your intuition today.';
}

function calculateIntensity(aspects: any[]): number {
  if (aspects.length === 0) return 0.2;
  
  // Calculate intensity based on number and type of aspects
  let intensity = 0;
  
  for (const aspect of aspects) {
    // Weight different aspect types differently
    const weights: Record<string, number> = {
      conjunction: 1.2,
      opposition: 1.0,
      square: 0.9,
      trine: 0.7,
      sextile: 0.5,
    };
    
    const weight = weights[aspect.aspect] || 0.5;
    const orbFactor = 1 - (aspect.orb / 8); // Normalize orb (0-8°) to 0-1
    
    intensity += weight * orbFactor;
  }
  
  // Cap intensity at 1.0 and ensure minimum value
  return Math.min(Math.max(intensity * 0.2, 0.1), 1.0);
}

// Export additional functions needed by weekly-forecast API
export { generateThemes, generateMood, generateAdvice, calculateIntensity, calculateConfidence };
