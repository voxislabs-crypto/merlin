import type { PlanetPosition } from './ephemeris';

// Simple mock data for when Swiss Ephemeris is not available
export async function getAllPositions(date: Date, lat: number, lon: number): Promise<Record<string, PlanetPosition>> {
  console.warn('⚠️ Using mock ephemeris data');
  
  // Generate mock positions for each planet
  const now = date || new Date();
  const baseOffset = (now.getTime() / 1000 / 60 / 60 / 24) % 360; // Days since epoch
  
  const planets = [
    'sun', 'moon', 'mercury', 'venus', 'mars', 
    'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
    'meanNode', 'trueNode'
  ];
  
  const result: Record<string, PlanetPosition> = {};
  
  planets.forEach((planet, index) => {
    // Create a position that changes predictably based on time and planet index
    const position = (baseOffset * (index + 1) * 0.618033988749895) % 360; // Golden ratio for distribution
    const signIndex = Math.floor(position / 30);
    const signDegree = position % 30;
    const degrees = Math.floor(signDegree);
    const minutes = Math.floor((signDegree - degrees) * 60);
    const seconds = Math.floor((((signDegree - degrees) * 60 - minutes) * 60));
    
    result[planet] = {
      planet,
      longitude: position,
      latitude: 0,
      distance: 1,
      speed: 1,
      house: (index % 12) + 1,
      sign: signIndex,
      signName: [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
      ][signIndex],
      degree: degrees,
      minute: minutes,
      second: seconds,
      isMock: true,
      confidence: 0,
    };
  });
  
  return result;
}
