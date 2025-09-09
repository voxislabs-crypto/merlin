import { useState, useEffect } from 'react';
import type {
  PlanetPosition,
  EphemerisResponse,
  UseEphemerisProps,
  UseEphemerisReturn
} from '../../types/ephemeris.js';



export function useEphemeris({
  date = new Date(),
  lat = 0,
  lon = 0,
  autoFetch = true,
}: UseEphemerisProps = {}): UseEphemerisReturn {
  const [data, setData] = useState<Record<string, PlanetPosition> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'swiss-ephemeris' | 'mock'>('mock');

  const fetchEphemeris = async (): Promise<void> => {
    if (!date || lat === undefined || lon === undefined) {
      setError('Missing required parameters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        date: date.toISOString(),
        lat: lat.toString(),
        lon: lon.toString(),
      });

      const response = await fetch(`/api/forecast?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 'Failed to fetch ephemeris data'
        );
      }

      const result: EphemerisResponse = await response.json();
      setData(result.data);
      setSource(result.source);

      if (result.warning) {
        console.warn('Ephemeris warning:', result.warning);
      }
    } catch (err) {
      console.error('Error fetching ephemeris data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchEphemeris();
    }
  }, [date, lat, lon, autoFetch]);

  return {
    data,
    loading,
    error,
    source,
    refetch: fetchEphemeris,
  };
}

// Example usage in a component:
/*
function PlanetPositions() {
  const { data, loading, error, source } = useEphemeris({
    lat: 40.7,
    lon: -74.0,
  });

  if (loading) return <div>Loading planetary positions...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div>
      <h2>Planetary Positions {source === 'mock' && '(Mock Data)'}</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
*/
