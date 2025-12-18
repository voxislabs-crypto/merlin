"use client";

import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Info, Zap } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { formatConfidenceScore } from '@/lib/validation';
import { updateResonance } from '@/lib/resonance';
import type { ResonanceInsightsProps } from '@/types/resonance';

interface Theme {
  id: string;
  name: string;
  score: number;
  color: string;
  emoji?: string;
  explanation?: string;
}

interface ResonanceData {
  primaryTheme: Theme;
  secondaryThemes: Theme[];
  confidence?: number;
}

interface ThemeData {
  primaryTheme: Theme;
  secondaryThemes: Theme[];
  compatibility: number;
  insights: string[];
}

interface ThemeCardProps {
  theme: Theme;
  isPrimary?: boolean;
  onFeedback?: (themeId: string, score: number) => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ theme, isPrimary = false, onFeedback }) => {
  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);

  const handleFeedback = (score: number) => {
    if (onFeedback) {
      onFeedback(theme.id, score);
      setFeedbackGiven(true);
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border ${isPrimary ? 'border-2 border-purple-500' : 'border-gray-200 dark:border-gray-700'}`}
      style={{ backgroundColor: theme.color ? `${theme.color}20` : 'transparent' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {theme.emoji && (
            <span className="text-2xl">{theme.emoji}</span>
          )}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{theme.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Score: {Math.round(theme.score * 100)}%
            </p>
          </div>
        </div>
        {!feedbackGiven && onFeedback && (
          <div className="flex gap-1">
            <button
              onClick={() => handleFeedback(1)}
              className="p-1.5 rounded-full hover:bg-green-500/20"
              aria-label="Accurate"
            >
              <ThumbsUp className="w-4 h-4 text-green-400" />
            </button>
            <button
              onClick={() => handleFeedback(-1)}
              className="p-1.5 rounded-full hover:bg-red-500/20"
              aria-label="Not accurate"
            >
              <ThumbsDown className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}
      </div>
      {theme.explanation && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {theme.explanation}
        </p>
      )}
    </div>
  );
};

export const ResonanceInsights: React.FC<ResonanceInsightsProps> = ({
  userId,
  mbtiType,
  currentThemes = [],
  birthData
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resonanceData, setResonanceData] = useState<ResonanceData | null>(null);
  const [themeData, setThemeData] = useState<ThemeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDemoData = useCallback(async (): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Demo data
      const demoResonance: ResonanceData = {
        primaryTheme: {
          id: 'cosmic_harmony',
          name: 'Cosmic Harmony',
          score: 0.87,
          color: '#8b5cf6',
          emoji: '🌌',
          explanation: 'Your Scorpio Moon is currently activated by Pluto, bringing deep emotional transformation and the opportunity to release old patterns.'
        },
        secondaryThemes: [
          {
            id: 'lunar_balance',
            name: 'Lunar Balance',
            score: 0.73,
            color: '#ec4899',
            emoji: '🌕',
            explanation: 'Heightened psychic sensitivity and intuitive downloads are available now.'
          },
          {
            id: 'solar_energy',
            name: 'Solar Energy',
            score: 0.65,
            color: '#f59e0b',
            emoji: '☀️',
            explanation: 'Emotional healing and release of past traumas is supported.'
          }
        ],
        confidence: 0.85,
      };

      const demoThemes = {
        primaryTheme: demoResonance.primaryTheme,
        secondaryThemes: demoResonance.secondaryThemes,
        compatibility: 0.8,
        insights: ['Insight 1', 'Insight 2', 'Insight 3']
      };

      setResonanceData(demoResonance);
      setThemeData(demoThemes);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load resonance data');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDemoData();
  }, [loadDemoData]);

  const handleThemeFeedback = useCallback(async (themeId: string, score: number) => {
    try {
      if (userId) {
        await updateResonance(userId, themeId, score, mbtiType);
        // Update local state to reflect the feedback
        setResonanceData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            primaryTheme: prev.primaryTheme.id === themeId
              ? { ...prev.primaryTheme, score: Math.min(1, Math.max(0, prev.primaryTheme.score + (score > 0 ? 0.1 : -0.1))) }
              : prev.primaryTheme,
            secondaryThemes: prev.secondaryThemes.map(theme =>
              theme.id === themeId
                ? { ...theme, score: Math.min(1, Math.max(0, theme.score + (score > 0 ? 0.1 : -0.1))) }
                : theme
            )
          };
        });
      }
    } catch (err) {
      console.error('Error updating theme feedback:', err);
    }
  }, [userId, mbtiType]);

  const confidenceScore = resonanceData?.confidence ?? 0;

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!themeData) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No theme data available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel p-6 rounded-xl backdrop-blur-lg border border-white/10 shadow-lg"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Resonance Insights
        </h2>
        {confidenceScore > 0 && (
          <div className="flex items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mr-2">
              Confidence:
            </div>
            <div className="w-24 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="h-2.5 rounded-full"
                style={{
                  width: `${Math.round(confidenceScore * 100)}%`,
                  backgroundColor: themeData?.primaryTheme?.color || '#8b5cf6'
                }}
              />
            </div>
            <span
              className="ml-2 text-xs font-medium min-w-[40px] text-right"
              style={{ color: themeData?.primaryTheme?.color || '#8b5cf6' }}
            >
              {Math.round(confidenceScore * 100)}%
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-24 bg-white/5 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-20 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-20 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-8">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {themeData?.primaryTheme && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ThemeCard
                theme={themeData.primaryTheme}
                isPrimary
                onFeedback={handleThemeFeedback}
              />
            </motion.div>
          )}

          {themeData && themeData.secondaryThemes && themeData.secondaryThemes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themeData.secondaryThemes.map((theme, index) => (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <ThemeCard
                    theme={theme}
                    onFeedback={handleThemeFeedback}
                  />
                </motion.div>
              ))}
            </div>
          )}

          <div className="pt-4 mt-4 border-t border-white/10 text-xs text-white/60">
            <p>Your feedback helps improve future insights. Click the thumbs up/down to rate each theme's accuracy.</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
