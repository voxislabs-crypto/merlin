import { type ThemeScore } from './theme-utils.js';

declare global {
  interface Window {
    __THEME_VISUALIZER_LOADED__?: boolean;
  }
}

export function formatThemeScores(scores: ThemeScore[] = []): string {
  if (!scores || scores.length === 0) {
    return 'No theme data available';
  }

  return scores
    .map(score => {
      const factors = [
        `Base: ${(score.factors.base * 100).toFixed(0)}%`,
        `Orb: ${(score.factors.orb * 100).toFixed(0)}%`,
        `Planet: ${(score.factors.planet * 100).toFixed(0)}%`,
        `Resonance: ${(score.factors.resonance * 100).toFixed(0)}%`
      ];
      
      return `${score.theme.name}: ${(score.score * 100).toFixed(0)}%\n` +
             `  ${score.theme.description}\n` +
             `  Factors: ${factors.join(', ')}\n`;
    })
    .join('\n');
}

export function getThemeInsights(scores: ThemeScore[] = []): string {
  if (!scores || scores.length === 0) {
    return '';
  }

  const topTheme = scores[0];
  const insights: string[] = [];
  
  // Main theme insight
  insights.push(`🌠 Primary Focus: ${topTheme.theme.name}`);
  insights.push(`   ${topTheme.theme.description}`);
  
  // Secondary themes
  if (scores.length > 1) {
    insights.push('\n🔍 Secondary Themes:');
    for (let i = 1; i < Math.min(3, scores.length); i++) {
      const theme = scores[i];
      insights.push(`- ${theme.theme.name} (${(theme.score * 100).toFixed(0)}%): ${theme.theme.description}`);
    }
  }
  
  // Key influences
  const topFactors = Object.entries(topTheme.factors)
    .filter(([key]) => key !== 'base')
    .sort((a, b) => b[1] - a[1]);
    
  if (topFactors.length > 0 && topFactors[0][1] > 0.3) {
    insights.push(`\n💫 Key Influence: ${formatFactorName(topFactors[0][0])}`);
    insights.push(`   This suggests that ${getFactorInsight(topFactors[0][0], topTheme.theme.name)}`);
  }
  
  // Keywords
  if (topTheme.theme.keywords && topTheme.theme.keywords.length > 0) {
    insights.push(`\n🔑 Keywords: ${topTheme.theme.keywords.join(', ')}`);
  }
  
  return insights.join('\n');
}

function formatFactorName(factor: string): string {
  return factor
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getFactorInsight(factor: string, themeName: string): string {
  const factorInsights: Record<string, string> = {
    orb: `the strength of this theme is strongly influenced by how exact the aspect is.`,
    planet: `the planetary bodies involved are particularly significant for this theme.`,
    resonance: `your personal resonance with this theme is a key factor in its importance.`
  };
  
  return factorInsights[factor] || `this theme is influenced by ${factor}.`;
}

export function getThemeEmoji(themeName: string): string {
  const emojiMap: Record<string, string> = {
    'Personal Growth': '🌱',
    'Challenge': '🧗',
    'Partnerships': '💑',
    'Career & Public Life': '💼',
    'Emotional Depth': '🌊',
    'Communication & Learning': '📚',
    'Transformation': '🦋',
    'Creativity': '🎨',
    'Spiritual Growth': '✨',
    'Material Success': '💰',
    'Karmic Lessons': '🔄'
  };
  
  return emojiMap[themeName] || '🔮';
}

export function generateThemeSummary(scores: ThemeScore[]): string {
  if (!scores || scores.length === 0) {
    return '';
  }
  
  const topThemes = scores.slice(0, 3);
  return topThemes
    .map(theme => 
      `${getThemeEmoji(theme.theme.name)} ${theme.theme.name} (${(theme.score * 100).toFixed(0)}%)`
    )
    .join('  •  ');
}
