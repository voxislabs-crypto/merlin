'use client';

import { useEphemeris } from '../../../lib/hooks/useEphemeris.js';
import { format } from 'date-fns';

type PlanetPosition = {
  planet: string;
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
  house: number;
  sign: number;
  signName: string;
  degree: number;
  minute: number;
  second: number;
  isMock: boolean;
  confidence: number;
  orb?: number;
};

export default function PlanetsExample() {
  const { data, loading, error, source } = useEphemeris({
    lat: 40.7128,  // Default to New York
    lon: -74.0060,
  });

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Loading Planetary Positions...</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 rounded w-3/4"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        <h1 className="text-2xl font-bold mb-2">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">No Data Available</h1>
        <p>Could not load planetary positions.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Planetary Positions</h1>
        <div className="text-sm text-gray-500">
          {source === 'mock' ? (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Using Mock Data
            </span>
          ) : (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              Using Swiss Ephemeris
            </span>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Current Planetary Positions
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            As of {format(new Date(), 'MMMM d, yyyy h:mm a')}
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            {Object.entries(data).map(([planet, position]) => {
              const pos = position as PlanetPosition;
              return (
                <div 
                  key={planet} 
                  className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-b border-gray-200"
                >
                  <dt className="text-sm font-medium text-gray-500">
                    {planet.charAt(0).toUpperCase() + planet.slice(1).toLowerCase()}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center">
                      <span className="mr-2">{pos.signName}</span>
                      <span className="text-gray-500">
                        {pos.degree}° {pos.minute}' {Math.round(pos.second)}"
                      </span>
                      <span className="ml-4 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        House {pos.house}
                      </span>
                    </div>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium text-blue-800 mb-2">How to use this data</h3>
        <p className="text-blue-700 text-sm">
          This data is fetched from our API endpoint at <code className="bg-blue-100 px-1 rounded">/api/forecast</code>.
          You can use the <code className="bg-blue-100 px-1 rounded">useEphemeris</code> hook in your components
          to easily access this data with automatic loading and error states.
        </p>
      </div>
    </div>
  );
}
