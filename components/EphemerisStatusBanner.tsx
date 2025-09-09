'use client';

import { useEffect, useState } from 'react';
import { EphemerisHealthStatus } from '../lib/ephemeris-health';

export function EphemerisStatusBanner() {
  const [status, setStatus] = useState<Omit<EphemerisHealthStatus, 'mode'> & { mode: EphemerisHealthStatus['mode'] | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/health/ephemeris');
      const data = await response.json();
      setStatus(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch ephemeris status:', error);
      setStatus({
        mode: 'mock',
        nodeVersion: 'unknown',
        lastCheck: new Date(),
        details: 'Error: Failed to check status. Using mock data.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (isLoading || !status) {
    return (
      <div className="bg-blue-100 text-blue-800 p-2 text-sm text-center">
        Checking ephemeris status...
      </div>
    );
  }

  const isRealMode = status.mode === 'real';
  const bgColor = isRealMode ? 'bg-green-100' : 'bg-yellow-100';
  const textColor = isRealMode ? 'text-green-800' : 'text-yellow-800';
  const icon = isRealMode ? '✅' : '⚠️';
  const message = isRealMode 
    ? 'Real Data Mode (Swiss Ephemeris active)' 
    : 'Mock Mode (fallback in use)';

  return (
    <div className={`${bgColor} ${textColor} p-2 text-sm text-center`}>
      <div className="container mx-auto flex justify-between items-center">
        <div>
          {icon} <span className="font-medium">{message}</span>
          <span className="ml-2 text-xs opacity-75">
            Node {status.nodeVersion} • Last checked: {lastUpdated?.toLocaleTimeString()}
          </span>
        </div>
        <button 
          onClick={checkStatus}
          className="text-xs px-2 py-1 rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
