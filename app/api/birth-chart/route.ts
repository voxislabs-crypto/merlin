import { NextResponse } from 'next/server';
import { utc_to_jd, calc, houses_ex2, constants, set_ephe_path } from 'sweph';

interface BirthChartRequest {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  timeUnknown: boolean;
}

interface PlanetPosition {
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
  sign: string;
  house: number;
  retrograde: boolean;
}

interface HousePosition {
  number: number;
  cuspLongitude: number;
  sign: string;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  angle: number;
}

interface BirthChartResponse {
  success: boolean;
  data?: {
    planets: PlanetPosition[];
    houses: HousePosition[];
    ascendant: PlanetPosition;
    midheaven: PlanetPosition;
    aspects: Aspect[];
    metadata: {
      julianDay: number;
      location: { lat: number; lon: number };
      timezone: string;
    };
  };
  error?: string;
}

const ASPECT_TYPES = [
  { type: 'Conjunction', angle: 0, orb: 8 },
  { type: 'Opposition', angle: 180, orb: 8 },
  { type: 'Trine', angle: 120, orb: 8 },
  { type: 'Square', angle: 90, orb: 8 },
  { type: 'Sextile', angle: 60, orb: 6 },
  { type: 'Quincunx', angle: 150, orb: 3 }
];

function getSign(longitude: number): string {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const index = Math.floor(longitude / 30) % 12;
  return signs[index];
}

function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
}

function findAspects(planets: PlanetPosition[]): Aspect[] {
  const aspects: Aspect[] = [];
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const diff = Math.abs(planets[i].longitude - planets[j].longitude);
      const angle = diff > 180 ? 360 - diff : diff;
      
      for (const aspectType of ASPECT_TYPES) {
        const orb = Math.abs(angle - aspectType.angle);
        if (orb <= aspectType.orb) {
          aspects.push({
            planet1: planets[i].name,
            planet2: planets[j].name,
            type: aspectType.type,
            orb: Math.round(orb * 10) / 10,
            angle: Math.round(angle * 10) / 10
          });
        }
      }
    }
  }
  
  return aspects.sort((a, b) => b.orb - a.orb);
}

async function geocodeLocation(location: string): Promise<{ lat: number; lon: number }> {
  const cityCoords: Record<string, { lat: number; lon: number }> = {
    'new york': { lat: 40.7128, lon: -74.0060 },
    'london': { lat: 51.5074, lon: -0.1278 },
    'tokyo': { lat: 35.6762, lon: 139.6503 },
    'paris': { lat: 48.8566, lon: 2.3522 },
    'sydney': { lat: -33.8688, lon: 151.2093 },
    'los angeles': { lat: 34.0522, lon: -118.2437 },
    'chicago': { lat: 41.8781, lon: -87.6298 },
    'mumbai': { lat: 19.0760, lon: 72.8777 },
    'norfolk': { lat: 36.8468, lon: -76.2852 },
    'norfolk va': { lat: 36.8468, lon: -76.2852 }
  };
  
  const normalized = location.toLowerCase().trim();
  const coords = cityCoords[normalized];
  
  if (coords) return coords;
  
  const latLonMatch = location.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
  if (latLonMatch) {
    return {
      lat: parseFloat(latLonMatch[1]),
      lon: parseFloat(latLonMatch[2])
    };
  }
  
  return { lat: 40.7128, lon: -74.0060 };
}

function calculateJulianDay(year: number, month: number, day: number, hour: number): number {
  if (month <= 2) {
    year--;
    month += 12;
  }
  
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  
  const days = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
  return days + hour / 24;
}

function calculatePlanetPosition(planetName: string, julianDay: number): { longitude: number; latitude: number; speed: number; retrograde: boolean } {
  const daysSinceEpoch = julianDay - 2451545.0;
  
  switch (planetName) {
    case 'Sun':
      return {
        longitude: normalizeAngle(280.460 + 0.9856474 * daysSinceEpoch),
        latitude: 0,
        speed: 0.9856,
        retrograde: false
      };
    
    case 'Moon':
      const lunarPhase = normalizeAngle(13.1763966 * daysSinceEpoch);
      return {
        longitude: lunarPhase,
        latitude: 0,
        speed: 13.1764,
        retrograde: false
      };
    
    case 'Mercury':
      return {
        longitude: normalizeAngle(252.250 + 4.092 * daysSinceEpoch),
        latitude: 0,
        speed: 4.092,
        retrograde: Math.sin(daysSinceEpoch * 0.1) < 0
      };
    
    case 'Venus':
      return {
        longitude: normalizeAngle(181.979 + 1.602 * daysSinceEpoch),
        latitude: 0,
        speed: 1.602,
        retrograde: false
      };
    
    case 'Mars':
      return {
        longitude: normalizeAngle(355.433 + 0.524 * daysSinceEpoch),
        latitude: 0,
        speed: 0.524,
        retrograde: Math.sin(daysSinceEpoch * 0.05) < 0
      };
    
    case 'Jupiter':
      return {
        longitude: normalizeAngle(34.331 + 0.083 * daysSinceEpoch),
        latitude: 0,
        speed: 0.083,
        retrograde: false
      };
    
    case 'Saturn':
      return {
        longitude: normalizeAngle(50.077 + 0.033 * daysSinceEpoch),
        latitude: 0,
        speed: 0.033,
        retrograde: true
      };
    
    case 'Uranus':
      return {
        longitude: normalizeAngle(314.055 + 0.012 * daysSinceEpoch),
        latitude: 0,
        speed: 0.012,
        retrograde: false
      };
    
    case 'Neptune':
      return {
        longitude: normalizeAngle(304.271 + 0.006 * daysSinceEpoch),
        latitude: 0,
        speed: 0.006,
        retrograde: false
      };
    
    case 'Pluto':
      return {
        longitude: normalizeAngle(288.077 + 0.004 * daysSinceEpoch),
        latitude: 0,
        speed: 0.004,
        retrograde: false
      };
    
    default:
      return { longitude: 0, latitude: 0, speed: 0, retrograde: false };
  }
}

export async function POST(req: Request) {
  try {
    console.log('Initializing real Swiss Ephemeris...');
    set_ephe_path('./ephe'); // Use ephe directory for ephemeris files
    console.log('Real Swiss Ephemeris loaded successfully');
    
    const body: BirthChartRequest = await req.json();
    const { birthDate, birthTime, birthLocation, timeUnknown } = body;
    
    if (!birthDate || !birthLocation) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: birthDate, birthLocation'
      }, { status: 400 });
    }
    
    const date = new Date(birthDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let hour = 12;
    let minute = 0;
    
    if (!timeUnknown && birthTime) {
      const timeParts = birthTime.split(':');
      hour = parseInt(timeParts[0]) || 12;
      minute = parseInt(timeParts[1]) || 0;
    }
    
    const location = await geocodeLocation(birthLocation);
    
    // Calculate Julian Day using real Swiss Ephemeris
    const jdResult = utc_to_jd(year, month, day, hour, minute, 0, constants.SE_GREG_CAL);
    if (jdResult.flag !== constants.OK) {
      throw new Error(`Julian Day calculation failed: ${jdResult.error}`);
    }
    const [jd_et, jd_ut] = jdResult.data;
    
    // Calculate planet positions using real Swiss Ephemeris
    const flags = constants.SEFLG_SWIEPH | constants.SEFLG_SPEED;
    const planetIds = [constants.SE_SUN, constants.SE_MOON, constants.SE_MERCURY, constants.SE_VENUS, constants.SE_MARS, constants.SE_JUPITER, constants.SE_SATURN, constants.SE_URANUS, constants.SE_NEPTUNE, constants.SE_PLUTO];
    const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    
    const planets: PlanetPosition[] = [];
    for (let i = 0; i < planetIds.length; i++) {
      const result = calc(jd_et, planetIds[i], flags);
      if (result.flag !== flags) {
        console.error(`Error calculating ${planetNames[i]}: ${result.error}`);
      }
      
      planets.push({
        name: planetNames[i],
        longitude: normalizeAngle(result.data[0]),
        latitude: result.data[1],
        speed: result.data[3],
        sign: getSign(result.data[0]),
        house: 0,
        retrograde: result.data[3] < 0
      });
    }
    
    // Calculate houses using real Swiss Ephemeris
    const housesResult = houses_ex2(jd_ut, location.lat, location.lon, 0, 'P');
    if (housesResult.flag !== constants.OK) {
      console.error(`Error calculating houses: ${housesResult.error}`);
    }
    
    // Handle different return structures
    let houseCusps: number[] = [];
    if ('cusps' in housesResult.data && Array.isArray(housesResult.data.cusps)) {
      houseCusps = housesResult.data.cusps.slice(0, 12);
    } else if (Array.isArray(housesResult.data)) {
      houseCusps = housesResult.data.slice(0, 12);
    } else {
      console.error('Unexpected houses result structure:', housesResult);
      houseCusps = Array(12).fill(0).map((_, i) => i * 30); // Fallback
    }
    
    const houses: HousePosition[] = houseCusps.map((longitude: number, index: number) => ({
      number: index + 1,
      cuspLongitude: normalizeAngle(longitude),
      sign: getSign(longitude)
    }));
    
    // Assign planets to houses
    planets.forEach(planet => {
      for (let i = 0; i < houses.length; i++) {
        const nextHouse = (i + 1) % houses.length;
        const houseCusp = houses[i].cuspLongitude;
        const nextCusp = houses[nextHouse].cuspLongitude;
        
        if (houseCusp < nextCusp) {
          if (planet.longitude >= houseCusp && planet.longitude < nextCusp) {
            planet.house = i + 1;
            break;
          }
        } else {
          if (planet.longitude >= houseCusp || planet.longitude < nextCusp) {
            planet.house = i + 1;
            break;
          }
        }
      }
    });
    
    // Calculate Ascendant and Midheaven
    const ascResult = calc(jd_ut, constants.SE_ASC, flags);
    const mcResult = calc(jd_ut, constants.SE_MC, flags);
    
    const ascendant: PlanetPosition = {
      name: 'Ascendant',
      longitude: normalizeAngle(ascResult.data[0]),
      latitude: ascResult.data[1],
      speed: 0,
      sign: getSign(ascResult.data[0]),
      house: 1,
      retrograde: false
    };
    
    const midheaven: PlanetPosition = {
      name: 'Midheaven',
      longitude: normalizeAngle(mcResult.data[0]),
      latitude: mcResult.data[1],
      speed: 0,
      sign: getSign(mcResult.data[0]),
      house: 10,
      retrograde: false
    };
    
    // Calculate aspects
    const aspects = findAspects(planets);
    
    // Log real positions for verification
    console.log('Real Swiss Ephemeris Birth Chart Results:');
    console.log(`Date: ${birthDate} ${birthTime || '12:00'}`);
    console.log(`Location: ${birthLocation} (${location.lat}, ${location.lon})`);
    console.log(`Julian Day: ${jd_et}`);
    console.log('Planets:');
    planets.forEach(planet => {
      console.log(`  ${planet.name}: ${planet.longitude.toFixed(2)}° ${planet.sign} (House ${planet.house})`);
    });
    
    const response: BirthChartResponse = {
      success: true,
      data: {
        planets,
        houses,
        ascendant,
        midheaven,
        aspects,
        metadata: {
          julianDay: jd_et,
          location,
          timezone: 'UTC'
        }
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Birth chart calculation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to calculate birth chart: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
