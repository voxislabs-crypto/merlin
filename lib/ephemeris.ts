import { utc_to_jd, calc, constants, set_ephe_path } from 'sweph';
import { PlanetPosition, EphemerisResponse } from '@/types/ephemeris';
import { calculatePlanetaryPositions } from './astrology/ephemeris';

// Set the path to the ephemeris files
set_ephe_path('./node_modules/ephemeris/ephe');

// Enhanced ephemeris functions with timezone support and fallback
export async function getPlanetPosition(
  planet: string, 
  date: Date, 
  lat: number, 
  lon: number,
  timezone: string = 'UTC'
): Promise<PlanetPosition> {
  try {
    // Convert timezone to UTC offset
    const utcDate = convertToUTC(date, timezone);
    
    // Get all positions and return the specific planet
    const result = await getAllPositions(utcDate, lat, lon);
    const planetData = result.data[planet.toUpperCase()];
    
    if (!planetData) {
      throw new Error(`Planet ${planet} not found in calculation results`);
    }
    
    return planetData;
  } catch (error) {
    console.error(`Error getting position for ${planet}:`, error);
    // Return fallback data
    return createFallbackPlanetPosition(planet, date);
  }
}

export async function getAllPositions(
  date: Date, 
  lat: number, 
  lon: number,
  timezone: string = 'UTC'
): Promise<EphemerisResponse> {
  try {
    // Convert timezone to UTC
    const utcDate = convertToUTC(date, timezone);
    
    // Use existing Swiss Ephemeris implementation
    const result = await calculatePlanetaryPositions(utcDate, lat, lon);
    
    // Transform to expected format
    const transformedData: Record<string, PlanetPosition> = {};
    
    for (const [planetName, position] of Object.entries(result.positions)) {
      transformedData[planetName] = {
        planet: planetName,
        longitude: position.longitude,
        latitude: position.latitude,
        distance: position.distance,
        speed: position.speed,
        house: position.house,
        sign: getZodiacSignIndex(position.sign),
        signName: position.sign,
        degree: position.degree,
        minute: position.minute,
        second: position.second,
        isMock: false,
        confidence: 0.95, // High confidence for Swiss Ephemeris
      };
    }
    
    return {
      data: transformedData,
      timestamp: new Date().toISOString(),
      source: 'swiss-ephemeris',
      details: 'Calculated using Swiss Ephemeris with real-time planetary positions'
    };
  } catch (error) {
    console.error('Error in getAllPositions:', error);
    // Fallback to mock data
    return getMockPositions(date, lat, lon);
  }
}

// Cross-system validation support
export async function getAllPositionsCrossSystem(
  date: Date,
  lat: number,
  lon: number,
  systems: {
    western?: boolean;
    vedic?: boolean;
    wholeSign?: boolean;
  } = { western: true, vedic: false, wholeSign: true }
): Promise<{
  western?: EphemerisResponse;
  vedic?: EphemerisResponse;
  wholeSign?: EphemerisResponse;
  validation: {
    validated: string[];
    disagreements: string[];
    confidence: number;
  };
}> {
  const results: any = {};
  const comparisons: Record<string, number[]> = {};
  
  try {
    // Western (tropical)
    if (systems.western) {
      results.western = await getAllPositions(date, lat, lon);
    }
    
    // Vedic (sidereal - ayanamsa correction)
    if (systems.vedic) {
      results.vedic = await getVedicPositions(date, lat, lon);
    }
    
    // Whole Sign houses
    if (systems.wholeSign) {
      results.wholeSign = await getWholeSignPositions(date, lat, lon);
    }
    
    // Compare systems for validation
    const validation = compareSystems(results);
    
    return {
      ...results,
      validation
    };
  } catch (error) {
    console.error('Error in cross-system calculation:', error);
    return {
      western: await getMockPositions(date, lat, lon),
      validation: {
        validated: [],
        disagreements: ['All systems failed'],
        confidence: 0.1
      }
    };
  }
}

// Helper functions
function convertToUTC(date: Date, timezone: string): Date {
  // Simple timezone conversion - in production, use a proper timezone library
  const utcDate = new Date(date);
  const offset = getTimezoneOffset(timezone);
  utcDate.setHours(utcDate.getHours() - offset);
  return utcDate;
}

function getTimezoneOffset(timezone: string): number {
  // Simplified timezone offset - in production, use date-fns-tz or similar
  const offsets: Record<string, number> = {
    'UTC': 0,
    'EST': -5,
    'EDT': -4,
    'CST': -6,
    'CDT': -5,
    'MST': -7,
    'MDT': -6,
    'PST': -8,
    'PDT': -7,
    'GMT': 0,
    'BST': 1,
    'CET': 1,
    'CEST': 2,
  };
  return offsets[timezone] || 0;
}

function getZodiacSignIndex(signName: string): number {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  return signs.indexOf(signName);
}

function createFallbackPlanetPosition(planet: string, date: Date): PlanetPosition {
  const basePositions: Record<string, number> = {
    SUN: 120,
    MOON: 210,
    MERCURY: 150,
    VENUS: 180,
    MARS: 210,
    JUPITER: 240,
    SATURN: 270,
    URANUS: 300,
    NEPTUNE: 330,
    PLUTO: 0,
    CHIRON: 60,
    NORTH_NODE: 90,
    SOUTH_NODE: 270
  };
  
  const longitude = basePositions[planet.toUpperCase()] || 0;
  const sign = getZodiacSignIndex(getSignName(longitude));
  
  return {
    planet: planet.toUpperCase(),
    longitude,
    latitude: 0,
    distance: 1,
    speed: 1,
    house: 1,
    sign,
    signName: getSignName(longitude),
    degree: Math.floor(longitude % 30),
    minute: 0,
    second: 0,
    isMock: true,
    confidence: 0.1
  };
}

function getSignName(longitude: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex % 12];
}

function getMockPositions(date: Date, lat: number, lon: number): EphemerisResponse {
  const mockData: Record<string, PlanetPosition> = {};
  const planets = [
    'SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 
    'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO', 'CHIRON', 
    'NORTH_NODE', 'SOUTH_NODE'
  ];
  
  for (const planet of planets) {
    mockData[planet] = createFallbackPlanetPosition(planet, date);
  }
  
  return {
    data: mockData,
    timestamp: new Date().toISOString(),
    source: 'mock',
    warning: 'Using mock data due to ephemeris calculation failure'
  };
}

// Vedic positions (sidereal with ayanamsa correction)
async function getVedicPositions(date: Date, lat: number, lon: number): Promise<EphemerisResponse> {
  const westernResult = await getAllPositions(date, lat, lon);
  
  // Apply ayanamsa correction (approximately 24° as of 2020)
  const ayanamsa = 24.0;
  const vedicData: Record<string, PlanetPosition> = {};
  
  for (const [planet, position] of Object.entries(westernResult.data)) {
    const vedicLongitude = (position.longitude - ayanamsa + 360) % 360;
    vedicData[planet] = {
      ...position,
      longitude: vedicLongitude,
      sign: getZodiacSignIndex(getSignName(vedicLongitude)),
      signName: getSignName(vedicLongitude),
      degree: Math.floor(vedicLongitude % 30),
      confidence: position.confidence * 0.9 // Slightly lower confidence for vedic
    };
  }
  
  return {
    data: vedicData,
    timestamp: new Date().toISOString(),
    source: 'swiss-ephemeris',
    details: 'Vedic (sidereal) positions with ayanamsa correction'
  };
}

// Whole sign house system
async function getWholeSignPositions(date: Date, lat: number, lon: number): Promise<EphemerisResponse> {
  const westernResult = await getAllPositions(date, lat, lon);
  
  // In whole sign, houses are determined solely by sign position
  const wholeSignData: Record<string, PlanetPosition> = {};
  
  for (const [planet, position] of Object.entries(westernResult.data)) {
    wholeSignData[planet] = {
      ...position,
      house: position.sign + 1, // House = sign number + 1
      confidence: position.confidence * 0.95
    };
  }
  
  return {
    data: wholeSignData,
    timestamp: new Date().toISOString(),
    source: 'swiss-ephemeris',
    details: 'Whole sign house system'
  };
}

// System comparison for validation
function compareSystems(results: any): {
  validated: string[];
  disagreements: string[];
  confidence: number;
} {
  const systems = Object.keys(results);
  if (systems.length < 2) {
    return {
      validated: [],
      disagreements: [],
      confidence: 0.5
    };
  }
  
  const validated: string[] = [];
  const disagreements: string[] = [];
  let totalAgreements = 0;
  let totalComparisons = 0;
  
  // Get all planet names from the first system
  const planets = Object.keys(results[systems[0]].data);
  
  for (const planet of planets) {
    const positions: number[] = [];
    
    for (const system of systems) {
      if (results[system].data[planet]) {
        positions.push(results[system].data[planet].longitude);
      }
    }
    
    if (positions.length >= 2) {
      totalComparisons++;
      const maxDiff = Math.max(...positions) - Math.min(...positions);
      
      if (maxDiff <= 2) { // Within 2 degrees = validated
        validated.push(planet);
        totalAgreements++;
      } else {
        disagreements.push(planet);
      }
    }
  }
  
  const confidence = totalComparisons > 0 ? totalAgreements / totalComparisons : 0.5;
  
  return {
    validated,
    disagreements,
    confidence
  };
}

// Export the existing function for compatibility
export { calculatePlanetaryPositions } from './astrology/ephemeris';
