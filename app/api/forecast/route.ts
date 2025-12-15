import { NextResponse } from 'next/server';
import { getPlanetaryPositions, EphemerisData } from '../../../src/lib/ephemeris';

interface ForecastResponse {
  data: Record<string, import('../../../src/lib/ephemeris').PlanetPosition>;
  timestamp: string;
  source: 'swiss-ephemeris' | 'mock';
  warning?: string;
  error?: string;
  details?: string;
  metadata?: {
    calculationTime: number;
    julianDay: number;
    timezone: string;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lon = parseFloat(searchParams.get('lon') || '0');
    
    const date = dateParam ? new Date(dateParam) : new Date();
    
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Please use ISO format (YYYY-MM-DD).' },
        { status: 400 }
      );
    }

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude. Please provide valid numbers.' },
        { status: 400 }
      );
    }

    // Get positions using the new ephemeris implementation
    const ephemerisData: EphemerisData = await getPlanetaryPositions({
      date,
      latitude: lat,
      longitude: lon,
      includeHouses: true,
      includeAspects: false
    });
    
    const response: ForecastResponse = {
      data: ephemerisData.positions,
      timestamp: ephemerisData.timestamp.toISOString(),
      source: ephemerisData.source,
      metadata: ephemerisData.metadata
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in forecast API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch ephemeris data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; // Ensure we get fresh data on each request
