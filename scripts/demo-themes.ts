import { detectAspectsWithResonance } from '../lib/aspect-detection.js';
import { formatThemeScores, getThemeInsights, generateThemeSummary } from '../lib/theme-visualizer.js';

// Example planet positions (simplified for demo)
const examplePositions = {
  SUN: { longitude: 120 },
  MOON: { longitude: 45 },
  MERCURY: { longitude: 110 },
  VENUS: { longitude: 90 },
  MARS: { longitude: 240 },
  JUPITER: { longitude: 180 },
  SATURN: { longitude: 300 },
  URANUS: { longitude: 20 },
  NEPTUNE: { longitude: 340 },
  PLUTO: { longitude: 280 },
  NORTH_NODE: { longitude: 150 },
  SOUTH_NODE: { longitude: 330 },
  CHIRON: { longitude: 60 },
  VERTEX: { longitude: 200 },
  FORTUNE: { longitude: 30 },
  JUNO: { longitude: 100 },
  DESCENDANT: { longitude: 270 },
  MIDHEAVEN: { longitude: 0 },
  PART_OF_FORTUNE: { longitude: 45 }
};

async function runDemo() {
  console.log('🔮 Astrological Theme Analysis Demo\n');
  
  // Detect aspects with theme analysis
  const aspects = await detectAspectsWithResonance(examplePositions, {
    userId: 'demo-user-123',
    includeThemes: true,
    themeOptions: {
      limit: 5,
      minScore: 0.2
    }
  });

  // Display results
  console.log('=== DETECTED ASPECTS ===');
  for (const aspect of aspects) {
    console.log(`\n${aspect.planet1} ${aspect.aspect} ${aspect.planet2}`);
    console.log(`- Orb: ${aspect.orb.toFixed(2)}°`);
    console.log(`- Score: ${(aspect.score || 0).toFixed(2)}`);
    
    if (aspect.themes && aspect.themes.length > 0) {
      console.log('\n  THEMES:');
      console.log(generateThemeSummary(aspect.themes));
      
      // Show insights for the top theme
      const topTheme = aspect.themes[0];
      if (topTheme) {
        console.log(`\n  💡 ${topTheme.theme.name} Insights:`);
        console.log(`  ${topTheme.theme.description}`);
        console.log(`  Strength: ${(topTheme.score * 100).toFixed(0)}%`);
      }
    }
    console.log('\n' + '─'.repeat(50));
  }
  
  // Get overall theme insights
  const allThemes = aspects.flatMap(a => a.themes || []);
  const uniqueThemes = Array.from(new Map(allThemes.map(t => [t.theme.id, t])).values());
  
  if (uniqueThemes.length > 0) {
    console.log('\n=== OVERALL THEME ANALYSIS ===');
    console.log(getThemeInsights(uniqueThemes));
    
    console.log('\n=== THEME SCORES ===');
    console.log(formatThemeScores(uniqueThemes.sort((a, b) => b.score - a.score)));
  }
}

runDemo().catch(console.error);
