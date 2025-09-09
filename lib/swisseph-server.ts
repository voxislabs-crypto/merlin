import path from 'path';

// Import types from ephemeris.ts
import type {
  PlanetKey,
  PlanetPosition,
  AspectData,
  EphemerisResult
} from './ephemeris.js';

// Internal types
interface SwissEphemerisExtended {
  swe_julday: (year: number, month: number, day: number, hour: number, gregflag: number) => number;
  swe_calc_ut: (jd: number, ipl: number, iflag: number) => { error: string } | { data: number[] };
  swe_houses: (jd: number, lat: number, lon: number, hsys: string) => { houses: number[]; ascendant: number; mc: number };
  swe_set_ephe_path: (path: string) => void;
  
  // Constants
  SE_SUN: number;
  SE_MOON: number;
  SE_MERCURY: number;
  SE_VENUS: number;
  SE_MARS: number;
  SE_JUPITER: number;
  SE_SATURN: number;
  SE_URANUS: number;
  SE_NEPTUNE: number;
  SE_PLUTO: number;
  SEFLG_SWIEPH: number;
  SEFLG_SPEED: number;
  SE_GREG_CAL: number;
  SE_NSIDM_PREDEF: number;
}

// Mock implementation for when Swiss Ephemeris isn't available
class MockEphemeris {
  private static instance: MockEphemeris;
  
  static getInstance(): MockEphemeris {
    if (!MockEphemeris.instance) {
      MockEphemeris.instance = new MockEphemeris();
    }
    return MockEphemeris.instance;
  }

  async getPlanetPosition(planet: PlanetKey, date: Date, lat: number, lon: number): Promise<PlanetPosition> {
    console.warn('⚠️ Using mock ephemeris — Swiss Ephemeris unavailable');
    // Simple mock implementation
    return {
      planet,
      longitude: Math.random() * 360,
      latitude: 0,
      distance: 1,
      speed: 1,
      house: Math.floor(Math.random() * 12) + 1,
      sign: Math.floor(Math.random() * 12),
      signName: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][Math.floor(Math.random() * 12)],
      degree: Math.floor(Math.random() * 30),
      minute: Math.floor(Math.random() * 60),
      second: Math.floor(Math.random() * 60),
      isMock: true,
      confidence: 0.5
    } as PlanetPosition;
  }

  async getAllPositions(date: Date, lat: number, lon: number): Promise<Record<PlanetKey, PlanetPosition>> {
    const planets: PlanetKey[] = [
      'SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 
      'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO'
    ] as PlanetKey[];
    const positions = {} as Record<PlanetKey, PlanetPosition>;
    
    for (const planet of planets) {
      positions[planet] = await this.getPlanetPosition(planet, date, lat, lon);
    }
    
    return positions;
  }
}

// Real Swiss Ephemeris implementation
class RealEphemeris {
  private static instance: RealEphemeris;
  private swisseph: any;
  private isInitialized = false;

  private constructor() {
    try {
      this.swisseph = require('swisseph');
      const ephePath = path.join(process.cwd(), 'node_modules', 'swisseph', 'ephe');
      this.swisseph.swe_set_ephe_path(ephePath);
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Swiss Ephemeris:', error);
      this.isInitialized = false;
    }
  }

  static getInstance(): RealEphemeris | null {
    if (typeof window !== 'undefined') {
      return null; // Don't try to use real ephemeris in the browser
    }
    
    if (!RealEphemeris.instance) {
      RealEphemeris.instance = new RealEphemeris();
    }
    return RealEphemeris.instance.isInitialized ? RealEphemeris.instance : null;
  }

  async getPlanetPosition(planet: PlanetKey, date: Date, lat: number, lon: number): Promise<PlanetPosition> {
    if (!this.isInitialized) {
      throw new Error('Swiss Ephemeris not initialized');
    }

    // Convert planet name to Swiss Ephemeris constant
    const planetMap: Record<string, number> = {
      'SUN': 0, 'MOON': 1, 'MERCURY': 2, 'VENUS': 3, 'MARS': 4,
      'JUPITER': 5, 'SATURN': 6, 'URANUS': 7, 'NEPTUNE': 8, 'PLUTO': 9
    };

    const planetId = planetMap[planet.toUpperCase()];
    if (planetId === undefined) {
      throw new Error(`Unknown planet: ${planet}`);
    }

    // Convert date to Julian Day
    const jd = this.swisseph.swe_julday(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      date.getUTCHours() + (date.getUTCMinutes() / 60) + (date.getUTCSeconds() / 3600),
      this.swisseph.SE_GREG_CAL
    );

    // Calculate planet position
    const result = this.swisseph.swe_calc_ut(
      jd,
      planetId,
      this.swisseph.SEFLG_SWIEPH | this.swisseph.SEFLG_SPEED
    );

    if (result.error) {
      throw new Error(`Swiss Ephemeris error: ${result.error}`);
    }

    const [longitude, latitude, distance, speed] = result.data;
    
    // Calculate house positions
    const houses = this.swisseph.swe_houses(
      jd,
      lat,
      lon,
      'P' // Placidus house system
    );

    // Find which house the planet is in
    let house = 1;
    for (let i = 1; i <= 12; i++) {
      if (longitude >= houses.houses[i] && longitude < (houses.houses[i + 1] || houses.houses[1] + 360)) {
        house = i;
        break;
      }
    }

    // Calculate sign and degree
    const sign = Math.floor(longitude / 30);
    const degree = longitude % 30;
    const minute = (degree - Math.floor(degree)) * 60;
    const second = (minute - Math.floor(minute)) * 60;

    const signNames = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    return {
      planet,
      longitude,
      latitude,
      distance,
      speed,
      house,
      sign,
      signName: signNames[sign % 12],
      degree: Math.floor(degree),
      minute: Math.floor(minute),
      second: Math.floor(second),
      isMock: false,
      confidence: 0.95
    };
  }

  async getAllPositions(date: Date, lat: number, lon: number): Promise<Record<PlanetKey, PlanetPosition>> {
    const planets: PlanetKey[] = [
      'SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 
      'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO'
    ] as PlanetKey[];
    const positions = {} as Record<PlanetKey, PlanetPosition>;
    
    for (const planet of planets) {
      positions[planet] = await this.getPlanetPosition(planet, date, lat, lon);
    }
    
    return positions;
  }
}

// Public API
export async function getPlanetPosition(planet: PlanetKey, date: Date, lat: number, lon: number): Promise<PlanetPosition> {
  const ephemeris = RealEphemeris.getInstance() || MockEphemeris.getInstance();
  return ephemeris.getPlanetPosition(planet, date, lat, lon);
}

export async function getAllPositions(date: Date, lat: number, lon: number): Promise<Record<PlanetKey, PlanetPosition>> {
  const ephemeris = RealEphemeris.getInstance() || MockEphemeris.getInstance();
  return ephemeris.getAllPositions(date, lat, lon);
}

export async function getEphemerisData(date: Date, lat: number, lon: number, timezone: string): Promise<EphemerisResult> {
  const ephemeris = RealEphemeris.getInstance() || MockEphemeris.getInstance();
  
  const positions = await ephemeris.getAllPositions(date, lat, lon);
  
  // Get houses and angles
  const jd = ephemeris instanceof RealEphemeris 
    ? ephemeris['swisseph'].swe_julday(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        date.getUTCHours() + (date.getUTCMinutes() / 60) + (date.getUTCSeconds() / 3600),
        ephemeris['swisseph'].SE_GREG_CAL
      )
    : Date.now();
  
  const houses = ephemeris instanceof RealEphemeris 
    ? Array.from({ length: 12 }, (_, i) => ephemeris['swisseph'].swe_houses(jd, lat, lon, 'P').houses[i + 1])
    : Array.from({ length: 12 }, (_, i) => (i * 30) + 15); // Mock houses at 15° of each sign
  
  // Create empty aspects array (to be implemented)
  const aspects: AspectData[] = [];
  
  return {
    positions,
    aspects, // Include empty aspects array
    houses,
    ascendant: houses[0],
    midheaven: houses[9], // 10th house cusp is midheaven
    timestamp: date,
    location: { lat, lon },
    timezone
  };
}

// Export type guards for type safety
export function isMockPosition(position: PlanetPosition): position is PlanetPosition & { isMock: true } {
  return position.isMock === true;
}

export function isRealPosition(position: PlanetPosition): position is PlanetPosition & { isMock: false } {
  return position.isMock === false;
}
