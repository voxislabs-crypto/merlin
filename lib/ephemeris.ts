// Type definitions for ephemeris data
export type PlanetKey = 'SUN' | 'MOON' | 'MERCURY' | 'VENUS' | 'MARS' | 'JUPITER' | 'SATURN' | 'URANUS' | 'NEPTUNE' | 'PLUTO';

export interface PlanetPosition {
  planet: string;
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
  house: number;
  sign: number;
  signName: string;
  degree: number;
  minute: number;
  second: number;
  isMock: boolean;
  confidence: number;
  orb?: number;
}

export interface AspectData {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
  strength: number;
  applying: boolean;
  exact: Date | null;
  confidence: number;
}

export interface EphemerisResult {
  positions: Record<string, PlanetPosition>;
  aspects: AspectData[];
  houses: number[];
  ascendant: number;
  midheaven: number;
  timestamp: Date;
  location: { lat: number; lon: number };
  timezone: string;
}

// Constants
export const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export const PLANET_NAMES: PlanetKey[] = [
  'SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS',
  'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO'
];

// Client-side functions

/**
 * Get the emoji for a zodiac sign
 */
export function getSignEmoji(signName: string): string {
  const emojiMap: Record<string, string> = {
    'Aries': '♈',
    'Taurus': '♉',
    'Gemini': '♊',
    'Cancer': '♋',
    'Leo': '♌',
    'Virgo': '♍',
    'Libra': '♎',
    'Scorpio': '♏',
    'Sagittarius': '♐',
    'Capricorn': '♑',
    'Aquarius': '♒',
    'Pisces': '♓'
  };
  return emojiMap[signName] || '';
}

/**
 * Format a position in degrees to degrees, minutes, seconds
 */
export function formatPosition(position: number): { degrees: number; minutes: number; seconds: number } {
  const degrees = Math.floor(position);
  const minutes = Math.floor((position - degrees) * 60);
  const seconds = Math.floor((((position - degrees) * 60 - minutes) * 60));
  return { degrees, minutes, seconds };
}

// Server-side functions (stubs for client-side)
// These will be implemented in the server module

declare global {
  // This will be replaced by the actual implementation in the server
  const __SERVER__: boolean | undefined;
}

// Only include server-side code in server environment
if (typeof __SERVER__ !== 'undefined' && __SERVER__) {
  // This will be replaced by the actual server implementation
  // The actual implementation will be in swisseph-server.ts
  console.log('Running in server environment');
}

// Export server functions as stubs for client-side
// These will be replaced by the actual implementations in the server environment

/**
 * Get planet position (server implementation)
 */
export async function getPlanetPosition(
  planet: PlanetKey,
  date: Date,
  lat: number,
  lon: number
): Promise<PlanetPosition> {
  if (typeof __SERVER__ === 'undefined' || !__SERVER__) {
    throw new Error('getPlanetPosition can only be called on the server');
  }
  throw new Error('Server implementation not found');
}

/**
 * Get all planet positions (server implementation)
 */
// Flag to track if we're running in a server context
const isServer = typeof window === 'undefined';

export async function getAllPositions(
  date: Date,
  lat: number,
  lon: number
): Promise<Record<string, PlanetPosition>> {
  // If not on server, return mock data
  if (!isServer) {
    console.warn('🌍 Running in browser - using mock ephemeris data');
    const mockModule = await import('./mock-ephemeris');
    return mockModule.getAllPositions(date, lat, lon);
  }

  try {
    console.log('🌍 Server-side: Loading Swiss Ephemeris data...');
    
    try {
      // Use dynamic import to avoid loading the module on the client
      const { getPlanetPositions } = await import('./swiss-ephemeris-core');
      
      // Get positions from Swiss Ephemeris
      const positions = getPlanetPositions(date);
      
      // Convert to the expected format
      const result: Record<string, PlanetPosition> = {};
      
      for (const [planet, positionData] of Object.entries(positions)) {
        // Type assertion for positionData
        const posData = positionData as {
          longitude: number;
          latitude?: number;
          distance?: number;
          speedLongitude?: number;
        };
        
        const position = posData.longitude;
        const signIndex = Math.floor(position / 30);
        const signDegree = position % 30;
        const degrees = Math.floor(signDegree);
        const minutes = Math.floor((signDegree - degrees) * 60);
        const seconds = Math.floor((((signDegree - degrees) * 60) - minutes) * 60);
        
        result[planet] = {
          planet,
          longitude: position,
          latitude: posData.latitude || 0,
          distance: posData.distance || 0,
          speed: posData.speedLongitude || 0,
          house: 0, // Will be calculated separately
          sign: signIndex,
          signName: SIGNS[signIndex],
          degree: degrees,
          minute: minutes,
          second: seconds,
          isMock: false,
          confidence: 1.0,
        };
      }
      
      console.log('✅ Successfully loaded Swiss Ephemeris data');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to import Swiss Ephemeris module:', error);
      throw new Error(`Failed to load Swiss Ephemeris: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Error in getAllPositions:', error);
    
    // Fallback to mock data if available
    if (typeof window === 'undefined') {
      try {
        // Import mock data
        const mockModule = await import('./mock-ephemeris');
        const mock = mockModule.default || mockModule;
        return await mock.getAllPositions(date, lat, lon);
      } catch (mockError) {
        console.error('Failed to load mock ephemeris:', mockError);
        throw new Error('Failed to load ephemeris data and mock fallback failed');
      }
    }
    
    throw new Error('Failed to get planet positions');
  }
}

/**
 * Detect aspects between planets (server implementation)
 */
export function detectAspects(
  positions: Record<string, PlanetPosition>
): AspectData[] {
  if (typeof __SERVER__ === 'undefined' || !__SERVER__) {
    throw new Error('detectAspects can only be called on the server');
  }
  throw new Error('Server implementation not found');
}

/**
 * Demo function to show ephemeris data (server implementation)
 */
export async function demoEphemeris(): Promise<EphemerisResult> {
  if (typeof __SERVER__ === 'undefined' || !__SERVER__) {
    throw new Error('demoEphemeris can only be called on the server');
  }
  throw new Error('Server implementation not found');
}
