import { Forecast } from './forecast.js';

export interface NarrativeOptions {
  style?: 'mystical' | 'practical' | 'poetic' | 'scientific';
  length?: 'brief' | 'moderate' | 'detailed';
  includeAdvice?: boolean;
  includeSymbolism?: boolean;
  userPreferences?: {
    name?: string;
    preferredPronouns?: {
      subjective: string; // they
      objective: string;  // them
      possessive: string; // their
    };
  };
}

export interface Narrative {
  title: string;
  summary: string;
  details: string[];
  advice?: string[];
  symbolism?: {
    symbols: string[];
    elements: string[];
    archetypes: string[];
  };
  tags: string[];
  mood: {
    positive: number; // 0-1
    energetic: number; // 0-1
    challenging: number; // 0-1
    transformative: number; // 0-1
  };
}

export interface NarrativeTemplate {
  id: string;
  themeId: string;
  style: string;
  templates: {
    title: string[];
    summary: string[];
    details: string[];
    advice: string[];
  };
  conditions?: {
    minScore?: number;
    maxScore?: number;
    requiredAspects?: string[];
    requiredPlanets?: string[];
  };
}
