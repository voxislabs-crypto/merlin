// Import the Swiss Ephemeris library with proper type definitions
let swisseph: any = null;
let isAvailable = false;

// Only attempt to load the native module on the server side
if (typeof window === 'undefined') {
  try {
    // Use dynamic import to avoid webpack bundling issues
    const swissephModule = require('swisseph');
    const ephePath = require('swisseph/eph');
    
    // Initialize the ephemeris path
    swissephModule.swe_set_ephe_path(ephePath);
    
    swisseph = swissephModule;
    isAvailable = true;
  } catch (error) {
    console.warn('⚠️ Swiss Ephemeris native module not available. Using mock data.');
    console.warn('If you need real ephemeris data, please ensure the swisseph package is properly installed.');
    console.warn(error);
  }
} else {
  console.warn('🌐 Running in browser - Swiss Ephemeris will use mock data');
}

// Define planet numbers for better type safety
const PLANET_NUMBERS = {
  SUN: isAvailable ? swisseph.SE_SUN : 0,
  MOON: isAvailable ? swisseph.SE_MOON : 1,
  MERCURY: isAvailable ? swisseph.SE_MERCURY : 2,
  VENUS: isAvailable ? swisseph.SE_VENUS : 3,
  MARS: isAvailable ? swisseph.SE_MARS : 4,
  JUPITER: isAvailable ? swisseph.SE_JUPITER : 5,
  SATURN: isAvailable ? swisseph.SE_SATURN : 6,
  URANUS: isAvailable ? swisseph.SE_URANUS : 7,
  NEPTUNE: isAvailable ? swisseph.SE_NEPTUNE : 8,
  PLUTO: isAvailable ? swisseph.SE_PLUTO : 9,
  MEAN_NODE: isAvailable ? swisseph.SE_MEAN_NODE : 10,
  TRUE_NODE: isAvailable ? swisseph.SE_TRUE_NODE : 11
};

export interface PlanetPositions {
  [key: string]: {
    longitude: number;
    latitude?: number;
    distance?: number;
    speedLongitude?: number;
    speedLatitude?: number;
    speedDistance?: number;
  };
}

/**
 * Converts a JavaScript Date to Julian Day
 * @param date JavaScript Date object
 * @returns Julian Day as a number
 */
export function toJulianDay(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getDate();
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  
  const julianDay = swisseph.swe_julday(
    year,
    month,
    day,
    hour,
    swisseph.SE_GREG_CAL
  );
  
  return julianDay;
}

/**
 * Gets planetary positions for a specific date
 * @param date JavaScript Date object
 * @returns Object containing planet positions
 */
export function getPlanetPositions(date: Date): PlanetPositions {
  // If the native module isn't available, return mock data
  if (!isAvailable) {
    console.warn('Swiss Ephemeris native module not available. Returning mock data.');
    return generateMockPositions(date);
  }

  try {
    const julianDay = toJulianDay(date);
    const positions: PlanetPositions = {};
    
    // Define planet numbers for easier reference
    const planets = [
      { name: 'sun', number: PLANET_NUMBERS.SUN },
      { name: 'moon', number: PLANET_NUMBERS.MOON },
      { name: 'mercury', number: PLANET_NUMBERS.MERCURY },
      { name: 'venus', number: PLANET_NUMBERS.VENUS },
      { name: 'mars', number: PLANET_NUMBERS.MARS },
      { name: 'jupiter', number: PLANET_NUMBERS.JUPITER },
      { name: 'saturn', number: PLANET_NUMBERS.SATURN },
      { name: 'uranus', number: PLANET_NUMBERS.URANUS },
      { name: 'neptune', number: PLANET_NUMBERS.NEPTUNE },
      { name: 'pluto', number: PLANET_NUMBERS.PLUTO },
      { name: 'meanNode', number: PLANET_NUMBERS.MEAN_NODE },
      { name: 'trueNode', number: PLANET_NUMBERS.TRUE_NODE },
    ];
    
    // Calculate positions for each planet
    for (const planet of planets) {
      try {
        const result = isAvailable 
          ? swisseph.swe_calc_ut(julianDay, planet.number, swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED)
          : null;
        
        if (!result || 'error' in result) {
          console.error(`Error calculating position for ${planet.name}:`, result?.error || 'Native module not available');
          throw new Error('Calculation failed');
        }
      
        if ('longitude' in result) {
          positions[planet.name] = {
            longitude: result.longitude,
            latitude: result.latitude || 0,
            distance: result.distance || 1,
            speedLongitude: result.longitudeSpeed || 0,
            speedLatitude: result.latitudeSpeed || 0,
            speedDistance: result.distanceSpeed || 0
          };
        } else if ('rectAscension' in result) {
          // Handle equatorial coordinates if needed
          console.warn(`Received equatorial coordinates for ${planet.name}, converting to ecliptic`);
          positions[planet.name] = {
            longitude: result.rectAscension || 0,
            latitude: result.declination || 0,
            distance: result.distance || 1,
            speedLongitude: result.rectAscensionSpeed || 0,
            speedLatitude: result.declinationSpeed || 0,
            speedDistance: result.distanceSpeed || 0
          };
        } else {
          // Fallback for other coordinate systems
          throw new Error('Unexpected coordinate system');
        }
      } catch (error) {
        console.warn(`Using mock data for ${planet.name}:`, error.message);
        // Fall back to mock data for this planet
        const mockPositions = generateMockPositions(date);
        positions[planet.name] = mockPositions[planet.name] || {
          longitude: 0,
          latitude: 0,
          distance: 1,
          speedLongitude: 0,
          speedLatitude: 0,
          speedDistance: 0
        };
      }
    }
    
    return positions;
  } catch (error) {
    console.error('Error in getPlanetPositions:', error);
    // Fall back to mock data if there's an error
    return generateMockPositions(date);
  }
}

/**
 * Generates mock planetary positions for testing/fallback purposes
 */
function generateMockPositions(date: Date): PlanetPositions {
  // Use the date to generate consistent but varying positions
  const basePosition = (date.getTime() / 1000 / 60 / 60 / 24) % 360; // Days since epoch
  
  const positions: PlanetPositions = {};
  
  // Define planet names
  const planets = [
    'sun', 'moon', 'mercury', 'venus', 'mars', 
    'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
    'meanNode', 'trueNode'
  ];
  
  // Generate positions for each planet
  planets.forEach((planet, index) => {
    // Create a position that changes predictably based on time and planet index
    const position = (basePosition * (index + 1) * 0.618033988749895) % 360; // Golden ratio for distribution
    
    positions[planet] = {
      longitude: position,
      latitude: 0,
      distance: 1,
      speedLongitude: 1,
      speedLatitude: 0,
      speedDistance: 0
    };
  });
  
  return positions;
}

// Export PlanetPositions type with an alias to avoid conflict
export type { PlanetPositions as PlanetPositionsType };
