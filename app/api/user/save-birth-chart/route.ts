import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BirthChartData {
  birthData: {
    date: string;
    location: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  positions: Array<{
    planet: string;
    longitude: number;
    latitude: number;
    distance: number;
    speed: number;
    sign: string;
    degree: number;
    minute: number;
    second: number;
    house: number;
  }>;
  houses: Array<{
    house: number;
    position: number;
    sign: string;
    degree: number;
    minute: number;
    second: number;
  }>;
  aspects?: Array<{
    planet1: { name: string; longitude: number };
    planet2: { name: string; longitude: number };
    type: string;
    orb: number;
    exact: boolean;
  }>;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const birthChartData: BirthChartData = await req.json();

    // Validate required fields
    if (!birthChartData.positions || !birthChartData.houses || !birthChartData.birthData) {
      return NextResponse.json(
        { error: 'Invalid birth chart data. Missing required fields.' },
        { status: 400 }
      );
    }

    // Extract birth date and coordinates
    const { birthData } = birthChartData;
    const birthDate = new Date(birthData.date);
    
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid birth date format' },
        { status: 400 }
      );
    }

    // Format planets data for storage
    const planetsData = birthChartData.positions.reduce((acc, position) => {
      acc[position.planet.toLowerCase()] = {
        longitude: position.longitude,
        latitude: position.latitude,
        distance: position.distance,
        speed: position.speed,
        sign: position.sign,
        degree: position.degree,
        minute: position.minute,
        second: position.second,
        house: position.house
      };
      return acc;
    }, {} as Record<string, any>);

    // Save or update birth chart in the database
    const birthChart = await prisma.birthChart.upsert({
      where: { 
        userId 
      },
      update: {
        birthDate,
        latitude: birthData.coordinates.latitude,
        longitude: birthData.coordinates.longitude,
        planets: planetsData,
        houses: birthChartData.houses,
        aspects: birthChartData.aspects || [],
      },
      create: {
        userId,
        birthDate,
        latitude: birthData.coordinates.latitude,
        longitude: birthData.coordinates.longitude,
        planets: planetsData,
        houses: birthChartData.houses,
        aspects: birthChartData.aspects || [],
      },
    });

    return NextResponse.json({ success: true, birthChart });
  } catch (error) {
    console.error('Error saving birth chart:', error);
    return NextResponse.json(
      { error: 'Failed to save birth chart', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const birthChart = await prisma.birthChart.findUnique({
      where: { 
        userId 
      },
    });

    if (!birthChart) {
      return NextResponse.json(
        { error: 'Birth chart not found' },
        { status: 404 }
      );
    }

    // Format the response to match the frontend's expected format
    const formattedChart = {
      birthData: {
        date: birthChart.birthDate.toISOString(),
        location: '', // Not stored in the database
        coordinates: {
          latitude: birthChart.latitude,
          longitude: birthChart.longitude
        }
      },
      positions: Object.entries(birthChart.planets as Record<string, any>).map(([planet, data]) => ({
        planet,
        ...data
      })),
      houses: birthChart.houses,
      aspects: birthChart.aspects || []
    };

    return NextResponse.json({ birthChart: formattedChart });
  } catch (error) {
    console.error('Error fetching birth chart:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch birth chart',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
