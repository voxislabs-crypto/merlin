import { NextResponse } from 'next/server';
import { getAllPositions } from '../../../lib/ephemeris.js';

// Define types inline to avoid module resolution issues
interface PlanetPosition {
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

interface ForecastResponse {
  data: Record<string, PlanetPosition>;
  timestamp: string;
  source: 'swiss-ephemeris' | 'mock';
  warning?: string;
  error?: string;
  details?: string;
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

    // Get positions with fallback to mock data if real ephemeris fails
    try {
      const positions = await getAllPositions(date, lat, lon);
      const response: ForecastResponse = {
        data: positions,
        timestamp: new Date().toISOString(),
        source: 'swiss-ephemeris',
      };
      
      return NextResponse.json(response);
    } catch (error) {
      console.error('Error getting ephemeris data, falling back to mock data:', error);
      const mockPositions = await getAllPositions(date, lat, lon); // This will use mock data
      const response: ForecastResponse = {
        data: mockPositions,
        timestamp: new Date().toISOString(),
        source: 'mock',
        warning: 'Using mock data - ' + (error instanceof Error ? error.message : 'Unknown error'),
        error: 'Failed to load ephemeris data',
        details: error instanceof Error ? error.stack : undefined
      };
      
      return NextResponse.json(response);
    }
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
