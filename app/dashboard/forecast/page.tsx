'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { format, addDays, startOfWeek } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type ForecastDay = {
  date: string;
  primaryTheme: string;
  intensity: number;
  keyTransits: Array<{
    aspect: string;
    planets: string[];
    orb: number;
    effect: string;
  }>;
  mood: string;
  advice: string;
  confidence: number;
};

type WeeklyForecast = {
  weekStart: string;
  days: ForecastDay[];
  overview: string;
  highlights: string[];
  lowEnergyDays: string[];
  powerDays: string[];
};

export default function WeeklyForecastPage() {
  const { isLoaded: userLoaded, user } = useUser();
  const [forecast, setForecast] = useState<WeeklyForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const currentWeekStart = addDays(weekStart, weekOffset * 7);
  const weekEnd = addDays(currentWeekStart, 6);

  useEffect(() => {
    if (!userLoaded) return;

    const fetchForecast = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/weekly-forecast?startDate=${currentWeekStart.toISOString()}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 404 && errorData.code === 'BIRTH_CHART_NOT_FOUND') {
            setError('Birth chart required. Please create your birth chart in profile settings first.');
          } else if (response.status === 401) {
            setError('Please sign in to view your forecast.');
          } else {
            throw new Error(errorData.error || 'Failed to fetch forecast');
          }
          return;
        }
        
        const data = await response.json();
        setForecast(data.weeklyForecast);
      } catch (err) {
        console.error('Error fetching forecast:', err);
        setError(err instanceof Error ? err.message : 'Failed to load forecast. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [userLoaded, currentWeekStart, weekOffset]);

  const getIntensityColor = (intensity: number) => {
    if (intensity < 0.33) return 'bg-green-500';
    if (intensity < 0.66) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMoodEmoji = (mood: string) => {
    const moodMap: Record<string, string> = {
      peaceful: '😌',
      energetic: '⚡',
      introspective: '🌌',
      social: '👥',
      creative: '🎨',
      focused: '🎯',
      emotional: '💫',
      transformative: '🦋',
    };
    return moodMap[mood.toLowerCase()] || '✨';
  };

  if (!userLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-600">
            Your Week Ahead
          </h1>
          <p className="text-muted-foreground">
            {format(currentWeekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </p>
          
          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setWeekOffset(prev => prev - 1)}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setWeekOffset(0)}
              disabled={loading || weekOffset === 0}
            >
              This Week
            </Button>
            <Button
              variant="outline"
              onClick={() => setWeekOffset(prev => prev + 1)}
              disabled={loading}
            >
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(7)].map((_, i) => (
              <Card key={i} className="h-64">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : forecast ? (
          <>
            {/* Overview Card */}
            <Card className="mb-8 bg-linear-to-br from-primary/5 to-background border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Weekly Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{forecast.overview}</p>
                
                {forecast.highlights.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Key Highlights</h3>
                    <ul className="space-y-2">
                      {forecast.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Days Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {forecast.days.map((day, i) => {
                const date = new Date(day.date);
                const isPowerDay = forecast.powerDays.includes(day.date);
                const isLowEnergyDay = forecast.lowEnergyDays.includes(day.date);
                
                return (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className={`h-full flex flex-col ${
                      isPowerDay ? 'border-2 border-yellow-500/50 bg-yellow-500/5' :
                      isLowEnergyDay ? 'border-2 border-blue-500/50 bg-blue-500/5' :
                      'bg-background/50'
                    }`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {format(date, 'EEEE')}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {format(date, 'MMM d')}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">
                              {getMoodEmoji(day.mood)}
                            </span>
                            {isPowerDay && (
                              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                                Power Day
                              </Badge>
                            )}
                            {isLowEnergyDay && (
                              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                                Low Energy
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Intensity</span>
                            <span>{Math.round(day.intensity * 100)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${getIntensityColor(day.intensity)}`}
                              style={{ width: `${day.intensity * 100}%` }}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="flex-1 flex flex-col">
                        <div className="mb-4">
                          <Badge variant="outline" className="text-sm font-normal">
                            {day.primaryTheme}
                          </Badge>
                        </div>
                        
                        <div className="mb-4 flex-1">
                          <p className="text-sm text-muted-foreground mb-2">
                            {day.advice}
                          </p>
                          
                          {day.keyTransits.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <h4 className="text-xs font-medium text-muted-foreground">Key Transits</h4>
                              <div className="space-y-1">
                                {day.keyTransits.map((transit, i) => (
                                  <div key={i} className="text-xs p-2 bg-muted/30 rounded">
                                    <div className="font-medium">
                                      {transit.planets.join(' ')} {transit.aspect}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {transit.effect}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-auto pt-2 border-t border-border/50">
                          <div className="flex justify-between items-center">
                            <span>Confidence</span>
                            <span>{Math.round(day.confidence * 100)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                            <div
                              className="h-1.5 rounded-full bg-primary"
                              style={{ width: `${day.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Week Navigation */}
            <div className="flex justify-center mt-8">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setWeekOffset(prev => prev - 1)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Previous Week
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setWeekOffset(0)}
                  disabled={weekOffset === 0}
                >
                  This Week
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setWeekOffset(prev => prev + 1)}
                >
                  Next Week <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
