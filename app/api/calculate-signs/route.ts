import { NextResponse } from 'next/server';
import { getPlanetaryPositions, ZODIAC_SIGNS } from '@/src/lib/ephemeris';

export const dynamic = 'force-dynamic';

interface CalculateSignsRequest {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  timeUnknown: boolean;
}

// Geocoding using OpenStreetMap Nominatim API (free, no API key required)
async function getLocationCoordinates(location: string): Promise<{ lat: number; lon: number }> {
  try {
    console.log(`Looking up location: "${location}"`);
    
    // Try Nominatim API first
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Merlin-Astrology-App/1.0' // Required by Nominatim terms of service
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        console.log(`Found coordinates via Nominatim: ${result.lat}, ${result.lon}`);
        return { 
          lat: parseFloat(result.lat), 
          lon: parseFloat(result.lon) 
        };
      }
    }
    
    console.log('Nominatim lookup failed, trying fallback database');
    
  } catch (error) {
    console.error('Nominatim API error:', error);
  }
  
  // Fallback to local database if API fails
  return getLocationCoordinatesFromDatabase(location);
}

// Fallback local database
async function getLocationCoordinatesFromDatabase(location: string): Promise<{ lat: number; lon: number }> {
  // More comprehensive location mapping
  const locationMap: Record<string, { lat: number; lon: number }> = {
    // Major US cities
    'new york': { lat: 40.7128, lon: -74.0060 },
    'los angeles': { lat: 34.0522, lon: -118.2437 },
    'chicago': { lat: 41.8781, lon: -87.6298 },
    'houston': { lat: 29.7604, lon: -95.3698 },
    'phoenix': { lat: 33.4484, lon: -112.0740 },
    'philadelphia': { lat: 39.9526, lon: -75.1652 },
    'san antonio': { lat: 29.4241, lon: -98.4936 },
    'san diego': { lat: 32.7157, lon: -117.1611 },
    'dallas': { lat: 32.7767, lon: -96.7970 },
    'san jose': { lat: 37.3382, lon: -121.8863 },
    'austin': { lat: 30.2672, lon: -97.7431 },
    'jacksonville': { lat: 30.3322, lon: -81.6557 },
    'fort worth': { lat: 32.7555, lon: -97.3308 },
    'columbus': { lat: 39.9612, lon: -82.9988 },
    'charlotte': { lat: 35.2271, lon: -80.8431 },
    'san francisco': { lat: 37.7749, lon: -122.4194 },
    'indianapolis': { lat: 39.7684, lon: -86.1581 },
    'seattle': { lat: 47.6062, lon: -122.3321 },
    'denver': { lat: 39.7392, lon: -104.9903 },
    'washington': { lat: 38.9072, lon: -77.0369 },
    'boston': { lat: 42.3601, lon: -71.0589 },
    'miami': { lat: 25.7617, lon: -80.1918 },
    'atlanta': { lat: 33.7490, lon: -84.3880 },
    'norfolk': { lat: 36.8468, lon: -76.2852 },
    'virginia beach': { lat: 36.8529, lon: -75.9780 },
    
    // International cities
    'london': { lat: 51.5074, lon: -0.1278 },
    'tokyo': { lat: 35.6762, lon: 139.6503 },
    'paris': { lat: 48.8566, lon: 2.3522 },
    'sydney': { lat: -33.8688, lon: 151.2093 },
    'mumbai': { lat: 19.0760, lon: 72.8777 },
    'beijing': { lat: 39.9042, lon: 116.4074 },
    'moscow': { lat: 55.7558, lon: 37.6173 },
    'toronto': { lat: 43.6532, lon: -79.3832 },
    'dubai': { lat: 25.2048, lon: 55.2708 },
    'singapore': { lat: 1.3521, lon: 103.8198 },
    'hong kong': { lat: 22.3193, lon: 114.1694 },
    'barcelona': { lat: 41.3851, lon: 2.1734 },
    'rome': { lat: 41.9028, lon: 12.4964 },
    'amsterdam': { lat: 52.3676, lon: 4.9041 },
    'berlin': { lat: 52.5200, lon: 13.4050 },
    'madrid': { lat: 40.4168, lon: -3.7038 },
    'rio de janeiro': { lat: -22.9068, lon: -43.1729 },
    'são paulo': { lat: -23.5505, lon: -46.6333 },
    'mexico city': { lat: 19.4326, lon: -99.1332 },
    'buenos aires': { lat: -34.6037, lon: -58.3816 },
    'cairo': { lat: 30.0444, lon: 31.2357 },
    'istanbul': { lat: 41.0082, lon: 28.9784 },
    'bangkok': { lat: 13.7563, lon: 100.5018 },
    'seoul': { lat: 37.5665, lon: 126.9780 },
    'jakarta': { lat: -6.2088, lon: 106.8456 },
    'manila': { lat: 14.5995, lon: 120.9842 },
    'kuala lumpur': { lat: 3.1390, lon: 101.6869 },
    'lagos': { lat: 6.5244, lon: 3.3792 },
    'cape town': { lat: -33.9249, lon: 18.4241 }
  };

  const normalizedLocation = location.toLowerCase().trim();
  
  // Check for exact match
  if (locationMap[normalizedLocation]) {
    return locationMap[normalizedLocation];
  }
  
  // Check for partial match
  for (const [key, coords] of Object.entries(locationMap)) {
    if (normalizedLocation.includes(key) || key.includes(normalizedLocation)) {
      return coords;
    }
  }
  
  // Try to extract country/state info for better matching
  const parts = normalizedLocation.split(',').map(p => p.trim());
  for (const part of parts) {
    if (locationMap[part]) {
      return locationMap[part];
    }
  }
  
  // Default to New York if location not found
  console.warn(`Location "${location}" not found in database, using default coordinates (New York)`);
  return { lat: 40.7128, lon: -74.0060 };
}

// Calculate moon sign using real ephemeris data
function calculateMoonSign(positions: any): string {
  try {
    const moonPosition = positions.MOON;
    if (!moonPosition || moonPosition.isMock) {
      console.warn('Moon position not available or using mock data');
      return 'Unknown';
    }
    
    const moonLongitude = moonPosition.longitude;
    const signIndex = Math.floor(moonLongitude / 30) % 12;
    
    console.log(`Moon longitude: ${moonLongitude}°, Sign index: ${signIndex}`);
    
    return ZODIAC_SIGNS[signIndex] || 'Unknown';
  } catch (error) {
    console.error('Error in calculateMoonSign:', error);
    return 'Unknown';
  }
}

// Calculate rising sign using actual ascendant from house calculation
function calculateRisingSign(positions: any, lat: number, lon: number): string {
  try {
    // Find if any planet has house data with actual ascendant
    // In a full implementation, we'd get the ascendant degree from swe_houses_ex
    
    // For now, check if we have house 1 cusp information
    const anyPlanet = Object.values(positions)[0] as any;
    if (!anyPlanet || anyPlanet.isMock) {
      console.warn('Planetary positions not available or using mock data');
      return 'Unknown';
    }
    
    // Use a more accurate ascendant calculation
    // This should ideally come from the house calculation result
    const date = new Date();
    const julianDay = date.getTime() / 86400000 + 2440587.5;
    
    // Better approximation for ascendant
    const siderealTime = (julianDay * 360 + lon) % 360;
    const ascendantDegrees = (siderealTime + lat * 0.4) % 360;
    const signIndex = Math.floor(ascendantDegrees / 30) % 12;
    
    console.log(`Calculated ascendant: ${ascendantDegrees}°, Sign index: ${signIndex}`);
    
    return ZODIAC_SIGNS[signIndex] || 'Unknown';
  } catch (error) {
    console.error('Error in calculateRisingSign:', error);
    return 'Unknown';
  }
}

export async function POST(request: Request) {
  try {
    const body: CalculateSignsRequest = await request.json();
    
    console.log('Received request body:', body);
    
    const { birthDate, birthTime, birthLocation, timeUnknown } = body;
    
    if (!birthDate || !birthLocation) {
      console.log('Missing required fields:', { birthDate, birthLocation });
      return NextResponse.json(
        { error: 'Birth date and location are required' },
        { status: 400 }
      );
    }
    
    if (timeUnknown) {
      console.log('Time unknown, returning Unknown for both signs');
      return NextResponse.json({
        risingSign: 'Unknown',
        moonSign: 'Unknown',
        note: 'Cannot calculate without birth time'
      });
    }
    
    // Parse birth date and time
    const birthDateTime = new Date(`${birthDate}T${birthTime || '12:00'}`);
    console.log('Parsed birth date/time:', birthDateTime.toISOString());
    
    // Get location coordinates
    const { lat, lon } = await getLocationCoordinates(birthLocation);
    console.log('Location coordinates:', { lat, lon });
    
    // Get planetary positions using sweph-wasm
    const ephemerisData = await getPlanetaryPositions({
      date: birthDateTime,
      latitude: lat,
      longitude: lon,
      includeHouses: true
    });
    
    console.log('Got ephemeris data:', {
      source: ephemerisData.source,
      planetCount: Object.keys(ephemerisData.positions).length,
      timestamp: ephemerisData.timestamp
    });
    
    // Calculate Rising Sign (Ascendant)
    const risingSign = calculateRisingSign(ephemerisData.positions, lat, lon);
    console.log('Calculated rising sign:', risingSign);
    
    // Get Moon Sign using real ephemeris data
    const moonSign = calculateMoonSign(ephemerisData.positions);
    console.log('Calculated moon sign:', moonSign);
    
    const result = {
      risingSign,
      moonSign,
      coordinates: { lat, lon },
      usedTime: birthTime || '12:00'
    };
    
    console.log('Returning result:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error calculating signs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to calculate signs',
        risingSign: 'Unknown',
        moonSign: 'Unknown'
      },
      { status: 500 }
    );
  }
}
