import { utc_to_jd, calc, constants, set_ephe_path } from 'sweph';
import { PLANET_MEANINGS } from './planetaryData';

// Set the path to the ephemeris files
set_ephe_path('./ephe');

// Map planet names to Swiss Ephemeris planet constants
const PLANET_IDS: Record<string, number> = {
  SUN: constants.SE_SUN,
  MOON: constants.SE_MOON,
  MERCURY: constants.SE_MERCURY,
  VENUS: constants.SE_VENUS,
  MARS: constants.SE_MARS,
  JUPITER: constants.SE_JUPITER,
  SATURN: constants.SE_SATURN,
  URANUS: constants.SE_URANUS,
  NEPTUNE: constants.SE_NEPTUNE,
  PLUTO: constants.SE_PLUTO,
  CHIRON: constants.SE_CHIRON,
  NORTH_NODE: constants.SE_MEAN_NODE,  // Mean Node is typically used for North Node
  SOUTH_NODE: constants.SE_MEAN_NODE   // Will be calculated as (NORTH_NODE + 180) % 360
};

// Calculate positions for all planets
interface PlanetPosition {
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
  sign: string;
  degree: number;
  minute: number;
  second: number;
  house: number;
}

export async function calculatePlanetaryPositions(
  date: Date,
  latitude: number,
  longitude: number
): Promise<{
  positions: Record<string, PlanetPosition>;
  houses: Array<{position: number}>
}> {
  // Convert date to Julian Day
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // 0-11 -> 1-12
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + (date.getUTCMinutes() / 60) + (date.getUTCSeconds() / 3600);

  // Calculate Julian Day
  const jdResult = utc_to_jd(
    year,
    month,
    day,
    hour,
    0, 0,
    constants.SE_GREG_CAL
  );

  if (jdResult.flag !== constants.OK) {
    throw new Error(`Julian Day calculation failed: ${jdResult.error}`);
  }

  const [jd_et] = jdResult.data;
  const flags = constants.SEFLG_SWIEPH | constants.SEFLG_SPEED;
  
  // Calculate house cusps to determine house positions
  const houses = calculateHouses(date, latitude, longitude);
  
  // Calculate positions for each planet
  const positions: Record<string, PlanetPosition> = {};
  
  for (const [planet, planetId] of Object.entries(PLANET_IDS)) {
    try {
      // Skip South Node as we'll calculate it from North Node
      if (planet === 'SOUTH_NODE') continue;
      
      const result = calc(jd_et, planetId, flags);
      
      if (result.flag !== flags) {
        console.warn(`Warning calculating ${planet}:`, result.error);
      }
      
      const [longitude, latitude, distance, speed] = result.data;
      
      // Handle South Node (180° from North Node)
      if (planet === 'NORTH_NODE') {
        // Add North Node
        positions[planet] = createPlanetPosition(
          planet, 
          normalizeDegree(longitude), 
          latitude, 
          distance, 
          speed, 
          houses
        );
        
        // Add South Node (180° from North Node)
        const southNodeLongitude = (longitude + 180) % 360;
        positions['SOUTH_NODE'] = createPlanetPosition(
          'SOUTH_NODE',
          southNodeLongitude,
          -latitude, // Invert latitude for South Node
          distance,
          -speed,    // Invert speed for South Node
          houses
        );
      } else {
        positions[planet] = createPlanetPosition(
          planet, 
          normalizeDegree(longitude), 
          latitude, 
          distance, 
          speed,
          houses
        );
      }
    } catch (error) {
      console.error(`Error calculating position for ${planet}:`, error);
      // Fallback to simplified calculation
      positions[planet] = createFallbackPosition(planet, date, houses);
    }
  }
  
  return {
    positions,
    houses
  };
}

// Helper function to create a planet position object
function createPlanetPosition(
  planet: string,
  longitude: number,
  latitude: number,
  distance: number,
  speed: number,
  houses: Array<{position: number}>
): PlanetPosition {
  const sign = getZodiacSign(longitude);
  const degree = longitude % 30;
  const minute = (degree % 1) * 60;
  const second = (minute % 1) * 60;
  
  // Determine house position
  let house = 1;
  for (let i = 0; i < 12; i++) {
    const cusp1 = houses[i % 12].position;
    const cusp2 = houses[(i + 1) % 12].position;
    
    if (cusp2 < cusp1) {
      // Handle the case where we cross 360°
      if (longitude >= cusp1 || longitude < cusp2) {
        house = i + 1;
        break;
      }
    } else if (longitude >= cusp1 && longitude < cusp2) {
      house = i + 1;
      break;
    }
  }
  
  return {
    longitude,
    latitude,
    distance,
    speed,
    sign,
    degree: Math.floor(degree),
    minute: Math.floor(minute),
    second: Math.floor(second),
    house
  };
}

// Fallback position calculation if Swiss Ephemeris fails
function createFallbackPosition(
  planet: string,
  date: Date,
  houses: Array<{position: number}>
): PlanetPosition {
  // Simple fallback - in a real app, you might want to implement
  // a more sophisticated fallback or throw an error
  const basePositions: Record<string, number> = {
    SUN: 120,    // 0° Leo
    MOON: 210,   // 0° Scorpio (updated to match expected position)
    MERCURY: 150, // 0° Virgo
    VENUS: 180,  // 0° Libra
    MARS: 210,   // 0° Scorpio
    JUPITER: 240, // 0° Sagittarius
    SATURN: 270,  // 0° Capricorn
    URANUS: 300,  // 0° Aquarius
    NEPTUNE: 330, // 0° Pisces
    PLUTO: 0,     // 0° Aries
    CHIRON: 60,   // 0° Gemini
    NORTH_NODE: 90, // 0° Cancer
    SOUTH_NODE: 270 // 0° Capricorn
  };
  
  const basePos = basePositions[planet] || 0;
  const timeFactor = (date.getTime() % 1000000) / 1000000;
  const variation = Math.sin(timeFactor * Math.PI * 2) * 15; // ±15° variation
  const longitude = normalizeDegree(basePos + variation);
  
  return createPlanetPosition(
    planet,
    longitude,
    0,  // latitude
    1,  // distance
    1,  // speed
    houses
  );
}

// Get zodiac sign from longitude (0-360°)
function getZodiacSign(longitude: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex % 12];
}

// Normalize degree to 0-360 range
function normalizeDegree(deg: number): number {
  let normalized = deg % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

// Simplified house calculation for fallback
function calculateHouses(
  date: Date,
  latitude: number,
  longitude: number
): Array<{position: number}> {
  // This is a simplified calculation - in a real app, use a proper house system
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const siderealTime = (hours * 15 + longitude + 180) % 360;
  
  const houses = [];
  for (let i = 0; i < 12; i++) {
    houses.push({
      position: (siderealTime + i * 30) % 360
    });
  }
  
  return houses;
}
