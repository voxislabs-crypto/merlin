// Core planetary data and interpretations
export const PLANET_MEANINGS = {
  SUN: {
    name: 'Sun',
    symbol: '☉',
    color: '#F59E0B',
    glyph: '\u2609',
    description: 'Core identity, ego, and life purpose',
    houseMeanings: {
      1: 'Strong sense of self, natural leadership abilities',
      2: 'Value-driven, finds identity through possessions',
      3: 'Expressive communicator, curious mind',
      4: 'Deeply connected to family and roots',
      5: 'Creative self-expression, romantic nature',
      6: 'Finds identity through service and work',
      7: 'Identity through partnerships',
      8: 'Transformative, interested in mysteries',
      9: 'Philosophical, seeks meaning and adventure',
      10: 'Career-focused, ambitious',
      11: 'Identity through groups and friendships',
      12: 'Spiritual, private, selfless'
    },
    signMeanings: {
      ARIES: 'Bold, independent, pioneering spirit',
      TAURUS: 'Steady, determined, values comfort',
      GEMINI: 'Curious, adaptable, communicative',
      CANCER: 'Nurturing, sensitive, protective',
      LEO: 'Confident, creative, generous',
      VIRGO: 'Analytical, practical, service-oriented',
      LIBRA: 'Diplomatic, relationship-focused, fair',
      SCORPIO: 'Intense, transformative, perceptive',
      SAGITTARIUS: 'Optimistic, adventurous, philosophical',
      CAPRICORN: 'Ambitious, disciplined, responsible',
      AQUARIUS: 'Innovative, independent, humanitarian',
      PISCES: 'Compassionate, intuitive, artistic'
    }
  },
  MOON: {
    name: 'Moon',
    symbol: '☽',
    color: '#93C5FD',
    glyph: '\u263D',
    description: 'Emotional nature, instincts, and inner self',
    // ... (similar structure for all signs/houses)
  },
  MERCURY: {
    name: 'Mercury',
    symbol: '☿',
    color: '#9CA3AF',
    glyph: '\u263F',
    description: 'Communication, thinking style, and learning',
    // ...
  },
  VENUS: {
    name: 'Venus',
    symbol: '♀',
    color: '#FCD34D',
    glyph: '\u2640',
    description: 'Love, beauty, values, and relationships',
    // ...
  },
  MARS: {
    name: 'Mars',
    symbol: '♂',
    color: '#EF4444',
    glyph: '\u2642',
    description: 'Energy, drive, and how you take action',
    // ...
  },
  JUPITER: {
    name: 'Jupiter',
    symbol: '♃',
    color: '#F59E0B',
    glyph: '\u2643',
    description: 'Growth, luck, and expansion',
    // ...
  },
  SATURN: {
    name: 'Saturn',
    symbol: '♄',
    color: '#94A3B8',
    glyph: '\u2644',
    description: 'Discipline, responsibility, and life lessons',
    // ...
  },
  URANUS: {
    name: 'Uranus',
    symbol: '♅',
    color: '#60A5FA',
    glyph: '\u2645',
    description: 'Innovation, rebellion, and sudden changes',
    // ...
  },
  NEPTUNE: {
    name: 'Neptune',
    symbol: '♆',
    color: '#3B82F6',
    glyph: '\u2646',
    description: 'Intuition, dreams, and spirituality',
    // ...
  },
  PLUTO: {
    name: 'Pluto',
    symbol: '♇',
    color: '#8B5CF6',
    glyph: '\u2647',
    description: 'Transformation, power, and rebirth',
    // ...
  },
  CHIRON: {
    name: 'Chiron',
    symbol: '⚷',
    color: '#10B981',
    glyph: '\u26B7',
    description: 'Wounding and healing',
    // ...
  },
  NORTH_NODE: {
    name: 'North Node',
    symbol: '☊',
    color: '#EC4899',
    glyph: '\u260A',
    description: 'Life purpose and growth direction',
    // ...
  },
  SOUTH_NODE: {
    name: 'South Node',
    symbol: '☋',
    color: '#EC4899',
    glyph: '\u260B',
    description: 'Past life and comfort zone',
    // ...
  }
} as const

export const PLANET_ORDER = [
  'SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS',
  'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO',
  'CHIRON', 'NORTH_NODE', 'SOUTH_NODE'
] as const

export const ZODIAC_SIGNS = [
  'ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO',
  'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES'
] as const

export const HOUSES = [
  '1st', '2nd', '3rd', '4th', '5th', '6th',
  '7th', '8th', '9th', '10th', '11th', '12th'
] as const

// Aspect orbs (in degrees)
export const ASPECT_ORBS = {
  CONJUNCTION: 10,
  OPPOSITION: 8,
  TRINE: 8,
  SQUARE: 7,
  SEXTILE: 5,
  QUINCUNX: 3,
  SEMISEXTILE: 2,
  SEMISQUARE: 2,
  SESQUIQUADRATE: 2,
  QUINTILE: 2,
  BIQUINTILE: 2
} as const

export const ASPECT_MEANINGS = {
  CONJUNCTION: {
    name: 'Conjunction',
    symbol: '☌',
    color: '#F59E0B',
    description: 'Planets blend their energies together',
    influence: 'Intensifies and combines planetary energies',
    orb: 10
  },
  OPPOSITION: {
    name: 'Opposition',
    symbol: '☍',
    color: '#EF4444',
    description: 'Planets face each other in tension',
    influence: 'Creates awareness through contrast and challenge',
    orb: 8
  },
  TRINE: {
    name: 'Trine',
    symbol: '△',
    color: '#10B981',
    description: 'Planets in harmonious element',
    influence: 'Natural flow of energy, talents, and opportunities',
    orb: 8
  },
  SQUARE: {
    name: 'Square',
    symbol: '□',
    color: '#F59E0B',
    description: 'Planets in challenging aspect',
    influence: 'Creates tension and motivation for growth',
    orb: 7
  },
  SEXTILE: {
    name: 'Sextile',
    symbol: '⚹',
    color: '#3B82F6',
    description: 'Planets in supportive aspect',
    influence: 'Opportunities for growth and development',
    orb: 5
  },
  QUINCUNX: {
    name: 'Quincunx',
    symbol: '⚻',
    color: '#8B5CF6',
    description: 'Planets in awkward aspect',
    influence: 'Requires adjustment and integration',
    orb: 3
  }
} as const

export const ELEMENTS = {
  FIRE: {
    signs: ['ARIES', 'LEO', 'SAGITTARIUS'],
    color: '#EF4444',
    traits: ['Energetic', 'Passionate', 'Spontaneous', 'Courageous']
  },
  EARTH: {
    signs: ['TAURUS', 'VIRGO', 'CAPRICORN'],
    color: '#10B981',
    traits: ['Practical', 'Reliable', 'Sensible', 'Grounded']
  },
  AIR: {
    signs: ['GEMINI', 'LIBRA', 'AQUARIUS'],
    color: '#3B82F6',
    traits: ['Intellectual', 'Social', 'Idea-oriented', 'Communicative']
  },
  WATER: {
    signs: ['CANCER', 'SCORPIO', 'PISCES'],
    color: '#8B5CF6',
    traits: ['Emotional', 'Intuitive', 'Compassionate', 'Sensitive']
  }
} as const

export const MODALITIES = {
  CARDINAL: {
    signs: ['ARIES', 'CANCER', 'LIBRA', 'CAPRICORN'],
    color: '#EC4899',
    traits: ['Initiating', 'Action-oriented', 'Ambitious', 'Dynamic']
  },
  FIXED: {
    signs: ['TAURUS', 'LEO', 'SCORPIO', 'AQUARIUS'],
    color: '#F59E0B',
    traits: ['Stable', 'Determined', 'Persistent', 'Resistant to change']
  },
  MUTABLE: {
    signs: ['GEMINI', 'VIRGO', 'SAGITTARIUS', 'PISCES'],
    color: '#10B981',
    traits: ['Adaptable', 'Flexible', 'Versatile', 'Changeable']
  }
} as const

export const PLANETARY_RULERSHIPS = {
  ARIES: 'MARS',
  TAURUS: 'VENUS',
  GEMINI: 'MERCURY',
  CANCER: 'MOON',
  LEO: 'SUN',
  VIRGO: 'MERCURY',
  LIBRA: 'VENUS',
  SCORPIO: ['MARS', 'PLUTO'],
  SAGITTARIUS: 'JUPITER',
  CAPRICORN: 'SATURN',
  AQUARIUS: ['URANUS', 'SATURN'],
  PISCES: ['JUPITER', 'NEPTUNE']
} as const

export const HOUSE_MEANINGS = {
  1: {
    name: 'First House',
    ruler: 'MARS',
    keywords: ['Self', 'Appearance', 'First Impressions', 'Approach to Life'],
    description: 'Represents your identity, self-image, and how you present yourself to the world.'
  },
  2: {
    name: 'Second House',
    ruler: 'VENUS',
    keywords: ['Values', 'Possessions', 'Wealth', 'Self-Worth'],
    description: 'Governs material resources, personal values, and sense of self-worth.'
  },
  // ... (add all 12 houses)
} as const

// Aspect patterns
export const ASPECT_PATTERNS = {
  GRAND_TRINE: {
    name: 'Grand Trine',
    description: 'Three planets forming a triangle in the same element',
    influence: 'Natural talents and ease in the element of the trine',
    color: '#10B981'
  },
  T_SQUARE: {
    name: 'T-Square',
    description: 'Two planets in opposition, both square a third planet',
    influence: 'Tension and motivation to overcome challenges',
    color: '#F59E0B'
  },
  GRAND_CROSS: {
    name: 'Grand Cross',
    description: 'Four planets forming a cross with square and opposition aspects',
    influence: 'Intense challenges and potential for great achievement',
    color: '#EF4444'
  },
  MYSTIC_RECTANGLE: {
    name: 'Mystic Rectangle',
    description: 'Two oppositions connected by sextiles and trines',
    influence: 'Harmonious integration of opposing forces',
    color: '#8B5CF6'
  },
  KITE: {
    name: 'Kite',
    description: 'Grand Trine with an additional planet opposite one point',
    influence: 'Focused energy and manifestation potential',
    color: '#3B82F6'
  },
  YOD: {
    name: 'Yod',
    description: 'Two planets sextile, both quincunx a third',
    influence: 'Fateful or karmic connections and adjustments',
    color: '#EC4899'
  }
} as const
