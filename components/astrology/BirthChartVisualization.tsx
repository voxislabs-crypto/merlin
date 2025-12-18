import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PLANET_MEANINGS } from '@/lib/astrology/planetaryData';

type BirthChartProps = {
  data: {
    positions: Array<{
      planet: string
      longitude: number
      latitude: number
      distance: number
      speed: number
      sign: string
      degree: number
      minute: number
      second: number
      house: number
      meaning: Record<string, any>
    }>;
    houses: Array<{
      house: number
      position: number
      sign: string
      degree: number
      minute: number
      second: number
    }>;
    aspects: Array<{
      planet1: { name: string; longitude: number }
      planet2: { name: string; longitude: number }
      type: string
      orb: number
      exact: boolean
      meaning: Record<string, any>
    }>;
    birthData: {
      date: string
      location: string
      coordinates: {
        latitude: number
        longitude: number
      }
    }
  };
};

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const PLANET_NAMES: Record<string, string> = {
  'SUN': 'Sun',
  'MOON': 'Moon',
  'MERCURY': 'Mercury',
  'VENUS': 'Venus',
  'MARS': 'Mars',
  'JUPITER': 'Jupiter',
  'SATURN': 'Saturn',
  'URANUS': 'Uranus',
  'NEPTUNE': 'Neptune',
  'PLUTO': 'Pluto',
  'CHIRON': 'Chiron',
  'NORTH_NODE': 'North Node'
};

const ASPECT_COLORS: Record<string, string> = {
  'CONJUNCTION': '#FF6B6B',
  'SEXTILE': '#4ECDC4',
  'SQUARE': '#FFD166',
  'TRINE': '#06D6A0',
  'OPPOSITION': '#EF476F',
  'QUINTILE': '#A78BFA',
  'BIQUINTILE': '#C084FC',
  'SEMISEXTILE': '#7DD3FC',
  'SEMISQUARE': '#FBBF24',
  'SESQUIQUADRATE': '#F59E0B',
  'QUINCUNX': '#F472B6'
};

export function BirthChartVisualization({ data }: BirthChartProps): JSX.Element {
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  // Debug: Log the data structure
  console.log('BirthChartVisualization data:', data);
  console.log('Positions:', data.positions);
  console.log('PLANET_MEANINGS:', PLANET_MEANINGS);

  // Custom tooltip component
  const Tooltip = ({ children, content, visible, planetName }: { children: React.ReactNode; content: any; visible: boolean; planetName: string }) => {
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    
    const handleMouseMove = (e: React.MouseEvent<SVGElement>) => {
      setTooltipPosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    return (
      <>
        <g onMouseMove={handleMouseMove}>
          {children}
        </g>
        {visible && content && (
          <div 
            className="fixed z-[9999] w-48 p-3 bg-slate-900/95 backdrop-blur-sm border border-purple-400/30 rounded-lg shadow-2xl text-white text-xs pointer-events-none"
            style={{
              left: `${tooltipPosition.x + 10}px`,
              top: `${tooltipPosition.y - 80}px`,
            }}
          >
            <div className="font-bold text-purple-300 mb-1">{content.name || planetName}</div>
            <div className="space-y-1">
              {content.keywords && (
                <div>
                  <span className="text-purple-400 font-semibold">Keywords:</span> {content.keywords.slice(0, 3).join(', ')}
                </div>
              )}
              {content.description && (
                <div>
                  <span className="text-purple-400 font-semibold">Meaning:</span> {content.description.slice(0, 60)}...
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  };
  // Calculate positions for the circular chart
  const getPlanetPosition = (longitude: number, radius: number) => {
    const rad = ((longitude - 90) * Math.PI) / 180;
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius
    };
  };

  // Render zodiac wheel
  const renderZodiacWheel = () => {
    const ZODIAC_COLORS = [
      'from-red-500 to-orange-500', // Aries
      'from-orange-500 to-yellow-500', // Taurus  
      'from-yellow-500 to-green-500', // Gemini
      'from-green-500 to-emerald-500', // Cancer
      'from-amber-500 to-yellow-600', // Leo
      'from-green-600 to-teal-500', // Virgo
      'from-pink-500 to-rose-500', // Libra
      'from-red-600 to-red-800', // Scorpio
      'from-purple-500 to-indigo-500', // Sagittarius
      'from-gray-600 to-slate-700', // Capricorn
      'from-blue-500 to-cyan-500', // Aquarius
      'from-indigo-500 to-purple-600', // Pisces
    ];

    return (
      <div className="relative w-full max-w-md mx-auto aspect-square">
        {/* Outer decorative ring */}
        <div className="absolute inset-0 rounded-full bg-linear-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20 border-2 border-purple-500/30 shadow-2xl">
          {/* Inner decorative ring */}
          <div className="absolute inset-2 rounded-full bg-linear-to-br from-slate-900/50 to-slate-800/30 border border-purple-400/20">
            {/* Center circle */}
            <div className="absolute inset-4 rounded-full bg-linear-to-br from-slate-900 to-black border border-purple-300/10">
              {/* Everything in SVG for precise positioning */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                {ZODIAC_SIGNS.map((sign, i) => {
                  const startAngle = i * 30;
                  const endAngle = (i + 1) * 30;
                  const startRad = (startAngle - 90) * Math.PI / 180;
                  const endRad = (endAngle - 90) * Math.PI / 180;
                  const x1 = 50 + Math.cos(startRad) * 40;
                  const y1 = 50 + Math.sin(startRad) * 40;
                  const x2 = 50 + Math.cos(endRad) * 40;
                  const y2 = 50 + Math.sin(endRad) * 40;
                  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                  
                  return (
                    <g key={sign}>
                      {/* Zodiac segment */}
                      <path
                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        className={`fill-gradient-to-br ${ZODIAC_COLORS[i]} opacity-30 stroke-purple-400/20`}
                        strokeWidth="0.5"
                      />
                      {/* Segment border */}
                      <line
                        x1="50"
                        y1="50"
                        x2={x2}
                        y2={y2}
                        className="stroke-purple-400/30"
                        strokeWidth="0.5"
                      />
                    </g>
                  );
                })}
                
                {/* House lines */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 30) - 90;
                  const rad = angle * Math.PI / 180;
                  const x = 50 + Math.cos(rad) * 38;
                  const y = 50 + Math.sin(rad) * 38;
                  
                  return (
                    <line
                      key={`house-${i}`}
                      x1="50"
                      y1="50"
                      x2={x}
                      y2={y}
                      className="stroke-cyan-400/40"
                      strokeWidth="1"
                      strokeDasharray={i === 0 ? "0" : "2,2"}
                    />
                  );
                })}
                
                {/* Aspect lines */}
                {data.aspects.slice(0, 8).map((aspect, i) => {
                  const planet1Pos = data.positions.find(p => p.planet === aspect.planet1.name);
                  const planet2Pos = data.positions.find(p => p.planet === aspect.planet2.name);
                  
                  if (!planet1Pos || !planet2Pos) return null;
                  
                  const angle1 = planet1Pos.longitude - 90;
                  const angle2 = planet2Pos.longitude - 90;
                  const rad1 = angle1 * Math.PI / 180;
                  const rad2 = angle2 * Math.PI / 180;
                  
                  const x1 = Math.cos(rad1) * 32 + 50;
                  const y1 = Math.sin(rad1) * 32 + 50;
                  const x2 = Math.cos(rad2) * 32 + 50;
                  const y2 = Math.sin(rad2) * 32 + 50;
                  
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={ASPECT_COLORS[aspect.type] || '#666'}
                      strokeWidth="1"
                      strokeDasharray={aspect.type === 'TRINE' || aspect.type === 'SEXTILE' ? '3,3' : '2,2'}
                      opacity="0.3"
                      className="animate-pulse"
                      style={{ animationDuration: '3s', animationDelay: `${i * 0.2}s` }}
                    />
                  );
                })}
                
                {/* Planets as SVG circles with text */}
                {data.positions.map((planetData, index) => {
                  const angle = planetData.longitude - 90;
                  const rad = angle * Math.PI / 180;
                  
                  // Add slight staggering to prevent overlapping
                  const radiusOffset = index % 2 === 0 ? 32 : 28; // Alternate between 32 and 28
                  const x = Math.cos(rad) * radiusOffset + 50;
                  const y = Math.sin(rad) * radiusOffset + 50;
                  
                  const planetMeaning = PLANET_MEANINGS[planetData.planet as keyof typeof PLANET_MEANINGS] || {};
                  
                  return (
                    <g key={planetData.planet}>
                      {/* Planet circle - smaller size */}
                      <circle
                        cx={x}
                        cy={y}
                        r="2.5"
                        fill="url(#planetGradient)"
                        className="hover:r-3 transition-all cursor-pointer"
                        onMouseEnter={() => {
                          console.log('Hovering over:', planetData.planet, 'at SVG position:', x, y);
                          setHoveredPlanet(planetData.planet);
                        }}
                        onMouseLeave={() => {
                          console.log('Left hover:', planetData.planet);
                          setHoveredPlanet(null);
                        }}
                      />
                      {/* Planet symbol - smaller text */}
                      <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-white text-xs font-bold pointer-events-none select-none"
                        style={{ fontSize: '6px' }}
                      >
                        {planetData.planet === 'SUN' ? '☉' : 
                         planetData.planet === 'MOON' ? '☽' :
                         planetData.planet === 'MERCURY' ? '☿' :
                         planetData.planet === 'VENUS' ? '♀' :
                         planetData.planet === 'MARS' ? '♂' :
                         planetData.planet === 'JUPITER' ? '♃' :
                         planetData.planet === 'SATURN' ? '♄' :
                         planetData.planet === 'URANUS' ? '♅' :
                         planetData.planet === 'NEPTUNE' ? '♆' :
                         planetData.planet === 'PLUTO' ? '♇' :
                         planetData.planet === 'NORTH_NODE' ? '☊' :
                         planetData.planet === 'SOUTH_NODE' ? '☋' :
                         planetData.planet[0]}
                      </text>
                    </g>
                  );
                })}
                
                {/* Center decorative circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="3"
                  className="fill-purple-400"
                />
                
                {/* Define gradient for planets */}
                <defs>
                  <linearGradient id="planetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className="stop-color-yellow-400" />
                    <stop offset="100%" className="stop-color-orange-500" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Zodiac sign labels */}
              {ZODIAC_SIGNS.map((sign, i) => {
                const angle = (i * 30) + 15; // Center of each sign
                const rad = (angle - 90) * Math.PI / 180;
                const x = Math.cos(rad) * 46 + 50;
                const y = Math.sin(rad) * 46 + 50;
                
                return (
                  <div 
                    key={sign}
                    className="absolute text-xs font-bold text-center transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      color: ZODIAC_COLORS[i].includes('red') ? '#fca5a5' :
                             ZODIAC_COLORS[i].includes('orange') ? '#fb923c' :
                             ZODIAC_COLORS[i].includes('yellow') ? '#fbbf24' :
                             ZODIAC_COLORS[i].includes('green') ? '#4ade80' :
                             ZODIAC_COLORS[i].includes('blue') ? '#60a5fa' :
                             ZODIAC_COLORS[i].includes('purple') ? '#c084fc' :
                             ZODIAC_COLORS[i].includes('pink') ? '#f472b6' :
                             ZODIAC_COLORS[i].includes('gray') ? '#9ca3af' : '#e5e7eb'
                    }}
                  >
                    {sign}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render planet positions in a table
  const renderPlanetTable = () => (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Planetary Positions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.positions.map((planetData) => (
          <div key={planetData.planet} className="flex items-center p-2 bg-slate-800 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
              {PLANET_NAMES[planetData.planet]?.[0] || planetData.planet[0]}
            </div>
            <div>
              <div className="font-medium">{PLANET_NAMES[planetData.planet] || planetData.planet}</div>
              <div className="text-sm text-slate-300">
                {planetData.sign} {planetData.degree}°{planetData.minute}'
                {` (House ${planetData.house})`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render aspect grid
  const renderAspectGrid = () => (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Aspects</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Planets</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Aspect</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Orb</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Exact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {data.aspects.map((aspect, i) => (
              <tr key={i}>
                <td className="px-4 py-2 text-sm">
                  {PLANET_NAMES[aspect.planet1.name] || aspect.planet1.name} 
                  {PLANET_NAMES[aspect.planet2.name] || aspect.planet2.name}
                </td>
                <td className="px-4 py-2 text-sm">{aspect.type}</td>
                <td className="px-4 py-2 text-sm">{aspect.orb}°</td>
                <td className="px-4 py-2 text-sm">{aspect.exact ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {renderZodiacWheel()}
      {renderPlanetTable()}
      {renderAspectGrid()}
    </div>
  );
}; 
