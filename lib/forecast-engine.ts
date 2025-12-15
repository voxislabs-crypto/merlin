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
