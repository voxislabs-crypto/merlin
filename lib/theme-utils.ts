import { planetWeights, type AspectDefinition } from './aspect-detection.js';
import { resonanceEngine } from './resonance/resonance.service.js';

// Import aspect definitions
import { aspects } from './aspect-detection.js';

export interface Theme {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  aspects: string[]; // Aspect names this theme applies to
  planets: string[]; // Specific planets this theme applies to (empty for all)
  baseWeight: number; // Base weight for this theme (0-1)
  orbMultiplier?: number; // How much orb tightness affects weight (0-1)
  planetMultiplier?: number; // How much planet importance affects weight (0-1)
  resonanceMultiplier?: number; // How much resonance affects weight (0-1)
}

// Comprehensive astrological themes
export const defaultThemes: Theme[] = [
  // Personal Development
  {
    id: 'personal-growth',
    name: 'Personal Growth',
    description: 'Opportunities for self-improvement and skill development',
    keywords: ['growth', 'learning', 'self-improvement', 'development'],
    aspects: ['Conjunction', 'Sextile', 'Trine'],
    planets: ['MERCURY', 'JUPITER', 'NORTH_NODE'],
    baseWeight: 0.7,
    orbMultiplier: 0.3,
    planetMultiplier: 0.4,
    resonanceMultiplier: 0.3,
  },
  {
    id: 'challenge',
    name: 'Challenge',
    description: 'Obstacles and difficulties that build character',
    keywords: ['challenge', 'obstacle', 'difficulty', 'test'],
    aspects: ['Square', 'Opposition'],
    planets: ['MARS', 'SATURN', 'PLUTO'],
    baseWeight: 0.7,
    orbMultiplier: 0.4,
    planetMultiplier: 0.5,
    resonanceMultiplier: 0.1,
  },
  
  // Relationships
  {
    id: 'partnerships',
    name: 'Partnerships',
    description: 'Themes related to one-on-one relationships and collaborations',
    keywords: ['relationships', 'partnership', 'marriage', 'collaboration'],
    aspects: ['Conjunction', 'Sextile', 'Opposition'],
    planets: ['VENUS', 'MARS', 'JUNO', 'DESCENDANT'],
    baseWeight: 0.6,
    orbMultiplier: 0.3,
    planetMultiplier: 0.4,
    resonanceMultiplier: 0.3,
  },
  
  // Career and Public Life
  {
    id: 'career',
    name: 'Career & Public Life',
    description: 'Professional growth and public standing',
    keywords: ['career', 'profession', 'reputation', 'public life'],
    aspects: ['Conjunction', 'Square', 'Trine'],
    planets: ['SUN', 'SATURN', 'MIDHEAVEN'],
    baseWeight: 0.65,
    orbMultiplier: 0.3,
    planetMultiplier: 0.5,
    resonanceMultiplier: 0.2,
  },
  
  // Emotional and Intuitive
  {
    id: 'emotional-depth',
    name: 'Emotional Depth',
    description: 'Deep emotional processing and intuition',
    keywords: ['emotions', 'intuition', 'psychic', 'subconscious'],
    aspects: ['Conjunction', 'Opposition', 'Square'],
    planets: ['MOON', 'NEPTUNE', 'PLUTO'],
    baseWeight: 0.6,
    orbMultiplier: 0.4,
    planetMultiplier: 0.4,
    resonanceMultiplier: 0.2,
  },
  
  // Communication and Learning
  {
    id: 'communication',
    name: 'Communication & Learning',
    description: 'Themes around expression, learning, and information exchange',
    keywords: ['communication', 'learning', 'education', 'expression'],
    aspects: ['Conjunction', 'Sextile', 'Trine'],
    planets: ['MERCURY', 'JUPITER', 'CHIRON'],
    baseWeight: 0.65,
    orbMultiplier: 0.3,
    planetMultiplier: 0.4,
    resonanceMultiplier: 0.3,
  },
  
  // Transformation
  {
    id: 'transformation',
    name: 'Transformation',
    description: 'Profound change and personal transformation',
    keywords: ['transformation', 'change', 'rebirth', 'regeneration'],
    aspects: ['Conjunction', 'Square', 'Opposition'],
    planets: ['PLUTO', 'SATURN', 'SOUTH_NODE'],
    baseWeight: 0.7,
    orbMultiplier: 0.4,
    planetMultiplier: 0.5,
    resonanceMultiplier: 0.1,
  },
  
  // Creativity and Self-Expression
  {
    id: 'creativity',
    name: 'Creativity',
    description: 'Artistic expression and creative endeavors',
    keywords: ['creativity', 'art', 'self-expression', 'inspiration'],
    aspects: ['Trine', 'Sextile', 'Conjunction'],
    planets: ['VENUS', 'NEPTUNE', 'URANUS'],
    baseWeight: 0.6,
    orbMultiplier: 0.3,
    planetMultiplier: 0.4,
    resonanceMultiplier: 0.3,
  },
  
  // Spiritual Growth
  {
    id: 'spirituality',
    name: 'Spiritual Growth',
    description: 'Spiritual development and higher consciousness',
    keywords: ['spirituality', 'enlightenment', 'awakening', 'higher self'],
    aspects: ['Trine', 'Sextile', 'Conjunction'],
    planets: ['NEPTUNE', 'JUPITER', 'NORTH_NODE'],
    baseWeight: 0.65,
    orbMultiplier: 0.3,
    planetMultiplier: 0.4,
    resonanceMultiplier: 0.3,
  },
  
  // Material Success
  {
    id: 'material-success',
    name: 'Material Success',
    description: 'Financial and material achievements',
    keywords: ['wealth', 'success', 'abundance', 'prosperity'],
    aspects: ['Trine', 'Sextile', 'Conjunction'],
    planets: ['JUPITER', 'VENUS', 'PART_OF_FORTUNE'],
    baseWeight: 0.6,
    orbMultiplier: 0.3,
    planetMultiplier: 0.5,
    resonanceMultiplier: 0.2,
  },
  
  // Karmic Lessons
  {
    id: 'karmic-lessons',
    name: 'Karmic Lessons',
    description: 'Soul lessons and karmic patterns',
    keywords: ['karma', 'lessons', 'past life', 'soul growth'],
    aspects: ['Square', 'Opposition', 'Conjunction'],
    planets: ['SOUTH_NODE', 'NORTH_NODE', 'SATURN', 'PLUTO'],
    baseWeight: 0.7,
    orbMultiplier: 0.4,
    planetMultiplier: 0.5,
    resonanceMultiplier: 0.1,
  }
];

export interface ThemeScore {
  theme: Theme;
  score: number;
  factors: {
    base: number;
    orb: number;
    planet: number;
    resonance: number;
  };
}

export async function calculateThemeScores(
  detectedAspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
    score?: number;
  }>,
  userId?: string,
  clusterId?: string
): Promise<ThemeScore[]> {
  const themeScores: Record<string, ThemeScore> = {};
  
  // Initialize all themes with base scores
  for (const theme of defaultThemes) {
    themeScores[theme.id] = {
      theme,
      score: 0,
      factors: {
        base: theme.baseWeight,
        orb: 0,
        planet: 0,
        resonance: 0,
      },
    };
  }

  // Process each aspect
  for (const aspect of detectedAspects) {
    const { planet1, planet2, aspect: aspectName, orb, score: aspectScore = 0 } = aspect;
    
    // Get the aspect definition to find max orb
    const aspectDef = aspects.find((a: AspectDefinition) => a.name === aspectName);
    if (!aspectDef) continue;
    
    // Calculate orb tightness (1 = exact, 0 = at orb edge)
    const orbTightness = 1 - (orb / aspectDef.orb);
    
    // Get planet weights
    const planet1Weight = planetWeights[planet1] || 0.5;
    const planet2Weight = planetWeights[planet2] || 0.5;
    const avgPlanetWeight = (planet1Weight + planet2Weight) / 2;
    
    // Get resonance score if available
    const resonanceScore = aspectScore !== undefined 
      ? (aspectScore + 1) / 2 // Normalize to 0-1
      : 0.5; // Neutral if no score
    
    // Find matching themes
    for (const theme of defaultThemes) {
      // Check if theme applies to this aspect
      const aspectMatch = theme.aspects.includes(aspectName);
      const planetMatch = theme.planets.length === 0 || 
                         theme.planets.includes(planet1) || 
                         theme.planets.includes(planet2);
      
      if (aspectMatch && planetMatch) {
        const themeScore = themeScores[theme.id];
        
        // Calculate weighted score components
        const orbComponent = theme.orbMultiplier ? 
          orbTightness * theme.orbMultiplier : 0;
          
        const planetComponent = theme.planetMultiplier ? 
          avgPlanetWeight * theme.planetMultiplier : 0;
          
        const resonanceComponent = theme.resonanceMultiplier ? 
          resonanceScore * theme.resonanceMultiplier : 0;
        
        // Update theme score
        themeScore.factors.orb = Math.max(themeScore.factors.orb, orbComponent);
        themeScore.factors.planet = Math.max(themeScore.factors.planet, planetComponent);
        themeScore.factors.resonance = Math.max(themeScore.factors.resonance, resonanceComponent);
        
        // Calculate total score (weighted sum of components)
        themeScore.score = theme.baseWeight + 
                          orbComponent + 
                          planetComponent + 
                          resonanceComponent;
      }
    }
  }
  
  // Convert to array and sort by score (highest first)
  return Object.values(themeScores).sort((a, b) => b.score - a.score);
}

// Get top N themes with scores above a threshold
export async function getTopThemes(
  detectedAspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
    score?: number;
  }>,
  options: {
    userId?: string;
    clusterId?: string;
    limit?: number;
    minScore?: number;
  } = {}
): Promise<ThemeScore[]> {
  const { limit = 5, minScore = 0.3 } = options;
  const scores = await calculateThemeScores(
    detectedAspects, 
    options.userId, 
    options.clusterId
  );
  
  return scores
    .filter(theme => theme.score >= minScore)
    .slice(0, limit);
}
