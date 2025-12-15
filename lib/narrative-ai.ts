export interface NarrativeContext {
  transits: any[]
  personality: string
  natalChart: any
  recentHistory: string[]
  userGoals: string[]
}

interface PersonalityLens {
  processing: string
  strength: string
  challenge: string
  advice: string
}

interface ThemeActions {
  [key: string]: string
}

interface WeeklyFocuses {
  [key: string]: string
}

export class NarrativeAI {
  synthesizeDailyGuidance(context: NarrativeContext): string {
    const primaryTransit = this.identifyPrimaryTransit(context.transits)
    const personalityLens = this.getPersonalityLens(context.personality)
    const storyArc = this.buildStoryArc(primaryTransit, personalityLens, context)

    return this.generateNarrative(storyArc)
  }

  private identifyPrimaryTransit(transits: any[]) {
    // Find the most significant transit by intensity and orb
    return transits.sort((a, b) => b.intensity * (1 - b.orb / 10) - a.intensity * (1 - a.orb / 10))[0]
  }

  private getPersonalityLens(personality: string): PersonalityLens {
    const lenses: Record<string, PersonalityLens> = {
      INFJ: {
        processing: "internalize deeply",
        strength: "intuitive insight",
        challenge: "tendency to withdraw",
        advice: "trust your inner knowing while staying connected",
      },
      ENTJ: {
        processing: "strategize and execute",
        strength: "natural leadership",
        challenge: "impatience with obstacles",
        advice: "channel this energy into long-term vision",
      },
      // ... more personality types
    }

    return lenses[personality] || lenses["INFJ"]
  }

  private buildStoryArc(primaryTransit: any, personalityLens: any, context: NarrativeContext) {
    return {
      setup: `This ${primaryTransit.timeframe}, ${primaryTransit.planet1} ${primaryTransit.aspect} ${primaryTransit.planet2}`,
      conflict: primaryTransit.challenge || "creates tension that requires conscious navigation",
      personalFilter: `As an ${context.personality}, you ${personalityLens.processing}`,
      resolution: personalityLens.advice,
      actionStep: this.generateActionStep(primaryTransit, personalityLens),
    }
  }

  private generateActionStep(transit: any, personalityLens: PersonalityLens): string {
    // Generate specific, actionable guidance
    const actions: ThemeActions = {
      emotional_restriction: "Set one clear boundary today instead of avoiding the situation entirely",
      confidence_expansion: "Take one calculated risk that aligns with your long-term vision",
      power_struggle: "Channel this intensity into a creative project rather than confrontation",
    }

    const themeKey = transit.theme?.toLowerCase().replace(" ", "_") as string
    return (
      actions[themeKey] ||
      "Pay attention to how this energy manifests in your daily interactions"
    )
  }

  private generateNarrative(storyArc: any): string {
    return `${storyArc.setup}, stirring ${storyArc.conflict}. ${storyArc.personalFilter}, which means you may ${storyArc.challenge || "feel this intensely"}. ${storyArc.resolution}. Practical step: ${storyArc.actionStep}.`
  }

  synthesizeWeeklyTheme(context: NarrativeContext): string {
    const weeklyTransits = context.transits.filter((t) => t.duration === "week")
    const dominantTheme = this.extractDominantTheme(weeklyTransits)

    return `This week's cosmic theme: ${dominantTheme}. Your ${context.personality} nature will help you navigate this by ${this.getPersonalityLens(context.personality).strength}. Focus on ${this.generateWeeklyFocus(dominantTheme, context.personality)}.`
  }

  private extractDominantTheme(transits: any[]): string {
    // Analyze patterns across multiple transits
    const themes = transits.map((t) => t.theme)
    const themeCount = themes.reduce((acc: Record<string, number>, theme) => {
      acc[theme] = (acc[theme] || 0) + 1
      return acc
    }, {})

    return Object.keys(themeCount).sort((a, b) => themeCount[b] - themeCount[a])[0] || "Personal Growth"
  }

  private generateWeeklyFocus(theme: string, personality: string): string {
    const focuses: WeeklyFocuses = {
      "Emotional Restriction": "building emotional resilience and healthy boundaries",
      "Confidence Expansion": "taking strategic action on your biggest goals",
      "Power Struggle": "transforming conflict into creative breakthrough",
    }

    return focuses[theme] || "conscious growth and authentic self-expression"
  }
}
