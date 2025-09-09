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

export interface EphemerisResponse {
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

export interface UseEphemerisProps {
  date?: Date | null;
  lat?: number;
  lon?: number;
  autoFetch?: boolean;
}

export interface UseEphemerisReturn {
  data: Record<string, PlanetPosition> | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  source?: 'swiss-ephemeris' | 'mock';
}

// Swiss Ephemeris types are declared in a separate file to avoid conflicts
