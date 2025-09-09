import { PlanetPosition } from '@/lib/ephemeris';

declare module '@/lib/ephemeris' {
  export function getPlanetPosition(planet: string, date?: Date): Promise<PlanetPosition>;
  export function getAllPositions(date?: Date, lat?: number, lon?: number): Promise<Record<string, PlanetPosition>>;
  export function getHouseCusps(date: Date, lat: number, lon: number): Promise<number[]>;
  export function getHouseSystem(): string;
  export function setHouseSystem(system: string): void;
  
  export const planets: string[];
  export const houses: string[];
  export const aspects: string[];
  export const orbValues: Record<string, number>;
  
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
}

declare module 'swisseph' {
  export interface SwissEphemerisExtended {
    swe_calc_ut(jd: number, ipl: number, iflag: number): { error: string } | { data: number[] };
    swe_houses(tjd: number, lat: number, lon: number, hsys: string): { houses: number[]; ascendant: number; mc: number };
    swe_set_ephe_path(path: string): void;
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
    SE_TRUE_NODE: number;
    SE_MEAN_NODE: number;
    SE_CHIRON: number;
  }
  
  const swisseph: SwissEphemerisExtended;
  export default swisseph;
}
