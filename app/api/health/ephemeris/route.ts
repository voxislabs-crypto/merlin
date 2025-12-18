import { NextResponse } from 'next/server';
import { utc_to_jd, calc, constants, set_ephe_path } from 'sweph';

export const dynamic = 'force-dynamic';

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  mode: 'real' | 'mock';
  nodeVersion: string;
  lastCheck: string;
  details: string;
  environment?: string;
  mockMode?: boolean;
  error?: string;
  metrics?: {
    calculationTime?: number;
    memoryUsage?: number;
    wasmInitialized?: boolean;
    cacheHits?: number;
    cacheMisses?: number;
  };
  system?: {
    uptime: number;
    platform: string;
    arch: string;
    timezone: string;
  };
}

export async function GET() {
  const startTime = performance.now();
  
  try {
    console.log('Testing real Swiss Ephemeris...');
    set_ephe_path('./ephe'); // Use ephe directory for ephemeris files
    console.log('Real Swiss Ephemeris loaded successfully');
    
    // Test calculation with known date
    const jdResult = utc_to_jd(1983, 8, 14, 16, 21, 0, constants.SE_GREG_CAL);
    if (jdResult.flag !== constants.OK) {
      throw new Error(`Julian Day calculation failed: ${jdResult.error}`);
    }
    const [jd_et] = jdResult.data;
    
    const flags = constants.SEFLG_SWIEPH | constants.SEFLG_SPEED;
    const moonResult = calc(jd_et, constants.SE_MOON, flags);
    if (moonResult.flag !== flags) {
      console.error(`Error calculating Moon: ${moonResult.error}`);
    }
    const moonLongitude = moonResult.data[0];
    
    const calculationTime = performance.now() - startTime;
    
    console.log('Real Swiss Ephemeris Health Check Results:');
    console.log(`Test Date: 1983-08-14 16:21 UTC (Norfolk VA)`);
    console.log(`Moon Longitude: ${moonLongitude.toFixed(2)}°`);
    console.log(`Expected: ~211° in Scorpio`);
    
    const systemMetrics = {
      uptime: process.uptime(),
      platform: process.platform,
      arch: process.arch,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    let memoryUsage: number | undefined;
    try {
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const memUsage = process.memoryUsage();
        memoryUsage = memUsage.heapUsed / 1024 / 1024;
      }
    } catch (e) {
      // Memory usage not available
    }

    const response: HealthResponse = {
      status: 'healthy',
      mode: 'real',
      nodeVersion: process.version,
      lastCheck: new Date().toISOString(),
      details: 'Real Swiss Ephemeris (native) is active and providing high-precision astronomical data.',
      environment: 'server',
      mockMode: false,
      metrics: {
        calculationTime: Math.round(calculationTime * 100) / 100,
        memoryUsage: memoryUsage ? Math.round(memoryUsage * 100) / 100 : undefined,
        wasmInitialized: false,
        cacheHits: 0,
        cacheMisses: 0
      },
      system: systemMetrics
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorResponse: HealthResponse = {
      status: 'unhealthy',
      mode: 'mock',
      nodeVersion: process.version,
      lastCheck: new Date().toISOString(),
      details: 'Health check failed. Swiss Ephemeris not available.',
      environment: 'server',
      mockMode: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      metrics: {
        calculationTime: performance.now() - startTime,
        memoryUsage: undefined,
        wasmInitialized: false,
        cacheHits: 0,
        cacheMisses: 0
      },
      system: {
        uptime: process.uptime(),
        platform: process.platform,
        arch: process.arch,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
