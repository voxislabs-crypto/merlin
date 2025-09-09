import { PlanetPosition } from '../lib/ephemeris.js';

declare global {
  interface Window {
    __EPHEMERIS_LOADED__?: boolean;
  }
}

export interface EphemerisApiResponse {
  data: Record<string, PlanetPosition>;
  timestamp: string;
  source: 'swiss-ephemeris' | 'mock';
  warning?: string;
  error?: string;
  details?: string;
}

export interface EphemerisApiError {
  error: string;
  details?: string;
}

// Extend the global fetch type to include our API response types
declare global {
  interface Response {
    json<T = any>(): Promise<T>;
  }
}
