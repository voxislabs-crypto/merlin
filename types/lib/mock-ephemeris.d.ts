import type { PlanetPosition } from '../../lib/ephemeris.js';

declare const mockEphemeris: {
  getAllPositions(
    date: Date,
    lat: number,
    lon: number
  ): Promise<Record<string, PlanetPosition>>;
};

export { mockEphemeris };
export default mockEphemeris;
