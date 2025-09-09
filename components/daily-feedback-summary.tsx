"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Star, Target, Calendar } from "lucide-react"
import { resonanceDB } from "@/lib/resonance-database"

interface DailyFeedbackSummaryProps {
  userId: string
}

export function DailyFeedbackSummary({ userId }: DailyFeedbackSummaryProps) {
  const [accuracyStats, setAccuracyStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAccuracyStats()
  }, [userId])

  const loadAccuracyStats = async () => {
    try {
      const stats = await resonanceDB.getUserAccuracyStats(userId, 30)
      setAccuracyStats(stats)
    } catch (error) {
      console.error("Failed to load accuracy stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!accuracyStats || accuracyStats.totalFeedbacks === 0) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Star className="w-4 h-4 mr-2 text-primary" />
            Start Your Feedback Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Help Merlin learn your cosmic patterns by providing feedback on daily forecasts.
          </p>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Target className="w-3 h-3" />
            <span>Goal: Build your personal accuracy profile</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-violet-600" />
            Your Cosmic Accuracy
          </div>
          <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
            <Calendar className="w-3 h-3 mr-1" />
            30 days
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Accuracy */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Overall Accuracy</span>
            <span className="text-lg font-bold text-violet-700 dark:text-violet-300">
              {Math.round(accuracyStats.overallAccuracy * 100)}%
            </span>
          </div>
          <Progress value={accuracyStats.overallAccuracy * 100} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Based on {accuracyStats.totalFeedbacks} feedback{accuracyStats.totalFeedbacks !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Strongest Resonances */}
        {accuracyStats.strongestResonances.length > 0 && (
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Strongest Resonances</p>
            <div className="space-y-1">
              {accuracyStats.strongestResonances.slice(0, 3).map((resonance: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {resonance.aspectId.replace(/_/g, " ")} • {resonance.theme}
                  </span>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {Math.round(resonance.accuracy * 100)}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Progress */}
        <div className="pt-3 border-t border-violet-200 dark:border-violet-800">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Merlin is learning your patterns</span>
            <span className="text-violet-600 dark:text-violet-400 font-medium">
              {accuracyStats.totalFeedbacks < 10 ? "Building profile..." : "Profile established"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
