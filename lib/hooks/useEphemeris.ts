import { useState, useEffect } from 'react';
import type {
  PlanetPosition,
  EphemerisData,
  EphemerisOptions
} from '../../src/lib/ephemeris';

export interface UseEphemerisProps extends Omit<EphemerisOptions, 'date'> {
  date?: Date | null;
  autoFetch?: boolean;
}

export interface UseEphemerisReturn {
  data: Record<string, PlanetPosition> | null;
  loading: boolean;
  error: string | null;
  source: 'swiss-ephemeris' | 'mock';
  metadata?: EphemerisData['metadata'];
  refetch: () => Promise<void>;
  initializing?: boolean; // WASM initialization state
}



export function useEphemeris({
  date = new Date(),
  latitude = 0,
  longitude = 0,
  autoFetch = true,
  includeHouses = true,
  includeAspects = false,
  zodiacType = 'tropical',
  houseSystem = 'placidus'
}: UseEphemerisProps = {}): UseEphemerisReturn {
  const [data, setData] = useState<Record<string, PlanetPosition> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'swiss-ephemeris' | 'mock'>('mock');
  const [metadata, setMetadata] = useState<EphemerisData['metadata']>();
  const [initializing, setInitializing] = useState<boolean>(false);

  const fetchEphemeris = async (): Promise<void> => {
    if (!date || latitude === undefined || longitude === undefined) {
      setError('Missing required parameters');
      return;
    }

    setLoading(true);
    setInitializing(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        date: date.toISOString(),
        lat: latitude.toString(),
        lon: longitude.toString(),
        includeHouses: includeHouses.toString(),
        includeAspects: includeAspects.toString(),
        zodiacType,
        houseSystem
      });

      const response = await fetch(`/api/forecast?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 'Failed to fetch ephemeris data'
        );
      }

      const result = await response.json();
      setData(result.data);
      setSource(result.source);
      setMetadata(result.metadata);

      if (result.warning) {
        console.warn('Ephemeris warning:', result.warning);
      }
    } catch (err) {
      console.error('Error fetching ephemeris data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchEphemeris();
    }
  }, [date, latitude, longitude, autoFetch]);

  return {
    data,
    loading,
    error,
    source,
    metadata,
    initializing,
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
