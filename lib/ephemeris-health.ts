import { getAllPositions } from './ephemeris.js';

let isEphemerisAvailable: boolean | null = null;
let lastCheck: Date | null = null;
let nodeVersion = process.version;

export interface EphemerisHealthStatus {
  mode: 'real' | 'mock';
  nodeVersion: string;
  lastCheck: Date;
  details?: string;
}

/**
 * Check if the Swiss Ephemeris is available
 * This will attempt to load the module if it hasn't been checked before
 */
export async function checkEphemerisStatus(): Promise<EphemerisHealthStatus> {
  if (isEphemerisAvailable === null) {
    try {
      // Try to get positions for the current date
      await getAllPositions(new Date(), 0, 0);
      isEphemerisAvailable = true;
    } catch (error) {
      isEphemerisAvailable = false;
      console.warn('⚠️ Swiss Ephemeris not available, falling back to mock data');
      console.warn(error);
    }
    lastCheck = new Date();
  }

  return {
    mode: isEphemerisAvailable ? 'real' : 'mock',
    nodeVersion,
    lastCheck: lastCheck!,
    details: isEphemerisAvailable 
      ? 'Swiss Ephemeris is active and providing real astronomical data.'
      : 'Using mock data. This could be due to Node.js version mismatch or installation issues.'
  };
}

/**
 * Get the current ephemeris status without triggering a new check
 */
export function getEphemerisStatus(): EphemerisHealthStatus {
  const mode = isEphemerisAvailable ? 'real' : 'mock';
  const defaultMessage = mode === 'real' 
    ? 'Swiss Ephemeris is active and providing real astronomical data.'
    : 'Using mock data. Run checkEphemerisStatus() to verify availability.';

  return {
    mode,
    nodeVersion,
    lastCheck: lastCheck || new Date(0),
    details: defaultMessage
  };
}

// Check status on module load
checkEphemerisStatus().catch(console.error);

// Re-export for convenience
export default {
  check: checkEphemerisStatus,
  getStatus: getEphemerisStatus
};
