import { Theme, ThemeScore } from '../theme-utils.js';
import { DetectedAspect } from '../aspect-detection.js';

export interface UserProfile {
  userId: string;
  birthDate: Date;
  birthLocation: {
    latitude: number;
    longitude: number;
  };
  // Add other user-specific preferences and data
}

export interface Forecast {
  date: Date;
  primaryTheme: {
    theme: Theme;
    score: number;
  };
  supportingThemes: Array<{
    theme: Theme;
    score: number;
  }>;
  aspects: Array<DetectedAspect & {
    resonanceScore: number;
    orbTightness: number; // 0-1, 1 being exact
    planetImportance: number; // 0-1, based on planet weights
  }>;
  confidence: {
    score: number; // 0-1
    factors: {
      western: number;
      vedic: number;
      wholeSign: number;
      resonance: number;
    };
  };
  resonanceStats: {
    personal: number;
    cluster: number;
    global: number;
  };
}

export interface ForecastOptions {
  includeThemes?: boolean;
  themeOptions?: {
    limit?: number;
    minScore?: number;
  };
  includeAspects?: boolean;
  includeHouses?: boolean;
  houseSystem?: 'Placidus' | 'Koch' | 'Porphyry' | 'Regiomontanus' | 'Whole';
  zodiacType?: 'Tropical' | 'Sidereal';
}
