// Astrological constants used throughout the application

export const PLANET_WEIGHTS: Record<string, number> = {
  SUN: 5,
  MOON: 5,
  MERCURY: 4,
  VENUS: 4,
  MARS: 4,
  JUPITER: 3,
  SATURN: 3,
  URANUS: 2,
  NEPTUNE: 2,
  PLUTO: 2,
  NORTH_NODE: 2,
  SOUTH_NODE: 2,
  CHIRON: 2,
  VERTEX: 1,
  FORTUNE: 1,
  JUNO: 1,
  DESCENDANT: 1,
  MIDHEAVEN: 1,
  PART_OF_FORTUNE: 1,
} as const;

export const ASPECT_STRENGTH: Record<string, number> = {
  CONJUNCTION: 5,
  OPPOSITION: 4,
  SQUARE: 4,
  TRINE: 3,
  SEXTILE: 2,
} as const;

// Default orbs for aspects
export const DEFAULT_ORBS: Record<string, number> = {
  CONJUNCTION: 8,
  OPPOSITION: 8,
  SQUARE: 6,
  TRINE: 6,
  SEXTILE: 4,
} as const;

// Aspect colors for visualization
export const ASPECT_COLORS: Record<string, string> = {
  CONJUNCTION: '#FF9800',  // Orange
  OPPOSITION: '#F44336',   // Red
  SQUARE: '#F44336',       // Red
  TRINE: '#4CAF50',        // Green
  SEXTILE: '#2196F3',      // Blue
} as const;

// Planet symbols for display
export const PLANET_SYMBOLS: Record<string, string> = {
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
  FORTUNE: '⊕',
  JUNO: '⚭',
  DESCENDANT: 'Dsc',
  MIDHEAVEN: 'MC',
  PART_OF_FORTUNE: '⊗',
} as const;
