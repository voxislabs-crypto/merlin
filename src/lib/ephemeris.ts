// Ephemeris Implementation - sweph-wasm integration
// Clean, modern implementation using sweph-wasm for accurate calculations

import SwissEPH from 'sweph-wasm';

// Initialize sweph-wasm module
let swephInstance: SwissEPH | null = null;
let initPromise: Promise<SwissEPH> | null = null;

// Cache for performance optimization
interface CacheEntry {
  data: EphemerisData;
  timestamp: number;
  key: string;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100; // Maximum number of cached entries

// Performance metrics
let cacheHits = 0;
let cacheMisses = 0;

// Planet constants for sweph-wasm
let SE_SUN = 0;
let SE_MOON = 1;
let SE_MERCURY = 2;
let SE_VENUS = 3;
let SE_MARS = 4;
let SE_JUPITER = 5;
let SE_SATURN = 6;
let SE_URANUS = 7;
let SE_NEPTUNE = 8;
let SE_PLUTO = 9;
let SE_MEAN_NODE = 10;
let SE_TRUE_NODE = 11;
let SEFLG_SWIEPH = 2;
let SE_GREG_CAL = 1;

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
  confidence: number;
  orb?: number;
  isAscendant?: boolean;
  ascendant?: number; // Ascendant degree reference
  mc?: number; // Midheaven degree reference
}

export interface EphemerisData {
  positions: Record<string, PlanetPosition>;
  timestamp: Date;
  location: { lat: number; lon: number };
  source: 'sweph-wasm';
  metadata?: {
    calculationTime: number;
    julianDay: number;
    timezone: string;
    timezoneInfo?: {
      originalTimezone: string;
      utcTime: Date;
      localTime: Date;
      offset: number;
      isDST: boolean;
    };
  };
}

export interface EphemerisOptions {
  date?: Date;
  latitude?: number;
  longitude?: number;
  includeHouses?: boolean;
  includeAspects?: boolean;
  zodiacType?: 'tropical' | 'sidereal';
  houseSystem?: 'placidus' | 'koch' | 'equal' | 'whole-sign';
  timezone?: string;
}

// Constants
export const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
] as const;

export const ZODIAC_EMOJIS = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
  'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
  'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
} as const;

export const PLANETS: PlanetKey[] = [
  'SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS',
  'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO'
];

// Utility functions for caching
function generateCacheKey(options: EphemerisOptions): string {
  const date = options.date || new Date();
  const roundedLat = Math.round((options.latitude || 0) * 100) / 100;
  const roundedLon = Math.round((options.longitude || 0) * 100) / 100;
  
  return `${date.getTime()}-${roundedLat}-${roundedLon}-${Boolean(options.includeHouses)}-${Boolean(options.includeAspects)}`;
}

function cleanCache(): void {
  const now = Date.now();
  
  // Remove expired entries
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
  
  // Remove oldest entries if cache is too large
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toDelete = entries.slice(0, cache.size - MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => cache.delete(key));
  }
}

function getFromCache(key: string): EphemerisData | null {
  cleanCache();
  
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    cacheHits++;
    return entry.data;
  }
  
  cacheMisses++;
  return null;
}

function setCache(key: string, data: EphemerisData): void {
  cleanCache();
  
  cache.set(key, {
    data,
    timestamp: Date.now(),
    key
  });
}

export function getCacheMetrics(): { hits: number; misses: number; size: number; hitRate: number } {
  const total = cacheHits + cacheMisses;
  return {
    hits: cacheHits,
    misses: cacheMisses,
    size: cache.size,
    hitRate: total > 0 ? Math.round((cacheHits / total) * 100) : 0
  };
}

export function clearCache(): void {
  cache.clear();
  cacheHits = 0;
  cacheMisses = 0;
}

// Utility Functions
export function getSignEmoji(signName: string): string {
  return ZODIAC_EMOJIS[signName as keyof typeof ZODIAC_EMOJIS] || '';
}

export function formatCoordinates(longitude: number): {
  sign: number;
  signName: string;
  degree: number;
  minute: number;
  second: number;
} {
  const sign = Math.floor(longitude / 30) % 12;
  const signDegree = longitude % 30;
  const degree = Math.floor(signDegree);
  const minute = Math.floor((signDegree - degree) * 60);
  const second = Math.floor((((signDegree - degree) * 60 - minute) * 60));
  
  return {
    sign,
    signName: ZODIAC_SIGNS[sign],
    degree,
    minute,
    second
  };
}

export function toDegreesMinutesSeconds(decimalDegrees: number): string {
  const { degree, minute, second, signName } = formatCoordinates(decimalDegrees);
  return `${degree}°${minute}'${second}" ${signName}`;
}

// Main Ephemeris Class
export class Ephemeris {
  private static instance: Ephemeris;
  private isServer: boolean;

  private constructor() {
    this.isServer = typeof window === 'undefined';
  }

  static getInstance(): Ephemeris {
    if (!Ephemeris.instance) {
      Ephemeris.instance = new Ephemeris();
    }
    return Ephemeris.instance;
  }

  /**
   * Initialize sweph-wasm module with better error handling
   */
  private async initializeSweph(): Promise<SwissEPH> {
    if (swephInstance) return swephInstance;
    
    if (!initPromise) {
      initPromise = (async () => {
        try {
          console.log('[EPHEMERIS] Initializing sweph-wasm...');
          
          // Initialize the WASM module with timeout
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('sweph-wasm initialization timeout')), 10000);
          });
          
          const instance = await Promise.race([SwissEPH.init(), timeoutPromise]);
          
          // Set constants from the instance
          SE_SUN = instance.SE_SUN;
          SE_MOON = instance.SE_MOON;
          SE_MERCURY = instance.SE_MERCURY;
          SE_VENUS = instance.SE_VENUS;
          SE_MARS = instance.SE_MARS;
          SE_JUPITER = instance.SE_JUPITER;
          SE_SATURN = instance.SE_SATURN;
          SE_URANUS = instance.SE_URANUS;
          SE_NEPTUNE = instance.SE_NEPTUNE;
          SE_PLUTO = instance.SE_PLUTO;
          SE_MEAN_NODE = instance.SE_MEAN_NODE;
          SE_TRUE_NODE = instance.SE_TRUE_NODE;
          SEFLG_SWIEPH = instance.SEFLG_SWIEPH;
          SE_GREG_CAL = instance.SE_GREG_CAL;
          
          swephInstance = instance;
          console.log('[EPHEMERIS] sweph-wasm initialized successfully');
          return instance;
        } catch (error) {
          console.error('[EPHEMERIS] Failed to initialize sweph-wasm:', error);
          
          // Provide more specific error messages
          if (error instanceof Error) {
            if (error.message.includes('timeout')) {
              throw new Error('sweph-wasm initialization timed out. Check your network connection.');
            } else if (error.message.includes('WASM')) {
              throw new Error('WASM module failed to load. Your browser/environment may not support WASM.');
            } else {
              throw new Error(`sweph-wasm initialization failed: ${error.message}`);
            }
          } else {
            throw new Error('Unknown error during sweph-wasm initialization');
          }
        }
      })();
    }
    
    return initPromise;
  }

  /**
   * Get planetary positions for a given date and location
   */
  async getPlanetaryPositions(options: EphemerisOptions = {}): Promise<EphemerisData> {
    const {
      date = new Date(),
      latitude = 40.7128, // Default: New York
      longitude = -74.0060,
      includeHouses = true,
      includeAspects = false,
      timezone
    } = options;

    // Handle timezone conversion
    let calculationDate = date;
    let timezoneInfo;
    
    if (timezone) {
      try {
        // Import timezone utilities dynamically to avoid circular dependencies
        const { convertToUTC } = await import('../../lib/timezone');
        const result = convertToUTC(date, timezone);
        calculationDate = result.utcDate;
        timezoneInfo = {
          originalTimezone: timezone,
          utcTime: result.utcDate,
          localTime: result.localTime,
          offset: result.timezoneInfo.offset,
          isDST: result.timezoneInfo.isDST
        };
        console.log('[EPHEMERIS] Timezone conversion:', timezone, '-> UTC', result.timezoneInfo.offset);
      } catch (error) {
        console.warn('[EPHEMERIS] Timezone conversion failed, using local time:', error);
        calculationDate = date;
      }
    }

    // Check cache first
    const cacheKey = generateCacheKey({ ...options, date: calculationDate });
    const cachedResult = getFromCache(cacheKey);
    if (cachedResult) {
      console.log('[EPHEMERIS] Cache hit for', cacheKey);
      return cachedResult;
    }

    const startTime = performance.now();
    
    try {
      // Use sweph-wasm directly (no mock fallback)
      const sweph = await this.initializeSweph();
      const positions = await this.getSwephWasmData(calculationDate, latitude, longitude, sweph);
      const source = 'sweph-wasm';

      // Calculate houses if requested
      if (includeHouses) {
        positions = this.calculateHouses(positions, latitude, longitude, calculationDate);
      }

      const calculationTime = performance.now() - startTime;

      const result: EphemerisData = {
        positions,
        timestamp: calculationDate,
        location: { lat: latitude, lon: longitude },
        source,
        metadata: {
          calculationTime,
          julianDay: this.toJulianDay(calculationDate, sweph),
          timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          timezoneInfo
        }
      };

      // Cache the result
      setCache(cacheKey, result);
      console.log('[EPHEMERIS] Calculation complete for', cacheKey, '- took', calculationTime.toFixed(2), 'ms');

      return result;

    } catch (error) {
      console.error('[EPHEMERIS] Failed to calculate planetary positions:', error);
      throw new Error(`Failed to calculate planetary positions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get data from sweph-wasm (works on both server and client)
   */
  private async getSwephWasmData(
    date: Date,
    latitude: number,
    longitude: number,
    sweph: SwissEPH
  ): Promise<Record<string, PlanetPosition>> {
    try {
      const julianDay = this.toJulianDay(date, sweph);
      const positions: Record<string, PlanetPosition> = {};
      
      // Define planets with their sweph-wasm constants
      const planets = [
        { name: 'SUN', number: SE_SUN },
        { name: 'MOON', number: SE_MOON },
        { name: 'MERCURY', number: SE_MERCURY },
        { name: 'VENUS', number: SE_VENUS },
        { name: 'MARS', number: SE_MARS },
        { name: 'JUPITER', number: SE_JUPITER },
        { name: 'SATURN', number: SE_SATURN },
        { name: 'URANUS', number: SE_URANUS },
        { name: 'NEPTUNE', number: SE_NEPTUNE },
        { name: 'PLUTO', number: SE_PLUTO }
      ];
      
      // Calculate positions for each planet
      for (const planet of planets) {
        try {
          const result = sweph.swe_calc_ut(julianDay, planet.number, SEFLG_SWIEPH);
          
          if (result && result.length >= 6) {
            const longitude = result[0];
            const latitude = result[1];
            const distance = result[2];
            const speedLongitude = result[3];
            
            const coords = formatCoordinates(longitude);
            
            positions[planet.name] = {
              planet: planet.name,
              longitude,
              latitude,
              distance,
              speed: speedLongitude,
              house: 0, // Will be calculated separately
              sign: coords.sign,
              signName: coords.signName,
              degree: coords.degree,
              minute: coords.minute,
              second: coords.second,
              confidence: 0.99, // sweph-wasm is highly accurate
              isAscendant: false,
              ascendant: undefined,
              mc: undefined
            };
          } else {
            throw new Error('Invalid result from swe_calc_ut');
          }
        } catch (error) {
          console.error(`[EPHEMERIS] Error calculating position for ${planet.name}:`, error);
          throw error;
        }
      }

      return positions;
    } catch (error) {
      console.error('[EPHEMERIS] Failed to calculate positions with sweph-wasm:', error);
      throw new Error(`sweph-wasm calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate house positions using sweph-wasm with accurate ascendant
   */
  private calculateHouses(
    positions: Record<string, PlanetPosition>,
    latitude: number,
    longitude: number,
    date: Date
  ): Record<string, PlanetPosition> {
    if (!swephInstance) {
      console.warn('[EPHEMERIS] sweph-wasm not initialized, using simplified house calculation');
      return this.calculateHousesSimple(positions, latitude, longitude, date);
    }

    try {
      const julianDay = this.toJulianDay(date, swephInstance);
      
      // Use swe_houses_ex for accurate house and ascendant calculation
      const houseResult = swephInstance.swe_houses_ex(
        julianDay,
        latitude,
        longitude,
        'P' // Placidus house system
      );
      
      if (houseResult && houseResult.length >= 13) {
        // houseResult contains: [cusps[], ascendant, mc, armc, vertex, equatorialAscendant, ...]
        const houses = houseResult[0]; // Array of house cusps
        const ascendant = houseResult[1]; // Actual ascendant from swe_houses_ex
        const mc = houseResult[2]; // Midheaven
        
        // Update ascendant position if we have SUN data (for reference)
        if (positions.SUN) {
          // Store the accurate ascendant as a special position or update metadata
          positions.SUN.ascendant = ascendant; // Add ascendant as reference
          positions.SUN.mc = mc; // Add midheaven as reference
        }
        
        // Assign houses to planets based on their longitude
        for (const [planet, position] of Object.entries(positions)) {
          let houseNumber = 1;
          
          for (let i = 0; i < houses.length - 1; i++) {
            const cusp1 = houses[i];
            const cusp2 = houses[(i + 1) % houses.length];
            
            // Handle wrap-around at 360°
            let adjustedCusp1 = cusp1;
            let adjustedCusp2 = cusp2;
            let adjustedLongitude = position.longitude;
            
            if (cusp2 < cusp1) {
              // House cusp wraps around 360°
              if (position.longitude >= cusp1 || position.longitude < cusp2) {
                houseNumber = i + 1;
                break;
              }
            } else {
              // Normal case
              if (position.longitude >= cusp1 && position.longitude < cusp2) {
                houseNumber = i + 1;
                break;
              }
            }
          }
          
          position.house = houseNumber;
          
          // Special handling for ascendant - if this planet is close to ascendant degree
          const ascendantDiff = Math.abs(position.longitude - ascendant);
          if (ascendantDiff < 2) { // Within 2 degrees of ascendant
            position.isAscendant = true;
          }
        }
        
        // Add ascendant as a special "planet" for easy access
        const ascendantCoords = formatCoordinates(ascendant);
        positions.ASCENDANT = {
          planet: 'ASCENDANT',
          longitude: ascendant,
          latitude: 0,
          distance: 0,
          speed: 0,
          house: 1, // Ascendant is always in 1st house
          sign: ascendantCoords.sign,
          signName: ascendantCoords.signName,
          degree: ascendantCoords.degree,
          minute: ascendantCoords.minute,
          second: ascendantCoords.second,
          confidence: 0.99,
          isAscendant: true
        };
        
        console.log('[EPHEMERIS] Accurate house calculation complete - Ascendant:', ascendantCoords.signName, ascendantCoords.degree, '°', ascendantCoords.minute, "'");
        
      } else {
        console.warn('[EPHEMERIS] House calculation failed, using simplified method');
        return this.calculateHousesSimple(positions, latitude, longitude, date);
      }
      
      return positions;
    } catch (error) {
      console.warn('[EPHEMERIS] House calculation error, using simplified method:', error);
      return this.calculateHousesSimple(positions, latitude, longitude, date);
    }
  }

  /**
   * Simplified house calculation (fallback)
   */
  private calculateHousesSimple(
    positions: Record<string, PlanetPosition>,
    latitude: number,
    longitude: number,
    date: Date
  ): Record<string, PlanetPosition> {
    const ascendant = (this.toJulianDay(date) * 360) % 360;
    const houseSize = 360 / 12;
    
    for (const [planet, position] of Object.entries(positions)) {
      const adjustedLongitude = (position.longitude - ascendant + 360) % 360;
      position.house = Math.floor(adjustedLongitude / houseSize) + 1;
    }

    return positions;
  }

  /**
   * Utility functions
   */
  private toJulianDay(date: Date, sweph: SwissEPH): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    const day = date.getDate();
    const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
    
    return sweph.swe_julday(year, month, day, hour, SE_GREG_CAL);
  }

  /**
   * Health check for ephemeris system
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    swissEphemerisAvailable: boolean;
    swephWasmAvailable: boolean;
    environment: 'server' | 'client';
    error?: string;
    cacheMetrics?: {
      hits: number;
      misses: number;
      size: number;
      hitRate: number;
    };
  }> {
    try {
      const testDate = new Date();
      const testData = await this.getPlanetaryPositions({
        date: testDate,
        latitude: 0,
        longitude: 0,
        includeHouses: false
      });

      const swephWasmAvailable = testData.source === 'sweph-wasm';
      
      return {
        status: swephWasmAvailable ? 'healthy' : 'unhealthy',
        swissEphemerisAvailable: false, // Legacy compatibility
        swephWasmAvailable,
        environment: this.isServer ? 'server' : 'client',
        cacheMetrics: getCacheMetrics()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        swissEphemerisAvailable: false, // Legacy compatibility
        swephWasmAvailable: false,
        environment: this.isServer ? 'server' : 'client',
        error: error instanceof Error ? error.message : 'Unknown error',
        cacheMetrics: getCacheMetrics()
      };
    }
  }
}

// Export singleton instance and convenience functions
export const ephemeris = Ephemeris.getInstance();

export async function getPlanetaryPositions(options?: EphemerisOptions): Promise<EphemerisData> {
  return ephemeris.getPlanetaryPositions(options);
}

export async function checkEphemerisHealth() {
  return ephemeris.healthCheck();
}

// Legacy exports for compatibility
export { formatCoordinates as formatPosition };
export { ZODIAC_SIGNS as SIGNS };
export { PLANETS as PLANET_NAMES };
