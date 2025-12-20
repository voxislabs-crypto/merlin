import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PLANET_MEANINGS } from '@/lib/astrology/planetaryData';
import {
  PlanetPosition,
  HousePosition,
  Aspect,
  BirthChartData,
  BirthChartProps as BaseBirthChartProps,
  PLANET_GLYPHS,
  PLANET_COLORS,
  ZODIAC_SIGNS,
  ZODIAC_COLORS,
  ASPECT_TYPES
} from '@/lib/astrology/types';

// Extend the base props with any additional ones we need
interface BirthChartProps extends BaseBirthChartProps {
  className?: string;
  showTabs?: boolean;
  defaultTab?: 'chart' | 'planets' | 'aspects';
  onPlanetHover?: (planet: PlanetPosition | null) => void;
  onAspectHover?: (aspect: Aspect | null) => void;
  children?: React.ReactNode;
}

const BirthChartVisualization: React.FC<BirthChartProps> = ({
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

  // Helper function to get zodiac sign color
  const getZodiacSignColor = useCallback((color: string): string => {
    if (color.includes('red')) return '#EF4444';
    if (color.includes('green')) return '#10B981';
    if (color.includes('blue')) return '#3B82F6';
    if (color.includes('yellow')) return '#F59E0B';
    if (color.includes('pink')) return '#EC4899';
    if (color.includes('purple')) return '#8B5CF6';
    if (color.includes('indigo')) return '#6366F1';
    if (color.includes('gray')) return '#9CA3AF';
    return '#E5E7EB';
  }, []);

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

  // Render planet positions in a table
  const renderPlanetTable = useCallback(() => (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Planetary Positions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.planets.map((planet) => (
          <div
            key={planet.name}
            className="flex items-center p-2 bg-slate-800 rounded-lg"
            onMouseEnter={() => handlePlanetHover(planet)}
            onMouseLeave={() => handlePlanetHover(null)}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-3"
              style={{ backgroundColor: PLANET_COLORS[planet.name as keyof typeof PLANET_COLORS] }}
            >
              {PLANET_GLYPHS[planet.name as keyof typeof PLANET_GLYPHS] || planet.name[0]}
            </div>
            <div>
              <div className="font-medium">
                {planet.name.charAt(0).toUpperCase() + planet.name.slice(1).toLowerCase()}
              </div>
              <div className="text-sm text-gray-400">
                {planet.sign} {planet.degree}°
                {planet.house && ` • House ${planet.house}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ), [data.planets, handlePlanetHover]);

  // Render aspect grid
  const renderAspectGrid = useCallback(() => (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Aspects</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Planets</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Aspect</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Orb</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Exact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.aspects?.map((aspect, index) => {
              const aspectType = ASPECT_TYPES[aspect.type as keyof typeof ASPECT_TYPES];
              return (
                <tr
                  key={index}
                  onMouseEnter={() => handleAspectHover(aspect)}
                  onMouseLeave={() => handleAspectHover(null)}
                  className="hover:bg-slate-800/50 cursor-pointer"
                >
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2">
                        {PLANET_GLYPHS[aspect.planet1.name as keyof typeof PLANET_GLYPHS] || aspect.planet1.name[0]}
                      </span>
                      <span className="mx-1">-</span>
                      <span className="ml-2">
                        {PLANET_GLYPHS[aspect.planet2.name as keyof typeof PLANET_GLYPHS] || aspect.planet2.name[0]}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span style={{ color: aspectType?.color || '#fff' }}>
                      {aspectType?.name || aspect.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{aspect.orb.toFixed(1)}°</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {aspect.exact ? 'Yes' : 'No'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  ), [data.aspects, handleAspectHover]);

  // Render the zodiac wheel with planets and aspects
  const renderZodiacWheel = useCallback((): JSX.Element => {
    const { planets = [], aspects = [] } = data;

    return (
      <div className="relative w-full max-w-md mx-auto aspect-square">
        {/* Outer decorative ring */}
        <div className="absolute inset-0 rounded-full bg-linear-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20 border-2 border-purple-500/30 shadow-2xl">
          {/* Inner chart area */}
          <div className="absolute inset-2 rounded-full bg-linear-to-br from-slate-900 to-black border border-purple-300/10">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Zodiac signs */}
              {ZODIAC_SIGNS.map((sign, i) => {
                const angle = (i * 30) - 15; // 30 degrees per sign, offset by 15 to center
                const rad = (angle * Math.PI) / 180;
                const x = Math.cos(rad) * 46 + 50;
                const y = Math.sin(rad) * 46 + 50;

                return (
                  <text
                    key={sign}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-xs font-medium ${ZODIAC_COLORS[i]}`}
                    style={{
                      fill: getZodiacSignColor(ZODIAC_COLORS[i])
                    }}
                  >
                    {sign[0]}
                  </text>
                );
              })}

              {/* Aspect lines */}
              {aspects.map((aspect, i) => {
                const p1 = planets.find(p => p.name === aspect.planet1.name);
                const p2 = planets.find(p => p.name === aspect.planet2.name);
                const aspectType = ASPECT_TYPES[aspect.type as keyof typeof ASPECT_TYPES];

                if (!p1 || !p2 || !aspectType) return null;

                const angle1 = ((p1.longitude - 15) * Math.PI) / 180;
                const angle2 = ((p2.longitude - 15) * Math.PI) / 180;
                const x1 = Math.cos(angle1) * 40 + 50;
                const y1 = Math.sin(angle1) * 40 + 50;
                const x2 = Math.cos(angle2) * 40 + 50;
                const y2 = Math.sin(angle2) * 40 + 50;

                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={aspectType.color}
                    strokeWidth={hoveredAspect === aspect ? 2 : 1}
                    strokeOpacity={hoveredAspect === null || hoveredAspect === aspect ? 0.7 : 0.2}
                    strokeDasharray={aspect.exact ? 'none' : '3,3'}
                  />
                );
              })}

              {/* Planet positions */}
              {planets.map((planet, i) => {
                const angle = ((planet.longitude - 15) * Math.PI) / 180; // -15 to rotate Aries to the left
                const x = Math.cos(angle) * 30 + 50;
                const y = Math.sin(angle) * 30 + 50;
                const isHovered = hoveredPlanet?.name === planet.name;
                const planetColor = PLANET_COLORS[planet.name as keyof typeof PLANET_COLORS] || '#fff';

                return (
                  <g
                    key={planet.name}
                    onMouseEnter={() => handlePlanetHover(planet)}
                    onMouseLeave={() => handlePlanetHover(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 5 : 3.5}
                      fill={planetColor}
                      stroke={isHovered ? '#fff' : 'none'}
                      strokeWidth={isHovered ? 1.5 : 0}
                    />
                    {isHovered && (
                      <text
                        x={x + (x > 50 ? 5 : -5)}
                        y={y + 4}
                        textAnchor={x > 50 ? 'start' : 'end'}
                        fill="#fff"
                        fontSize="6"
                        className="font-medium"
                      >
                        {planet.name}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    );
  }, [data.planets, data.aspects, hoveredPlanet, hoveredAspect, handlePlanetHover, getZodiacSignColor]);

  // Main render
  return (
    <div className={`relative ${className}`}>
      {/* Tab navigation */}
      {showTabs && (
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {['chart', 'planets', 'aspects'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab as 'chart' | 'planets' | 'aspects')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                } ${tab === 'chart' ? 'rounded-l-lg' : ''} ${
                  tab === 'aspects' ? 'rounded-r-lg' : 'border-r border-slate-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
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
          {activeTab === 'aspects' && data.aspects?.length ? (
            renderAspectGrid()
          ) : activeTab === 'aspects' ? (
            <div className="text-center py-8 text-gray-400">No aspects found</div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {children}
    </div>
  );
};

export default BirthChartVisualization;
