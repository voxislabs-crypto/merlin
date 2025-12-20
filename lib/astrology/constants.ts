// lib/astrology/constants.ts

// Aspect types with their orb limits
export const ASPECT_TYPES = {
  CONJUNCTION: { degrees: 0, orb: 10, name: 'Conjunction', color: '#8B5CF6' },
  OPPOSITION: { degrees: 180, orb: 8, name: 'Opposition', color: '#EF4444' },
  TRINE: { degrees: 120, orb: 8, name: 'Trine', color: '#10B981' },
  SQUARE: { degrees: 90, orb: 8, name: 'Square', color: '#F59E0B' },
  SEXTILE: { degrees: 60, orb: 6, name: 'Sextile', color: '#3B82F6' },
  QUINCUNX: { degrees: 150, orb: 3, name: 'Quincunx', color: '#8B5CF6' },
  SEMI_SEXTILE: { degrees: 30, orb: 3, name: 'Semi-Sextile', color: '#6B7280' },
  SEMI_SQUARE: { degrees: 45, orb: 3, name: 'Semi-Square', color: '#F59E0B' },
  SEPTILE: { degrees: 51.43, orb: 2, name: 'Septile', color: '#8B5CF6' },
  NOVILE: { degrees: 40, orb: 2, name: 'Novile', color: '#8B5CF6' },
  QUINTILE: { degrees: 72, orb: 2, name: 'Quintile', color: '#8B5CF6' },
  BIQUINTILE: { degrees: 144, orb: 2, name: 'Biquintile', color: '#8B5CF6' }
} as const;

// Planet glyphs and colors
export const PLANET_GLYPHS: Record<string, string> = {
  SUN: '☉',
  MOON: '☽',
  MERCURY: '☿',
  VENUS: '♀',
  MARS: '♂',
  JUPITER: '♃',
  SATURN: '♄',
  URANUS: '♅',
  NEPTUNE: '♆',
  PLUTO: '♇',
  NORTH_NODE: '☊',
  SOUTH_NODE: '☋',
  CHIRON: '⚷',
  VERTEX: 'Vx',
  PARS_FORTUNA: '⊕',
  LILITH: '⚸',
  SELENA: '⚳',
  FORTUNA: '⊗',
  ASCENDANT: 'Asc',
  DESCENDANT: 'Dsc',
  MIDHEAVEN: 'MC',
  IMMUM_COELI: 'IC'
};

export const PLANET_COLORS: Record<string, string> = {
  SUN: '#F59E0B',
  MOON: '#93C5FD',
  MERCURY: '#9CA3AF',
  VENUS: '#F472B6',
  MARS: '#EF4444',
  JUPITER: '#F59E0B',
  SATURN: '#6B7280',
  URANUS: '#60A5FA',
  NEPTUNE: '#8B5CF6',
  PLUTO: '#7C3AED',
  NORTH_NODE: '#10B981',
  SOUTH_NODE: '#10B981',
  CHIRON: '#8B5CF6',
  VERTEX: '#EC4899',
  PARS_FORTUNA: '#F59E0B',
  LILITH: '#8B5CF6',
  SELENA: '#F59E0B',
  FORTUNA: '#F59E0B',
  ASCENDANT: '#3B82F6',
  DESCENDANT: '#EC4899',
  MIDHEAVEN: '#10B981',
  IMMUM_COELI: '#8B5CF6'
};

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

export const ZODIAC_COLORS = [
  'text-red-500', 'text-green-500', 'text-yellow-500',
  'text-blue-400', 'text-yellow-500', 'text-green-500',
  'text-pink-400', 'text-red-600', 'text-purple-500',
  'text-gray-500', 'text-blue-400', 'text-indigo-400'
];
