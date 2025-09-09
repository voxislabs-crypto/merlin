import { NextResponse } from 'next/server';
import { getWeeklyForecast } from '../../../lib/forecast-engine.js';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startDate = new Date(searchParams.get('startDate') || Date.now());
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lon = parseFloat(searchParams.get('lon') || '0');
  const days = Math.min(parseInt(searchParams.get('days') || '7', 10), 14); // Max 14 days

  try {
    const weeklyForecast = await getWeeklyForecast(startDate, {
      latitude: lat,
      longitude: lon,
    }, { days });
    
    return NextResponse.json({ weeklyForecast });
  } catch (err: any) {
    console.error('Error in weekly forecast API:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate weekly forecast' }, 
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request
