import { NextResponse } from 'next/server';
import { getWeeklyForecast, generateThemes, generateMood, generateAdvice, calculateIntensity, calculateConfidence } from '@/lib/forecast-engine';
import { auth } from '@clerk/nextjs/server';
import { Redis } from '@upstash/redis';
import { getPlanetaryPositions } from '@/lib/astrology/calculations';
import { detectAspects } from '@/lib/aspects';

// Ensure this route is always dynamically evaluated
export const dynamic = 'force-dynamic';

let redis: any = null;
const CACHE_TTL = 60 * 60 * 12; // 12 hours in seconds

// Initialize Redis only if environment variables are set
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const { Redis } = require('@upstash/redis');
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.error('No user ID found in auth');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    console.log('Received startDateParam:', startDateParam);
    
    const startDate = startDateParam ? new Date(startDateParam) : new Date();
    console.log('Parsed startDate:', startDate);
    console.log('Is valid date:', !isNaN(startDate.getTime()));
    
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid startDate parameter' },
        { status: 400 }
      );
    }

    const days = Math.min(parseInt(searchParams.get('days') || '7', 10), 7); // Max 7 days

    // Generate a cache key based on user ID and week start date
    const weekStart = new Date(startDate);
    weekStart.setHours(0, 0, 0, 0);
    const cacheKey = `weekly-forecast:${userId}:${weekStart.toISOString().split('T')[0]}`;

    // Try to get cached forecast if Redis is available
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log('Returning cached forecast');
          return NextResponse.json({ weeklyForecast: cached });
        }
      } catch (redisError) {
        console.error('Redis error:', redisError);
        // Continue without cache if Redis fails
      }
    }

    console.log('Fetching birth chart for user:', userId);
    const birthChart = await getUserBirthChart(userId);
    if (!birthChart) {
      console.error('No birth chart found for user:', userId);
      return NextResponse.json(
        { 
          error: 'Birth chart not found. Please complete your profile and ensure your birth chart is saved.',
          help: 'Navigate to your profile settings and create your birth chart first.',
          code: 'BIRTH_CHART_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Generate weekly forecast
    const weeklyForecast = await generateWeeklyForecast(
      startDate,
      birthChart,
      { days }
    );

    // Cache the result if Redis is available
    if (redis) {
      await redis.set(cacheKey, weeklyForecast, { ex: CACHE_TTL }).catch(console.error);
    }

    return NextResponse.json({ weeklyForecast });
  } catch (err: any) {
    console.error('Error in weekly forecast API:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate weekly forecast' },
      { status: 500 }
    );
  }
}

async function getUserBirthChart(userId: string) {
  try {
    // First, try to get from database directly if we have a direct connection
    // This is just an example - you'll need to implement the actual database query
    // based on your database setup
    // const db = await getDbConnection();
    // const birthChart = await db.collection('birthCharts').findOne({ userId });
    // if (birthChart) return birthChart;

    // Fallback to API if direct DB access isn't set up
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/birth-chart`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'X-User-ID': userId,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch birth chart:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      return null;
    }

    const birthChartData = await response.json();
    
    // Handle the response format from the birth-chart API
    if (!birthChartData.success) {
      console.error('Birth chart API returned error:', birthChartData.error);
      return null;
    }
    
    // Return the birth chart data in the expected format
    return {
      ...birthChartData.data,
      latitude: birthChartData.latitude,
      longitude: birthChartData.longitude,
      birthDate: birthChartData.birthDate
    };
  } catch (error) {
    console.error('Error in getUserBirthChart:', error);
    return null;
  }
}

async function generateWeeklyForecast(
  startDate: Date,
  birthChart: any,
  options: { days: number }
) {
  const { days } = options;
  const weekStart = new Date(startDate);
  weekStart.setHours(0, 0, 0, 0);

  // Generate forecast for each day
  const daysForecast = [];
  
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + i);
    
    // Set time to noon UTC for consistent daily readings
    currentDate.setUTCHours(12, 0, 0, 0);

    // Get planetary positions
    const positions = getPlanetaryPositions(
      currentDate,
      birthChart.latitude,
      birthChart.longitude
    );

    // Calculate aspects
    const aspects = detectAspects(positions);

    // Generate themes
    const { primaryTheme, supportingThemes } = generateThemes(aspects);

    // Calculate intensity (0-1) based on number and type of aspects
    const intensity = calculateIntensity(aspects);

    // Generate mood and advice based on aspects and themes
    const mood = generateMood(aspects);
    const advice = generateAdvice(primaryTheme, aspects);
    
    // Calculate confidence based on number of aspects and their orbs
    const confidence = calculateConfidence(aspects);

    daysForecast.push({
      date: currentDate.toISOString(),
      primaryTheme,
      intensity,
      keyTransits: getKeyTransits(aspects, 3), // Top 3 transits
      mood,
      advice,
      confidence,
    });
  }

  // Generate weekly overview and highlights
  const overview = generateWeeklyOverview(daysForecast);
  const highlights = getWeeklyHighlights(daysForecast);
  const powerDays = getPowerDays(daysForecast);
  const lowEnergyDays = getLowEnergyDays(daysForecast);

  return {
    weekStart: weekStart.toISOString(),
    days: daysForecast,
    overview,
    highlights,
    powerDays,
    lowEnergyDays,
  };
}

function getKeyTransits(aspects: any[], count: number): any[] {
  // Sort aspects by importance (orb and type)
  return aspects
    .sort((a, b) => {
      // Sort by orb (tighter orbs first)
      if (a.orb !== b.orb) return a.orb - b.orb;
      
      // Then by aspect type (more significant aspects first)
      const aspectWeights: Record<string, number> = {
        'conjunction': 5,
        'opposition': 4,
        'square': 3,
        'trine': 2,
        'sextile': 1,
      };
      
      return (aspectWeights[b.aspect] || 0) - (aspectWeights[a.aspect] || 0);
    })
    .slice(0, count);
}

function generateWeeklyOverview(days: Array<{primaryTheme: string}>): string {
  const themeCounts = days.reduce((acc, day) => {
    acc[day.primaryTheme] = (acc[day.primaryTheme] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mainThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([theme]) => theme);
  
  return `This week is primarily about ${mainThemes.join(' and ').toLowerCase()}. ` +
    'The cosmic energies suggest a time of growth and reflection. ' +
    'Pay attention to the key transits highlighted for each day.';
}

function getWeeklyHighlights(days: any[]): string[] {
  // Find days with highest intensity
  const sortedByIntensity = [...days].sort((a, b) => b.intensity - a.intensity);
  
  return [
    `Strongest day: ${formatDate(sortedByIntensity[0].date)} - ${sortedByIntensity[0].primaryTheme}`,
    `Best for action: ${getBestActionDay(days)}`,
    `Best for rest: ${getBestRestDay(days)}`,
  ];
}

function getPowerDays(days: any[]): string[] {
  // Return dates of days with intensity above threshold
  const threshold = 0.7;
  return days
    .filter(day => day.intensity >= threshold)
    .map(day => day.date);
}

function getLowEnergyDays(days: any[]): string[] {
  // Return dates of days with intensity below threshold
  const threshold = 0.3;
  return days
    .filter(day => day.intensity <= threshold)
    .map(day => day.date);
}

function getBestActionDay(days: any[]): string {
  // Find day with best aspects for taking action
  const actionDays = days.filter(day => 
    ['New Beginnings', 'Opportunities'].includes(day.primaryTheme)
  );
  
  if (actionDays.length > 0) {
    return formatDate(actionDays[0].date);
  }
  
  // Fallback to day with highest intensity if no clear action days
  return formatDate([...days].sort((a, b) => b.intensity - a.intensity)[0].date);
}

function getBestRestDay(days: any[]): string {
  // Find day with lowest intensity and no challenging aspects
  const restDays = days.filter(day => 
    day.primaryTheme === 'Harmony' || day.intensity < 0.4
  );
  
  if (restDays.length > 0) {
    return formatDate(
      restDays.sort((a, b) => a.intensity - b.intensity)[0].date
    );
  }
  
  // Fallback to day with lowest intensity
  return formatDate([...days].sort((a, b) => a.intensity - b.intensity)[0].date);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

// Re-export for testing
export const __test__ = {
  calculateIntensity,
  generateMood,
  generateAdvice,
  getKeyTransits,
  generateWeeklyOverview,
  getWeeklyHighlights,
  getPowerDays,
  getLowEnergyDays,
};
