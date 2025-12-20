import React, { useState, useCallback, FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PLANET_MEANINGS } from '@/lib/astrology/planetaryData';
import {
  PlanetPosition,
  HousePosition,
  Aspect,
  BirthChartData,
  PLANET_GLYPHS,
  PLANET_COLORS,
  ZODIAC_SIGNS,
  ZODIAC_COLORS as ZODIAC_COLORS_IMPORTED,
  AspectType
} from '@/lib/astrology/types';

// Local type for aspect configuration
interface AspectConfig {
  degrees: number;
  orb: number;
  name: string;
  color: string;
}

// Aspect configuration
const ASPECT_CONFIGS: Record<string, AspectConfig> = {
  CONJUNCTION: { degrees: 0, orb: 10, name: 'Conjunction', color: '#8B5CF6' },
  OPPOSITION: { degrees: 180, orb: 8, name: 'Opposition', color: '#EF4444' },
  TRINE: { degrees: 120, orb: 7, name: 'Trine', color: '#10B981' },
  SQUARE: { degrees: 90, orb: 7, name: 'Square', color: '#F59E0B' },
  SEXTILE: { degrees: 60, orb: 5, name: 'Sextile', color: '#3B82F6' },
  QUINTILE: { degrees: 72, orb: 2, name: 'Quintile', color: '#8B5CF6' },
  BIQUINTILE: { degrees: 144, orb: 2, name: 'Biquintile', color: '#8B5CF6' },
  SEMISEXTILE: { degrees: 30, orb: 2, name: 'Semisextile', color: '#6B7280' },
  SEMISQUARE: { degrees: 45, orb: 2, name: 'Semisquare', color: '#F59E0B' },
  SESQUIQUADRATE: { degrees: 135, orb: 2, name: 'Sesquiquadrate', color: '#F59E0B' },
  QUINCUNX: { degrees: 150, orb: 2, name: 'Quincunx', color: '#8B5CF6' }
} as const;

// Use imported ZODIAC_COLORS or fallback to local
const ZODIAC_COLORS = ZODIAC_COLORS_IMPORTED || [
  '#FF6B6B', '#4CAF50', '#2196F3', '#9C27B0', '#FFC107', '#8BC34A',
  '#E91E63', '#673AB7', '#3F51B5', '#009688', '#FF5722', '#795548'
];

interface BirthChartProps {
  data: {
    planets: PlanetPosition[];
    houses: HousePosition[];
    aspects?: Aspect[];
    birthData?: {
      date: string;
      location: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    };
  };
  className?: string;
  showTabs?: boolean;
  defaultTab?: 'chart' | 'planets' | 'aspects';
  onPlanetHover?: (planet: PlanetPosition | null) => void;
  onAspectHover?: (aspect: Aspect | null) => void;
  children?: React.ReactNode;
}

const BirthChartVisualization: FC<BirthChartProps> = ({
  data,
  className = '',
  showTabs = true,
  defaultTab = 'chart',
  onPlanetHover,
  onAspectHover,
  children,
}) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'planets' | 'aspects'>(defaultTab);
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetPosition | null>(null);
  const [hoveredAspect, setHoveredAspect] = useState<Aspect | null>(null);

  // Handle planet hover events
  const handlePlanetHover = useCallback((planet: PlanetPosition | null) => {
    setHoveredPlanet(planet);
    if (onPlanetHover) onPlanetHover(planet);
  }, [onPlanetHover]);

  // Handle aspect hover events
  const handleAspectHover = useCallback((aspect: Aspect | null) => {
    setHoveredAspect(aspect);
    if (onAspectHover) onAspectHover(aspect);
  }, [onAspectHover]);

  // Helper function to get aspect type info
  const getAspectConfig = (type: string): AspectConfig => {
    if (!type) {
      return { degrees: 0, orb: 2, name: 'Unknown', color: '#666' };
    }
    const config = ASPECT_CONFIGS[type as keyof typeof ASPECT_CONFIGS];
    return config || {
      degrees: 0,
      orb: 2,
      name: type,
      color: '#666'
    };
  };

  // Get aspect type from aspect object
  const getAspectType = (aspect: Aspect): AspectType => {
    if (!aspect || !aspect.type) return 'CONJUNCTION';
    return typeof aspect.type === 'string' ? aspect.type.toUpperCase() as AspectType : aspect.type;
  };

  // Helper to get zodiac sign color
  const getZodiacSignColor = (sign: string): string => {
    if (!ZODIAC_SIGNS) return '#666';
    const signIndex = ZODIAC_SIGNS.findIndex(s =>
      s && sign && s.toLowerCase() === sign.toLowerCase()
    );
    return signIndex >= 0 && ZODIAC_COLORS[signIndex]
      ? ZODIAC_COLORS[signIndex]
      : '#666';
  };

  // Render the zodiac wheel with planets and aspects
  const renderZodiacWheel = useCallback(() => {
    const { planets = [], aspects = [] } = data;

    return (
      <div className="relative w-full max-w-2xl mx-auto aspect-square">
        {/* Wheel base */}
        <div className="absolute inset-0 rounded-full border-2 border-slate-700">
          {/* Wheel segments */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30) - 15; // Offset by 15 degrees to center the signs
            const sign = ZODIAC_SIGNS[i];
            const color = getZodiacSignColor(sign);

            return (
              <div
                key={sign}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: 'center',
                }}
              >
                <div
                  className="w-1/2 h-1/2 flex items-end justify-center pb-2 text-xs font-medium"
                  style={{ color }}
                >
                  {sign[0]}
                </div>
              </div>
            );
          })}

          {/* Planets */}
          {planets.map((planet) => {
            const angle = planet.longitude - 90; // 0° at the top
            const radius = 45; // percentage of container
            const x = 50 + Math.cos(angle * Math.PI / 180) * radius;
            const y = 50 + Math.sin(angle * Math.PI / 180) * radius;
            const isHovered = hoveredPlanet?.name === planet.name;

            return (
              <div
                key={planet.name}
                className="absolute flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-125"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isHovered ? 10 : 5,
                }}
                onMouseEnter={() => handlePlanetHover(planet)}
                onMouseLeave={() => handlePlanetHover(null)}
                title={`${planet.name} in ${planet.sign} (${Math.floor(planet.longitude % 30)}°)`}
              >
                <span
                  className={`text-2xl ${isHovered ? 'text-yellow-400' : ''}`}
                  style={{ color: PLANET_COLORS[planet.name] || '#9CA3AF' }}
                >
                  {PLANET_GLYPHS[planet.name] || planet.name[0]}
                </span>
                {isHovered && (
                  <div className="absolute -bottom-8 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {planet.name} in {planet.sign}
                  </div>
                )}
              </div>
            );
          })}

          {/* Aspect lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {aspects.map((aspect, i) => {
              const planet1 = planets.find(p => p.name === aspect.planet1.name);
              const planet2 = planets.find(p => p.name === aspect.planet2.name);

              if (!planet1 || !planet2) return null;

              const angle1 = planet1.longitude - 90;
              const angle2 = planet2.longitude - 90;
              const radius = 50;

              const x1 = 50 + Math.cos(angle1 * Math.PI / 180) * radius;
              const y1 = 50 + Math.sin(angle1 * Math.PI / 180) * radius;
              const x2 = 50 + Math.cos(angle2 * Math.PI / 180) * radius;
              const y2 = 50 + Math.sin(angle2 * Math.PI / 180) * radius;

              const aspectType = getAspectConfig(aspect.type);
              const isHovered = hoveredAspect?.type === aspect.type &&
                              hoveredAspect.planet1 === aspect.planet1 &&
                              hoveredAspect.planet2 === aspect.planet2;

              return (
                <line
                  key={i}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke={isHovered ? '#F59E0B' : (aspectType?.color || '#6B7280')}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  strokeDasharray={aspect.type === 'conjunction' ? '0' : '4,4'}
                  className="transition-all duration-200"
                  onMouseEnter={() => handleAspectHover(aspect)}
                  onMouseLeave={() => handleAspectHover(null)}
                />
              );
            })}
          </svg>
        </div>
      </div>
    );
  }, [hoveredPlanet, hoveredAspect, handlePlanetHover, handleAspectHover]);

  // Render planet information table
  const renderPlanetTable = useCallback(() => (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Planetary Positions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.planets?.map((planet) => {
          const planetInfo = PLANET_MEANINGS[planet.name as keyof typeof PLANET_MEANINGS];
          const sign = ZODIAC_SIGNS[Math.floor(planet.longitude / 30)];
          const degree = Math.floor(planet.longitude % 30);
          const minutes = Math.floor((planet.longitude % 1) * 60);

          return (
            <div
              key={planet.name}
              className={`p-4 rounded-lg border ${
                hoveredPlanet?.name === planet.name ? 'border-purple-500 bg-purple-900/20' : 'border-slate-700 bg-slate-800/50'
              } transition-colors`}
              onMouseEnter={() => handlePlanetHover(planet)}
              onMouseLeave={() => handlePlanetHover(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl" style={{ color: PLANET_COLORS[planet.name] }}>
                    {PLANET_GLYPHS[planet.name] || planet.name[0]}
                  </span>
                  <div>
                    <h4 className="font-medium text-white">{planetInfo?.name || planet.name}</h4>
                    <p className="text-sm text-gray-300">
                      {sign} {degree}°{minutes < 10 ? '0' : ''}{minutes}'
                      <span className="ml-2 text-xs text-gray-400">House {planet.house}</span>
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">
                  {planet.speed && Math.abs(planet.speed) > 0.1 ? (
                    planet.speed > 0 ? 'Direct' : 'Retrograde'
                  ) : 'Stationary'}
                </span>
              </div>
              {planetInfo?.description && (
                <p className="mt-2 text-sm text-gray-300">
                  {planetInfo.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  ), [data.planets, hoveredPlanet, handlePlanetHover]);

  // Render aspect grid
  const renderAspectGrid = useCallback(() => (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Aspects</h3>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 gap-4">
          {data.aspects?.map((aspect, i) => {
            const planet1 = data.planets?.find(p => p.name === aspect.planet1.name);
            const planet2 = data.planets?.find(p => p.name === aspect.planet2.name);

            if (!planet1 || !planet2) return null;

            const aspectType = getAspectConfig(aspect.type);
            const isHovered = hoveredAspect?.type === aspect.type &&
                            hoveredAspect.planet1.name === aspect.planet1.name &&
                            hoveredAspect.planet2.name === aspect.planet2.name;

            return (
              <div
                key={i}
                className={`p-4 rounded-lg border ${
                  isHovered ? 'border-purple-500 bg-purple-900/20' : 'border-slate-700 bg-slate-800/50'
                } transition-colors`}
                onMouseEnter={() => handleAspectHover(aspect)}
                onMouseLeave={() => handleAspectHover(null)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg" style={{ color: PLANET_COLORS[planet1.name] }}>
                      {PLANET_GLYPHS[planet1.name] || planet1.name[0]}
                    </span>
                    <span className="font-medium text-white">{planet1.name}</span>
                    <span className="text-gray-400">{getAspectConfig(aspect.type).name}</span>
                    <span className="text-lg" style={{ color: PLANET_COLORS[planet2.name] }}>
                      {PLANET_GLYPHS[planet2.name] || planet2.name[0]}
                    </span>
                    <span className="font-medium text-white">{planet2.name}</span>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: isHovered ? '#8B5CF6' : '#374151',
                      color: 'white'
                    }}
                  >
                    {Math.round(aspect.orb * 10) / 10}° orb
                  </span>
                </div>
                {aspect.meaning?.description && (
                  <p className="mt-2 text-sm text-gray-300">
                    {aspect.meaning.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  ), [data.aspects, hoveredAspect, handleAspectHover]);

  return (
    <div className={`space-y-8 ${className}`}>
      {showTabs && (
        <div className="flex border-b border-slate-700">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'chart'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('chart')}
          >
            Chart
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'planets'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('planets')}
          >
            Planets
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'aspects'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('aspects')}
          >
            Aspects
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'chart' && renderZodiacWheel()}
          {activeTab === 'planets' && renderPlanetTable()}
          {activeTab === 'aspects' && renderAspectGrid()}
        </motion.div>
      </AnimatePresence>

      {children}
    </div>
  );
};

export default BirthChartVisualization;
