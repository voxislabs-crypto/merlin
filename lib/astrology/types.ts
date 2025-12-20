// lib/astrology/types.ts

export interface PlanetPosition {
  name: string;
  longitude: number;
  latitude: number;
  distance?: number;
  speed?: number;
  sign: string;
  degree: number;
  minute?: number;
  second?: number;
  house: number;
  meaning?: Record<string, any>;
}

export interface HousePosition {
  house: number;
  position: number;
  sign: string;
  degree: number;
  minute?: number;
  second?: number;
}

export interface Aspect {
  planet1: { name: string; longitude: number };
  planet2: { name: string; longitude: number };
  type: string;
  orb: number;
  exact: boolean;
  meaning?: Record<string, any>;
}

export interface BirthChartData {
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
}

export interface BirthChartProps {
  data: BirthChartData;
  className?: string;
  showTabs?: boolean;
  defaultTab?: 'chart' | 'planets' | 'aspects';
  onPlanetHover?: (planet: PlanetPosition | null) => void;
  onAspectHover?: (aspect: Aspect | null) => void;
}

// Aspect types with their orb limits
export const ASPECT_TYPES = {
  CONJUNCTION: { degrees: 0, orb: 10, name: 'Conjunction', color: '#8B5CF6' },
  OPPOSITION: { degrees: 180, orb: 8, name: 'Opposition', color: '#EF4444' },
  TRINE: { degrees: 120, orb: 8, name: 'Trine', color: '#10B981' },
  SQUARE: { degrees: 90, orb: 8, name: 'Square', color: '#F59E0B' },
  SEXTILE: { degrees: 60, orb: 6, name: 'Sextile', color: '#3B82F6' },
  QUINTILE: { degrees: 72, orb: 3, name: 'Quintile', color: '#8B5CF6' },
  BIQUINTILE: { degrees: 144, orb: 3, name: 'Biquintile', color: '#A78BFA' },
  SEMISEXTILE: { degrees: 30, orb: 3, name: 'Semisextile', color: '#6B7280' },
  SEMISQUARE: { degrees: 45, orb: 3, name: 'Semisquare', color: '#F59E0B' },
  SESQUIQUADRATE: { degrees: 135, orb: 3, name: 'Sesquiquadrate', color: '#F59E0B' },
  QUINCUNX: { degrees: 150, orb: 3, name: 'Quincunx', color: '#EC4899' },
} as const;

export type AspectType = keyof typeof ASPECT_TYPES;

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
};

export const PLANET_COLORS: Record<string, string> = {
  SUN: '#F59E0B',
  MOON: '#E5E7EB',
  MERCURY: '#9CA3AF',
  VENUS: '#FCD34D',
  MARS: '#EF4444',
  JUPITER: '#F59E0B',
  SATURN: '#94A3B8',
  URANUS: '#60A5FA',
  NEPTUNE: '#3B82F6',
  PLUTO: '#8B5CF6',
  IMMUM_COELI: '#8B5CF6',
  NORTH_NODE: '#10B981',
  SOUTH_NODE: '#EC4899',
  CHIRON: '#8B5CF6',
};

// Zodiac signs and their colors
export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

export const ZODIAC_COLORS = [
  'text-red-500', 'text-green-500', 'text-yellow-500',
  'text-blue-400', 'text-yellow-500', 'text-green-500',
  'text-pink-400', 'text-red-600', 'text-purple-500',
  'text-gray-500', 'text-blue-400', 'text-indigo-400'
] as const;
