import { utc_to_jd, calc, houses_ex2, constants, set_ephe_path } from 'sweph';

export interface PlanetPosition {
  planet: string;
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
  house: number;
  sign: string;
  signName: string;
  degree: number;
  minute: number;
  second: number;
  confidence: number;
  isAscendant?: boolean;
}

export interface EphemerisData {
  positions: Record<string, PlanetPosition>;
  source: 'sweph-native';
  timestamp: string;
  calculationDate: Date;
  location: { lat: number; lon: number };
}

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const PLANETS = [
  'SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 
  'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO'
];

function formatCoordinates(longitude: number): {
  sign: string;
  signName: string;
  degree: number;
  minute: number;
  second: number;
} {
  const signIndex = Math.floor(longitude / 30) % 12;
  const sign = ZODIAC_SIGNS[signIndex];
  const degreeInSign = longitude % 30;
  const degree = Math.floor(degreeInSign);
  const minute = Math.floor((degreeInSign - degree) * 60);
  const second = Math.floor(((degreeInSign - degree) * 60 - minute) * 60);

  return {
    sign: sign.toLowerCase(),
    signName: sign,
    degree,
    minute,
    second
  };
}

function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
}

class Ephemeris {
  private static instance: Ephemeris;
  private initialized = false;

  private constructor() {}

  static getInstance(): Ephemeris {
    if (!Ephemeris.instance) {
      Ephemeris.instance = new Ephemeris();
    }
    return Ephemeris.instance;
  }

  private async initializeSweph(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('[EPHEMERIS] Initializing native Swiss Ephemeris...');
      set_ephe_path('./ephe');
      this.initialized = true;
      console.log('[EPHEMERIS] Native Swiss Ephemeris initialized successfully');
    } catch (error) {
      console.error('[EPHEMERIS] Failed to initialize native Swiss Ephemeris:', error);
      throw new Error(`Swiss Ephemeris initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPlanetaryPositions(params: {
    date: Date;
    latitude: number;
    longitude: number;
    includeHouses?: boolean;
  }): Promise<EphemerisData> {
    const { date, latitude, longitude, includeHouses = false } = params;

    try {
      await this.initializeSweph();
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours();
      const minute = date.getMinutes();
      
      const jdResult = utc_to_jd(year, month, day, hour, minute, 0, constants.SE_GREG_CAL);
      if (jdResult.flag !== constants.OK) {
        throw new Error(`Julian Day calculation failed: ${jdResult.error}`);
      }
      const [jd_et, jd_ut] = jdResult.data;
      
      const flags = constants.SEFLG_SWIEPH | constants.SEFLG_SPEED;
      const positions: Record<string, PlanetPosition> = {};
      
      const planetIds = [
        { id: constants.SE_SUN, name: 'SUN' },
        { id: constants.SE_MOON, name: 'MOON' },
        { id: constants.SE_MERCURY, name: 'MERCURY' },
        { id: constants.SE_VENUS, name: 'VENUS' },
        { id: constants.SE_MARS, name: 'MARS' },
        { id: constants.SE_JUPITER, name: 'JUPITER' },
        { id: constants.SE_SATURN, name: 'SATURN' },
        { id: constants.SE_URANUS, name: 'URANUS' },
        { id: constants.SE_NEPTUNE, name: 'NEPTUNE' },
        { id: constants.SE_PLUTO, name: 'PLUTO' }
      ];
      
      for (const planet of planetIds) {
        const result = calc(jd_et, planet.id, flags);
        if (result.flag !== flags) {
          console.error(`Error calculating ${planet.name}: ${result.error}`);
          continue;
        }
        
        const coords = formatCoordinates(result.data[0]);
        positions[planet.name] = {
          planet: planet.name,
          longitude: normalizeAngle(result.data[0]),
          latitude: result.data[1],
          distance: result.data[2],
          speed: result.data[3],
          house: 0,
          sign: coords.sign,
          signName: coords.signName,
          degree: coords.degree,
          minute: coords.minute,
          second: coords.second,
          confidence: 0.99
        };
      }
      
      if (includeHouses) {
        const housesResult = houses_ex2(jd_ut, latitude, longitude, 0, 'P');
        if (housesResult.flag !== constants.OK) {
          console.error(`Error calculating houses: ${housesResult.error}`);
        } else {
          let houseCusps: number[] = [];
          if (housesResult.data && housesResult.data.cusps) {
            houseCusps = housesResult.data.cusps.slice(0, 12);
          } else if (Array.isArray(housesResult.data)) {
            houseCusps = housesResult.data.slice(0, 12);
          } else {
            console.error('Unexpected houses result structure:', housesResult);
            houseCusps = Array(12).fill(0).map((_, i) => i * 30);
          }
          
          for (const planetName of Object.keys(positions)) {
            const planet = positions[planetName];
            for (let i = 0; i < houseCusps.length; i++) {
              const nextHouse = (i + 1) % houseCusps.length;
              const houseCusp = houseCusps[i];
              const nextCusp = houseCusps[nextHouse];
              
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
          }
        }
      }

      return {
        positions,
        source: 'sweph-native',
        timestamp: new Date().toISOString(),
        calculationDate: date,
        location: { lat: latitude, lon: longitude }
      };
      
    } catch (error) {
      console.error('[EPHEMERIS] Failed to calculate positions:', error);
      throw new Error(`Failed to calculate planetary positions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    swissEphemerisAvailable: boolean;
    swephNativeAvailable: boolean;
    environment: 'server' | 'client';
    error?: string;
  }> {
    try {
      const testDate = new Date();
      const testData = await this.getPlanetaryPositions({
        date: testDate,
        latitude: 0,
        longitude: 0,
        includeHouses: false
      });

      const swephNativeAvailable = testData.source === 'sweph-native';
      
      return {
        status: swephNativeAvailable ? 'healthy' : 'unhealthy',
        swissEphemerisAvailable: true,
        swephNativeAvailable,
        environment: typeof window !== 'undefined' ? 'client' : 'server'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        swissEphemerisAvailable: false,
        swephNativeAvailable: false,
        environment: typeof window !== 'undefined' ? 'client' : 'server',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const ephemeris = Ephemeris.getInstance();
export const getPlanetaryPositions = (params: Parameters<Ephemeris['getPlanetaryPositions']>[0]) => 
  ephemeris.getPlanetaryPositions(params);
