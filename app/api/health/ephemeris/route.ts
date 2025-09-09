import { NextResponse } from 'next/server';
import { getAllPositions } from '../../../../lib/ephemeris';

export const dynamic = 'force-dynamic';

export async function GET() {
  let mode: 'real' | 'mock' = 'mock';
  let details = 'Unknown status';
  
  try {
    // Try to get positions for the current date
    await getAllPositions(new Date(), 0, 0);
    mode = 'real';
    details = 'Swiss Ephemeris is active and providing real astronomical data.';
  } catch (error) {
    mode = 'mock';
    details = 'Using mock data. This could be due to Node.js version mismatch or installation issues.';
    console.warn('⚠️ Swiss Ephemeris not available, falling back to mock data');
  }

  return NextResponse.json({
    mode,
    nodeVersion: process.version,
    lastCheck: new Date().toISOString(),
    details
  });
}
