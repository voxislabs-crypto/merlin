// app/api/calculate-birth-chart/route.ts
import NextRequest from 'next/server'
import { NextResponse } from "next/server";
import { calculatePlanetaryPositions } from "@/lib/astrology/ephemeris";
import {
  ASPECT_MEANINGS,
  PLANET_MEANINGS,
} from "@/lib/astrology/planetaryData";

// Helper function to get zodiac sign from longitude
function getZodiacSign(longitude: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex % 12];
}

// Type definitions
type CalculateBirthChartRequest = {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  timeUnknown: boolean;
};

type PlanetPosition = {
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
  sign: string;
  degree: number;
  minute: number;
  second: number;
  house: number;
};

export async function POST(request: NextRequest) {
  try {
    console.log('Received birth chart calculation request');
    
    const { birthDate, birthTime, birthLocation } =
      (await request.json()) as CalculateBirthChartRequest;

    console.log('Request data:', { birthDate, birthTime, birthLocation });

    if (!birthDate) {
      return NextResponse.json(
        { error: "Birth date is required" },
        { status: 400 }
      );
    }

    // Parse date and time
    const [year, month, day] = birthDate.split("-").map(Number);
    const [hours, minutes] = (birthTime || "12:00").split(":").map(Number);

    // Create date object in UTC
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));

    // Get geolocation data
    const locationData = await getGeolocationData(birthLocation);

    if (!locationData) {
      return NextResponse.json(
        { error: "Could not determine location coordinates" },
        { status: 400 }
      );
    }

    // Calculate positions using Swiss Ephemeris
    console.log('Calculating planetary positions for:', { utcDate, latitude: locationData.latitude, longitude: locationData.longitude });
    
    const result = await calculatePlanetaryPositions(
      utcDate,
      locationData.latitude,
      locationData.longitude
    );

    console.log('Calculation result:', result);

    if (!result || !result.positions || !result.houses) {
      console.error('Invalid calculation result:', result);
      throw new Error("Failed to calculate birth chart - invalid result");
    }

    // Calculate aspects
    const aspects = calculateAspects(result.positions as Record<string, PlanetPosition>);

    // Prepare response
    const response = {
      positions: Object.entries(result.positions).map(([planet, data]) => ({
        planet,
        ...data,
        meaning: PLANET_MEANINGS[planet as keyof typeof PLANET_MEANINGS] || {},
      })),
      houses: result.houses.map((house: any, index: number) => ({
        house: index + 1,
        position: house.position,
        sign: getZodiacSign(house.position),
        degree: Math.floor(house.position % 30),
        minute: Math.floor((house.position % 1) * 60),
        second: Math.floor(((house.position % 1) * 60 % 1) * 60)
      })),
      aspects: aspects.map((aspect) => ({
        ...aspect,
        meaning:
          ASPECT_MEANINGS[aspect.type as keyof typeof ASPECT_MEANINGS] || {},
      })),
      birthData: {
        date: utcDate.toISOString(),
        location: birthLocation,
        coordinates: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error calculating birth chart:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack available');
    
    return NextResponse.json(
      { 
        error: "Failed to calculate birth chart",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to get geolocation data
async function getGeolocationData(location: string) {
  try {
    // In a real app, use a geocoding service here
    return {
      latitude: 40.7128, // Default to New York
      longitude: -74.006,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Calculate aspects between planets
function calculateAspects(positions: Record<string, PlanetPosition>) {
  const aspects: Array<{
    planet1: { name: string; longitude: number };
    planet2: { name: string; longitude: number };
    type: string;
    orb: number;
    exact: boolean;
  }> = [];

  const planets = Object.keys(positions);

  // Define major aspects with their exact angles and orbs
  const MAJOR_ASPECTS = [
    { type: "Conjunction", angle: 0, orb: 10 },
    { type: "Sextile", angle: 60, orb: 5 },
    { type: "Square", angle: 90, orb: 7 },
    { type: "Trine", angle: 120, orb: 7 },
    { type: "Opposition", angle: 180, orb: 10 },
  ];

  // Check aspects between all planet pairs
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];
      const pos1 = positions[planet1].longitude;
      const pos2 = positions[planet2].longitude;

      // Calculate the angle between the two planets
      let angle = Math.abs(pos1 - pos2) % 360;
      if (angle > 180) angle = 360 - angle;

      // Check for major aspects
      for (const { type, angle: exactAngle, orb } of MAJOR_ASPECTS) {
        const diff = Math.abs(angle - exactAngle);
        if (diff <= orb) {
          aspects.push({
            planet1: { name: planet1, longitude: pos1 },
            planet2: { name: planet2, longitude: pos2 },
            type,
            orb: diff,
            exact: diff < 1,
          });
          break;
        }
      }
    }
  }

  return aspects;
}
