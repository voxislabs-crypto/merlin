import { NextResponse } from 'next/server';
import { checkEphemerisHealth } from '@/src/lib/ephemeris';

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

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const startTime = performance.now();
  
  try {
    const health = await checkEphemerisHealth();
    const calculationTime = performance.now() - startTime;
    
    // Get system metrics
    const systemMetrics = {
      uptime: process.uptime(),
      platform: process.platform,
      arch: process.arch,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    // Memory usage (if available)
    let memoryUsage: number | undefined;
    try {
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const memUsage = process.memoryUsage();
        memoryUsage = memUsage.heapUsed / 1024 / 1024; // MB
      }
    } catch (e) {
      // Memory usage not available
    }

    const response: HealthResponse = {
      status: health.status,
      mode: health.swephWasmAvailable ? 'real' : 'mock',
      nodeVersion: process.version,
      lastCheck: new Date().toISOString(),
      details: health.status === 'healthy' 
        ? 'Swiss Ephemeris (sweph-wasm) is active and providing real astronomical data.'
        : health.status === 'degraded'
        ? 'Using mock data. Swiss Ephemeris not available.'
        : `Ephemeris system unhealthy: ${health.error || 'Unknown error'}`,
      environment: health.environment,
      mockMode: health.mockMode,
      metrics: {
        calculationTime: Math.round(calculationTime * 100) / 100,
        memoryUsage: memoryUsage ? Math.round(memoryUsage * 100) / 100 : undefined,
        wasmInitialized: health.swephWasmAvailable,
        cacheHits: health.cacheMetrics?.hits || 0,
        cacheMisses: health.cacheMetrics?.misses || 0,
        cacheSize: health.cacheMetrics?.size || 0,
        cacheHitRate: health.cacheMetrics?.hitRate || 0
      },
      system: systemMetrics
    };

    if (health.error) {
      response.error = health.error;
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorResponse: HealthResponse = {
      status: 'unhealthy',
      mode: 'mock',
      nodeVersion: process.version,
      lastCheck: new Date().toISOString(),
      details: 'Health check failed. Using mock data.',
      environment: 'server',
      mockMode: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      metrics: {
        calculationTime: performance.now() - startTime,
        memoryUsage: undefined,
        wasmInitialized: false,
        cacheHits: 0,
        cacheMisses: 0,
        cacheSize: 0,
        cacheHitRate: 0
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
